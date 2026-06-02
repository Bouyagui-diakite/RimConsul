-- ===========================================================================
-- AfroConsul — database schema (DEV)
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.
-- Domain: Mauritania issues consular cards to foreign AFRICAN nationals only.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --- Tables -----------------------------------------------------------------

create table if not exists public.requests (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null,
  card_type       text not null default 'Carte consulaire',
  status          text not null default 'nouveau'
                    check (status in ('nouveau','en_cours','traite','cloture')),
  submission_date date not null default current_date,
  deadline        date,
  created_at      timestamptz not null default now()
);

create table if not exists public.beneficiaries (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid not null references public.requests(id) on delete cascade,
  last_name      text not null,
  first_name     text not null,
  dob            date,
  place_of_birth text,
  nationality    text not null,           -- African country (never Mauritania)
  address        text,
  height         int,
  gender         text not null default 'masculin'
                   check (gender in ('masculin','feminin')),
  photo_path     text,                    -- path within the 'photos' storage bucket
  position       int not null default 0,  -- order within the request
  created_at     timestamptz not null default now()
);

create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  request_id       uuid references public.requests(id) on delete set null,
  appointment_date date not null,
  slot             text not null,
  status           text not null default 'a_venir'
                     check (status in ('a_venir','assiste','manque')),
  created_at       timestamptz not null default now()
);

create index if not exists beneficiaries_request_idx on public.beneficiaries(request_id);
create index if not exists appointments_request_idx  on public.appointments(request_id);

-- --- Row Level Security -----------------------------------------------------
-- DEV: open access for the anon key so the frontend works without login.
-- TODO: replace these with auth-scoped policies when email/password is added.

alter table public.requests       enable row level security;
alter table public.beneficiaries  enable row level security;
alter table public.appointments   enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='requests' and policyname='dev_all_requests') then
    create policy dev_all_requests on public.requests
      for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='beneficiaries' and policyname='dev_all_beneficiaries') then
    create policy dev_all_beneficiaries on public.beneficiaries
      for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='appointments' and policyname='dev_all_appointments') then
    create policy dev_all_appointments on public.appointments
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;

-- --- Storage: beneficiary photos --------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='dev_photos_read') then
    create policy dev_photos_read on storage.objects
      for select to anon, authenticated using (bucket_id = 'photos');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='dev_photos_write') then
    create policy dev_photos_write on storage.objects
      for insert to anon, authenticated with check (bucket_id = 'photos');
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='dev_photos_delete') then
    create policy dev_photos_delete on storage.objects
      for delete to anon, authenticated using (bucket_id = 'photos');
  end if;
end $$;
