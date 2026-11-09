-- WebRTC call signaling for Happy Time Connect
create table if not exists public.htc_call_signals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.htc_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  signal_type text not null check (signal_type in ('offer','answer','ice-candidate','reject','hangup')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint htc_call_signals_not_self check (sender_id <> recipient_id)
);

create index if not exists htc_call_signals_recipient_created_idx
  on public.htc_call_signals(recipient_id, created_at desc);

alter table public.htc_call_signals enable row level security;

drop policy if exists "Call participants can read their signals" on public.htc_call_signals;
create policy "Call participants can read their signals"
on public.htc_call_signals for select to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Conversation members can send call signals" on public.htc_call_signals;
create policy "Conversation members can send call signals"
on public.htc_call_signals for insert to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.htc_conversation_members m
    where m.conversation_id = htc_call_signals.conversation_id
      and m.user_id = auth.uid()
  )
  and exists (
    select 1 from public.htc_conversation_members m
    where m.conversation_id = htc_call_signals.conversation_id
      and m.user_id = htc_call_signals.recipient_id
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'htc_call_signals'
  ) then
    alter publication supabase_realtime add table public.htc_call_signals;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication not found; enable Realtime for htc_call_signals.';
end $$;
