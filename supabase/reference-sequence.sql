-- ===========================================================================
-- AfroConsul — server-side, collision-free request references (#4)
-- Run in the Supabase dashboard → SQL Editor → New query → Run.
--
-- Before: the browser generated `N°{random 1000-9999}AFC{yy}` and the column
-- had no UNIQUE constraint → two demandes could share a reference.
-- After:  a sequence + trigger assigns `N°{seq}AFC{yy}` server-side, and a
-- UNIQUE constraint makes duplicates impossible.
-- ===========================================================================

-- 1) Monotonic sequence backing the reference number.
create sequence if not exists public.request_ref_seq;

-- 2) Assign the reference on insert when the client didn't provide one.
create or replace function public.set_request_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'N°'
      || lpad(nextval('public.request_ref_seq')::text, 4, '0')
      || 'AFC'
      || to_char(now(), 'YY');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_request_reference on public.requests;
create trigger trg_set_request_reference
  before insert on public.requests
  for each row
  execute function public.set_request_reference();

-- 3) Hard guarantee: no two requests can share a reference.
--    NOTE: this fails if duplicate references already exist. To find them:
--      select reference, count(*) from public.requests
--      group by reference having count(*) > 1;
--    Resolve any duplicates, then re-run this statement.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'requests_reference_key'
  ) then
    alter table public.requests
      add constraint requests_reference_key unique (reference);
  end if;
end $$;

-- 4) Advance the sequence past any references that already exist, so the
--    first generated number won't collide with seeded/legacy rows.
--    Extracts only the digits BETWEEN 'N°' and 'AFC' (the sequence portion).
select setval(
  'public.request_ref_seq',
  greatest(
    (select coalesce(max((substring(reference from '^N°(\d+)AFC'))::bigint), 0)
       from public.requests
      where reference ~ '^N°\d+AFC'),
    1
  )
);
