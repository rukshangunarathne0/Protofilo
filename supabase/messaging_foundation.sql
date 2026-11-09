-- Happy Time Connect: secure messaging foundation
-- Run this migration in Supabase SQL Editor. Safe to run once on this project.

create extension if not exists pgcrypto;

create table if not exists public.htc_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct','group')),
  title text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.htc_conversation_members (
  conversation_id uuid not null references public.htc_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id,user_id)
);

create table if not exists public.htc_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.htc_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  message_type text not null default 'text' check (message_type in ('text','system')),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists htc_messages_conversation_created_idx
  on public.htc_messages(conversation_id, created_at desc);
create index if not exists htc_members_user_idx
  on public.htc_conversation_members(user_id, conversation_id);

create or replace function public.htc_is_conversation_member(p_conversation_id uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.htc_conversation_members m
    where m.conversation_id = p_conversation_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.htc_create_conversation(p_kind text, p_title text default null, p_member_ids uuid[] default '{}')
returns uuid language plpgsql security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_kind not in ('direct','group') then raise exception 'Invalid conversation type'; end if;
  if p_kind = 'group' and coalesce(trim(p_title),'') = '' then raise exception 'Group title required'; end if;
  if p_kind = 'direct' and cardinality(coalesce(p_member_ids,'{}'::uuid[])) <> 1 then
    raise exception 'A direct chat requires exactly one other member';
  end if;
  if auth.uid() = any(coalesce(p_member_ids,'{}'::uuid[])) then
    raise exception 'Do not include yourself in the member list';
  end if;
  insert into public.htc_conversations(kind,title,created_by)
  values (p_kind, nullif(trim(p_title),''), auth.uid()) returning id into v_id;
  insert into public.htc_conversation_members(conversation_id,user_id,role)
  values (v_id,auth.uid(),'owner');
  insert into public.htc_conversation_members(conversation_id,user_id,role)
  select v_id, x, 'member'
  from (select distinct unnest(coalesce(p_member_ids,'{}'::uuid[])) as x) s
  join auth.users u on u.id=s.x;
  return v_id;
end;
$$;

alter table public.htc_conversations enable row level security;
alter table public.htc_conversation_members enable row level security;
alter table public.htc_messages enable row level security;

drop policy if exists "Members can read conversations" on public.htc_conversations;
create policy "Members can read conversations" on public.htc_conversations
for select to authenticated using (public.htc_is_conversation_member(id));

drop policy if exists "Members can read member list" on public.htc_conversation_members;
create policy "Members can read member list" on public.htc_conversation_members
for select to authenticated using (public.htc_is_conversation_member(conversation_id));

drop policy if exists "Members can read messages" on public.htc_messages;
create policy "Members can read messages" on public.htc_messages
for select to authenticated using (public.htc_is_conversation_member(conversation_id));

drop policy if exists "Members can send own messages" on public.htc_messages;
create policy "Members can send own messages" on public.htc_messages
for insert to authenticated
with check (sender_id = auth.uid() and public.htc_is_conversation_member(conversation_id));

drop policy if exists "Senders can edit own messages" on public.htc_messages;
create policy "Senders can edit own messages" on public.htc_messages
for update to authenticated
using (sender_id = auth.uid() and deleted_at is null)
with check (sender_id = auth.uid() and public.htc_is_conversation_member(conversation_id));

grant select on public.htc_conversations, public.htc_conversation_members, public.htc_messages to authenticated;
grant insert, update on public.htc_messages to authenticated;
grant execute on function public.htc_is_conversation_member(uuid) to authenticated;
grant execute on function public.htc_create_conversation(text,text,uuid[]) to authenticated;

-- Private file bucket. Policies only allow a signed-in user to access their own user-id folder.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('htc-private','htc-private',false,53687091200,
  array['image/jpeg','image/png','image/webp','video/mp4','audio/mpeg','audio/mp4','audio/webm','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Users upload own HTC files" on storage.objects;
create policy "Users upload own HTC files" on storage.objects
for insert to authenticated with check (bucket_id='htc-private' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Users read own HTC files" on storage.objects;
create policy "Users read own HTC files" on storage.objects
for select to authenticated using (bucket_id='htc-private' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Users delete own HTC files" on storage.objects;
create policy "Users delete own HTC files" on storage.objects
for delete to authenticated using (bucket_id='htc-private' and (storage.foldername(name))[1]=auth.uid()::text);
