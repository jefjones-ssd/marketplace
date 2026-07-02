-- Conversations: one thread per buyer/listing pair, linking messages together

-- ------------------------------------------------------------------
-- conversations
-- ------------------------------------------------------------------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings (id) on delete cascade not null,
  buyer_id uuid references profiles (id) not null,
  seller_id uuid references profiles (id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (listing_id, buyer_id)
);

alter table conversations enable row level security;

create trigger set_conversations_updated_at
  before update on conversations
  for each row
  execute function set_updated_at();

-- ------------------------------------------------------------------
-- messages: link to conversations
-- ------------------------------------------------------------------
-- Note: conversation_id is not null — this will fail if messages table has existing rows. Safe for tester build with no real data.
alter table messages
  add column conversation_id uuid references conversations (id) on delete cascade not null;

-- ------------------------------------------------------------------
-- conversations RLS
-- ------------------------------------------------------------------
create policy "conversations_select_own"
  on conversations for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "conversations_insert_own"
  on conversations for insert
  with check (buyer_id = auth.uid());

-- No update or delete on conversations.

-- ------------------------------------------------------------------
-- messages RLS: require sender to be a conversation participant
-- ------------------------------------------------------------------
drop policy if exists "messages_insert_own" on messages;

create policy "messages_insert_own"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );
