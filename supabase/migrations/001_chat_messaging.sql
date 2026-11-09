-- Happy Time Connect: private and group text messaging
-- Run this file once in Supabase SQL Editor. No file storage is used.

create table if not exists public.htc_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('private','group')),
  title text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.htc_conversation_members (
  conversation_id uuid not null references public.htc_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.htc_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.htc_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);

create index if not exists htc_messages_conversation_created_idx
  on public.htc_messages (conversation_id, created_at desc);
create index if not exists htc_members_user_idx
  on public.htc_conversation_members (user_id);

alter table public.htc_conversations enable row level security;
alter table public.htc_conversation_members enable row level security;
alter table public.htc_messages enable row level security;

-- SECURITY DEFINER helper avoids recursive RLS evaluation on the membership table.
create or replace function public.htc_is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.htc_conversation_members
    where conversation_id = p_conversation_id and user_id = auth.uid()
  );
$$;
revoke all on function public.htc_is_conversation_member(uuid) from public;
grant execute on function public.htc_is_conversation_member(uuid) to authenticated;

drop policy if exists "htc conversations visible to members" on public.htc_conversations;
create policy "htc conversations visible to members"
on public.htc_conversations for select to authenticated
using (public.htc_is_conversation_member(id));

drop policy if exists "htc users create conversations" on public.htc_conversations;
create policy "htc users create conversations"
on public.htc_conversations for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "htc members visible to conversation members" on public.htc_conversation_members;
create policy "htc members visible to conversation members"
on public.htc_conversation_members for select to authenticated
using (user_id = auth.uid() or public.htc_is_conversation_member(conversation_id));

drop policy if exists "htc users add themselves as owner" on public.htc_conversation_members;
create policy "htc users add themselves as owner"
on public.htc_conversation_members for insert to authenticated
with check (
  user_id = auth.uid()
  and member_role = 'owner'
  and exists (
    select 1 from public.htc_conversations c
    where c.id = conversation_id and c.created_by = auth.uid()
  )
);

drop policy if exists "htc messages visible to members" on public.htc_messages;
create policy "htc messages visible to members"
on public.htc_messages for select to authenticated
using (public.htc_is_conversation_member(conversation_id));

drop policy if exists "htc members send messages" on public.htc_messages;
create policy "htc members send messages"
on public.htc_messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.htc_is_conversation_member(conversation_id)
);

-- Add another registered user to a conversation only when called by its owner/admin.
create or replace function public.htc_add_conversation_member(
  p_conversation_id uuid,
  p_user_id uuid,
  p_role text default 'member'
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_role not in ('admin','member') then
    raise exception 'Invalid member role';
  end if;
  if not exists (
    select 1 from public.htc_conversation_members
    where conversation_id = p_conversation_id
      and user_id = auth.uid()
      and member_role in ('owner','admin')
  ) then
    raise exception 'Only conversation admins can add members';
  end if;
  insert into public.htc_conversation_members(conversation_id,user_id,member_role)
  values (p_conversation_id,p_user_id,p_role)
  on conflict (conversation_id,user_id) do nothing;
  return true;
end;
$$;

revoke all on function public.htc_add_conversation_member(uuid,uuid,text) from public;
grant execute on function public.htc_add_conversation_member(uuid,uuid,text) to authenticated;

grant select, insert on public.htc_conversations to authenticated;
grant select, insert on public.htc_conversation_members to authenticated;
grant select, insert on public.htc_messages to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'htc_messages'
  ) then
    alter publication supabase_realtime add table public.htc_messages;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication not found; enable Realtime for htc_messages in Supabase Dashboard.';
end $$;
