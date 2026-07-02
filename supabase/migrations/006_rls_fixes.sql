-- Fixes from RLS audit: close self-verification, message spoofing, and
-- conversation-forgery gaps identified in migrations 002 and 005.

-- ------------------------------------------------------------------
-- Fix 1: profiles — prevent clients from updating verification_status,
-- rating_average, or rating_count directly.
-- ------------------------------------------------------------------
drop policy if exists "profiles_update_own" on profiles;

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid())
  with check (
    verification_status = (select verification_status from profiles where id = auth.uid())
    and rating_average = (select rating_average from profiles where id = auth.uid())
    and rating_count = (select rating_count from profiles where id = auth.uid())
  );

-- ------------------------------------------------------------------
-- Fix 2: messages — validate recipient_id is the actual other
-- participant of the conversation.
-- ------------------------------------------------------------------
drop policy if exists "messages_insert_own" on messages;

create policy "messages_insert_own"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (
        (conversations.buyer_id = auth.uid() and conversations.seller_id = messages.recipient_id)
        or
        (conversations.seller_id = auth.uid() and conversations.buyer_id = messages.recipient_id)
      )
    )
  );

-- ------------------------------------------------------------------
-- Fix 3: conversations — enforce buyer/seller sanity and that
-- seller_id matches the listing's actual, active seller.
-- ------------------------------------------------------------------
drop policy if exists "conversations_insert_own" on conversations;

create policy "conversations_insert_own"
  on conversations for insert
  with check (
    buyer_id = auth.uid()
    and buyer_id <> seller_id
    and exists (
      select 1 from listings
      where listings.id = conversations.listing_id
      and listings.status = 'active'
      and listings.seller_id = conversations.seller_id
    )
  );
