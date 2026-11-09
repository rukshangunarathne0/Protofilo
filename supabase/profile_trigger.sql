-- Automatically create a profile after a new Supabase Auth user is created.
-- Run in the Happy Time Connect Supabase SQL Editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, phone, display_name)
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone'),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
