-- ===========================================================================
-- AfroConsul — atomic request + beneficiaries creation (#6)
-- Run in the Supabase dashboard → SQL Editor → New query → Run.
--
-- Before: the form inserted the request, then beneficiaries in a separate call.
-- If the second insert failed, an orphan request (0 beneficiaries) was left
-- behind with no rollback.
-- After:  one RPC inserts both inside a single transaction — any failure rolls
-- back the whole thing. The request id is passed in by the client so photos
-- (which are keyed by request id) can be uploaded beforehand.
-- ===========================================================================

create or replace function public.create_request_with_beneficiaries(
  p_id            uuid,
  p_card_type     text,
  p_deadline      date,
  p_beneficiaries jsonb
)
returns table (out_id uuid, out_reference text)
language plpgsql
-- SECURITY INVOKER (default): runs as the calling agent, so RLS still applies.
as $$
begin
  if p_beneficiaries is null or jsonb_array_length(p_beneficiaries) = 0 then
    raise exception 'at least one beneficiary is required';
  end if;

  -- reference is assigned by the BEFORE INSERT trigger (set_request_reference)
  insert into public.requests (id, card_type, status, deadline)
  values (p_id, p_card_type, 'nouveau', p_deadline)
  returning requests.id, requests.reference into out_id, out_reference;

  insert into public.beneficiaries (
    request_id, last_name, first_name, dob, place_of_birth,
    nationality, address, height, gender, photo_path, position
  )
  select
    p_id,
    b->>'last_name',
    b->>'first_name',
    nullif(b->>'dob', '')::date,
    nullif(b->>'place_of_birth', ''),
    b->>'nationality',
    nullif(b->>'address', ''),
    nullif(b->>'height', '')::int,
    coalesce(nullif(b->>'gender', ''), 'masculin'),
    nullif(b->>'photo_path', ''),
    coalesce(nullif(b->>'position', '')::int, 0)
  from jsonb_array_elements(p_beneficiaries) as b;

  return next;
end;
$$;
