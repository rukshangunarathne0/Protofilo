-- Safe exact-phone lookup for starting private conversations.
create or replace function public.htc_find_user_by_phone(p_phone text)
returns table(user_id uuid, display_name text, phone text)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    coalesce(nullif(u.raw_user_meta_data->>'display_name',''), u.raw_user_meta_data->>'phone'),
    u.raw_user_meta_data->>'phone'
  from auth.users u
  where auth.uid() is not null
    and u.raw_user_meta_data->>'phone' = p_phone
    and u.id <> auth.uid()
  limit 1;
$$;

revoke all on function public.htc_find_user_by_phone(text) from public;
grant execute on function public.htc_find_user_by_phone(text) to authenticated;
