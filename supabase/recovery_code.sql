-- Happy Time Connect: four-digit recovery code with attempt limiting
-- Run this whole file once in Supabase SQL Editor.

create extension if not exists pgcrypto with schema extensions;

alter table public.profiles
  add column if not exists recovery_code_hash text;

create table if not exists public.recovery_reset_attempts (
  phone text primary key,
  attempt_count integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.recovery_reset_attempts enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, phone, display_name, recovery_code_hash)
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone'),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.raw_user_meta_data ->> 'recovery_code_hash'
  )
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.profiles.phone),
        recovery_code_hash = coalesce(excluded.recovery_code_hash, public.profiles.recovery_code_hash),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.reset_password_with_recovery_code(
  p_phone text,
  p_recovery_hash text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  v_user_id uuid;
  v_attempts integer;
  v_locked_until timestamptz;
begin
  if p_phone is null or p_recovery_hash is null
     or p_new_password is null
     or p_new_password !~ '^[A-Za-z0-9]{6}$' then
    return false;
  end if;

  insert into public.recovery_reset_attempts(phone)
  values (p_phone)
  on conflict (phone) do nothing;

  select attempt_count, locked_until
    into v_attempts, v_locked_until
  from public.recovery_reset_attempts
  where phone = p_phone
  for update;

  if v_locked_until is not null and v_locked_until > now() then
    return false;
  end if;

  select id into v_user_id
  from public.profiles
  where phone = p_phone
    and recovery_code_hash = p_recovery_hash
  limit 1;

  if v_user_id is null then
    update public.recovery_reset_attempts
    set attempt_count = attempt_count + 1,
        locked_until = case when attempt_count + 1 >= 5 then now() + interval '15 minutes' else null end,
        updated_at = now()
    where phone = p_phone;
    return false;
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = v_user_id;

  delete from public.recovery_reset_attempts where phone = p_phone;
  return found;
end;
$$;

revoke all on function public.reset_password_with_recovery_code(text, text, text) from public;
grant execute on function public.reset_password_with_recovery_code(text, text, text) to anon, authenticated;
