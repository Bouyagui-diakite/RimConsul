-- ===========================================================================
-- AfroConsul — tighten RLS to authenticated users only.
-- Run this in the SQL Editor AFTER you've created an agent user and confirmed
-- you can log in. It replaces the open dev policies so that only signed-in
-- agents can read/write data.
-- ===========================================================================

drop policy if exists dev_all_requests      on public.requests;
drop policy if exists dev_all_beneficiaries on public.beneficiaries;
drop policy if exists dev_all_appointments  on public.appointments;

create policy auth_all_requests on public.requests
  for all to authenticated using (true) with check (true);
create policy auth_all_beneficiaries on public.beneficiaries
  for all to authenticated using (true) with check (true);
create policy auth_all_appointments on public.appointments
  for all to authenticated using (true) with check (true);

-- Storage (the 'photos' bucket stays public-readable so card images load;
-- writes/deletes require a signed-in agent).
drop policy if exists dev_photos_write  on storage.objects;
drop policy if exists dev_photos_delete on storage.objects;

create policy auth_photos_write on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');
create policy auth_photos_delete on storage.objects
  for delete to authenticated using (bucket_id = 'photos');
