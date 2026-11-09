-- Happy Time Connect: initial messaging database
-- Run this in Supabase SQL Editor for the NEW Happy Time Connect project only.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  type text not null check (type in ('direct', 'group', 'secret')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  body text,
  message_type text not null default 'text'
    check (message_type in ('text', 'image', 'video', 'document', 'audio', 'voice', 'system')),
  file_path text,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_body_or_file check (body is not null or file_path is not null)
);

create index if not exists conversation_members_user_idx
  on public.conversation_members(user_id, conversation_id);
create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Profiles visible to signed-in users" on public.profiles;
create policy "Profiles visible to signed-in users"
on public.profiles for select to authenticated using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Members can view their conversations" on public.conversations;
create policy "Members can view their conversations"
on public.conversations for select to authenticated
using (exists (
  select 1 from public.conversation_members cm
  where cm.conversation_id = id and cm.user_id = auth.uid()
));

drop policy if exists "Signed-in users can create conversations" on public.conversations;
create policy "Signed-in users can create conversations"
on public.conversations for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "Members can view membership list" on public.conversation_members;
create policy "Members can view membership list"
on public.conversation_members for select to authenticated
using (exists (
  select 1 from public.conversation_members mine
  where mine.conversation_id = conversation_id and mine.user_id = auth.uid()
));

drop policy if exists "Conversation members can read messages" on public.messages;
create policy "Conversation members can read messages"
on public.messages for select to authenticated
using (exists (
  select 1 from public.conversation_members cm
  where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
));

drop policy if exists "Members can send messages as themselves" on public.messages;
create policy "Members can send messages as themselves"
on public.messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "Senders can edit their own messages" on public.messages;
create policy "Senders can edit their own messages"
on public.messages for update to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

-- Membership creation/invitations and secret-chat access will be added
-- through controlled database functions in the next implementation step.
