-- ===========================================================================
-- AfroConsul — lock down the 'photos' storage bucket (PII: beneficiary ID photos)
-- Run in the Supabase dashboard → SQL Editor → New query → Run.
--
-- Before: bucket was PUBLIC and readable by anon — anyone with the (guessable)
-- URL could fetch a beneficiary's ID photo.
-- After:  bucket is PRIVATE; only authenticated agents can read/write/delete,
-- and the app serves images through short-lived SIGNED URLs (see src/lib/db.ts).
-- ===========================================================================

-- 1) Make the bucket private (revokes the public /object/public/ endpoint).
update storage.buckets set public = false where id = 'photos';

-- 2) Replace the dev policies (anon + authenticated) with authenticated-only.
drop policy if exists dev_photos_read   on storage.objects;
drop policy if exists dev_photos_write  on storage.objects;
drop policy if exists dev_photos_delete on storage.objects;

create policy photos_read on storage.objects
  for select to authenticated using (bucket_id = 'photos');

create policy photos_write on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');

create policy photos_delete on storage.objects
  for delete to authenticated using (bucket_id = 'photos');
