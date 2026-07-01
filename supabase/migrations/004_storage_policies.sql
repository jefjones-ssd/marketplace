-- Storage RLS policies for the verifications bucket
-- storage.objects has RLS enabled by default in Supabase; no select or delete
-- policies are created here, so those actions are denied for all client roles.
-- The service role bypasses RLS entirely for admin review.

create policy "verifications_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verifications_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
