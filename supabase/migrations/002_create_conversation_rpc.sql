-- Create conversations through a narrowly scoped SECURITY DEFINER function.
-- This keeps auth checks in the database and creates the owner membership atomically.
create or replace function public.htc_create_conversation(
  p_kind text,
  p_title text default null
)
returns public.htc_conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_conversation public.htc_conversations;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_kind not in ('private', 'group') then
    raise exception 'Invalid conversation type';
  end if;

  insert into public.htc_conversations(kind, title, created_by)
  values (p_kind, nullif(trim(p_title), ''), v_user_id)
  returning * into v_conversation;

  insert into public.htc_conversation_members(conversation_id, user_id, member_role)
  values (v_conversation.id, v_user_id, 'owner');

  return v_conversation;
end;
$$;

revoke all on function public.htc_create_conversation(text, text) from public;
grant execute on function public.htc_create_conversation(text, text) to authenticated;
