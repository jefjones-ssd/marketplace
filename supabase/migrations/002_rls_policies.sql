-- Phase 1 RLS policies for profiles, listings, listing_images, messages, reviews, reports

-- ------------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------------
create policy "profiles_select_all"
  on profiles for select
  using (true);

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

-- Insert is handled automatically on signup via trigger — no insert policy needed yet.

-- ------------------------------------------------------------------
-- listings
-- ------------------------------------------------------------------
create policy "listings_select_active"
  on listings for select
  using (status = 'active');

create policy "listings_select_own"
  on listings for select
  using (seller_id = auth.uid());

create policy "listings_insert_verified_sellers"
  on listings for insert
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.verification_status = 'verified'
    )
  );

create policy "listings_update_own"
  on listings for update
  using (seller_id = auth.uid());

create policy "listings_delete_own"
  on listings for delete
  using (seller_id = auth.uid());

-- ------------------------------------------------------------------
-- listing_images
-- ------------------------------------------------------------------
create policy "listing_images_select_active"
  on listing_images for select
  using (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and listings.status = 'active'
    )
  );

create policy "listing_images_insert_own"
  on listing_images for insert
  with check (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and listings.seller_id = auth.uid()
    )
  );

create policy "listing_images_update_own"
  on listing_images for update
  using (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and listings.seller_id = auth.uid()
    )
  );

create policy "listing_images_delete_own"
  on listing_images for delete
  using (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and listings.seller_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------
-- messages
-- ------------------------------------------------------------------
create policy "messages_select_own"
  on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "messages_insert_own"
  on messages for insert
  with check (sender_id = auth.uid());

-- No update or delete on messages.

-- ------------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------------
create policy "reviews_select_all"
  on reviews for select
  using (true);

create policy "reviews_insert_own"
  on reviews for insert
  with check (reviewer_id = auth.uid());

-- No update or delete on reviews.

-- ------------------------------------------------------------------
-- reports
-- ------------------------------------------------------------------
create policy "reports_insert_own"
  on reports for insert
  with check (reporter_id = auth.uid());

-- No select, update, or delete via client — admin only via service role.
