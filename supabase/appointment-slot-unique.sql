-- ===========================================================================
-- AfroConsul — prevent double-booked appointment slots (#7)
-- Run in the Supabase dashboard → SQL Editor → New query → Run.
--
-- Before: nothing stopped two appointments from sharing the same date + slot.
-- After:  a UNIQUE (appointment_date, slot) constraint makes it impossible at
-- the database level, even under a race. The booking UI also reads existing
-- bookings to grey out taken slots and handles the 23505 conflict gracefully.
--
-- NOTE: this fails if duplicate (date, slot) pairs already exist. Find them:
--   select appointment_date, slot, count(*)
--   from public.appointments
--   group by appointment_date, slot having count(*) > 1;
-- Resolve duplicates, then re-run.
-- ===========================================================================

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_slot_key'
  ) then
    alter table public.appointments
      add constraint appointments_slot_key unique (appointment_date, slot);
  end if;
end $$;
