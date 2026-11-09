-- Keep group membership notifications live and accept common phone formats.
create or replace function public.htc_find_user_by_phone(p_phone text)
returns table(user_id uuid, display_name text, phone text)
language sql
stable
security definer
set search_path = public
as $$
  with requested as (
    select case
      when left(digits, 2) = '00' then substr(digits, 3)
      when left(digits, 1) = '0' then '88' || digits
      else digits
    end as normalized
    from (select regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') as digits) x
  )
  select
    u.id,
    coalesce(nullif(u.raw_user_meta_data->>'display_name',''), u.raw_user_meta_data->>'phone'),
    u.raw_user_meta_data->>'phone'
  from auth.users u, requested r
  where auth.uid() is not null
    and case
      when left(regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''), '[^0-9]', '', 'g'), 2) = '00'
        then substr(regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''), '[^0-9]', '', 'g'), 3)
      when left(regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''), '[^0-9]', '', 'g'), 1) = '0'
        then '88' || regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''), '[^0-9]', '', 'g')
      else regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''), '[^0-9]', '', 'g')
    end = r.normalized
    and u.id <> auth.uid()
  limit 1;
$$;

revoke all on function public.htc_find_user_by_phone(text) from public;
grant execute on function public.htc_find_user_by_phone(text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'htc_conversation_members'
  ) then
    alter publication supabase_realtime add table public.htc_conversation_members;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication not found; enable Realtime for htc_conversation_members.';
end $$;
