-- Happy Time Connect: safe conversation creation function
-- Run after supabase/schema.sql in the NEW Happy Time Connect project.

create or replace function public.create_chat_conversation(
  p_title text,
  p_type text,
  p_member_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_conversation_id uuid;
  v_member_id uuid;
begin
  if v_user_id is null then
    raise exception 'Sign in is required';
  end if;

  if p_type not in ('direct', 'group', 'secret') then
    raise exception 'Invalid conversation type';
  end if;

  if p_type = 'direct' and (
    select count(distinct x) from unnest(coalesce(p_member_ids, array[]::uuid[])) as t(x)
    where x is not null and x <> v_user_id
  ) <> 1 then
    raise exception 'A direct chat must have exactly one other participant';
  end if;

  if p_type = 'group' and (
    select count(distinct x) from unnest(coalesce(p_member_ids, array[]::uuid[])) as t(x)
    where x is not null and x <> v_user_id
  ) < 1 then
    raise exception 'A group must include at least one other participant';
  end if;

  insert into public.conversations (title, type, created_by)
  values (nullif(trim(p_title), ''), p_type, v_user_id)
  returning id into v_conversation_id;

  insert into public.conversation_members (conversation_id, user_id, role)
  values (v_conversation_id, v_user_id, 'owner');

  for v_member_id in
    select distinct x
    from unnest(coalesce(p_member_ids, array[]::uuid[]) || array[v_user_id]) as t(x)
    where x is not null and x <> v_user_id
  loop
    if not exists (select 1 from auth.users u where u.id = v_member_id) then
      raise exception 'A selected participant does not exist';
    end if;

    insert into public.conversation_members (conversation_id, user_id, role)
    values (v_conversation_id, v_member_id, 'member');
  end loop;

  return v_conversation_id;
end;
$$;

revoke all on function public.create_chat_conversation(text, text, uuid[]) from public;
grant execute on function public.create_chat_conversation(text, text, uuid[]) to authenticated;
