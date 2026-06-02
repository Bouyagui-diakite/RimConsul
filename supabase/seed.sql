-- ===========================================================================
-- AfroConsul — optional seed data (DEV)
-- Run AFTER schema.sql so the lists aren't empty. Safe to skip.
-- ===========================================================================

with r as (
  insert into public.requests (reference, card_type, status, submission_date, deadline)
  values
    ('N°3901AFC21', 'Carte consulaire', 'nouveau',  current_date - 3,  current_date + 11),
    ('N°3902AFC21', 'Carte consulaire', 'en_cours', current_date - 6,  current_date + 8),
    ('N°3903AFC21', 'Carte de séjour',  'traite',   current_date - 10, current_date + 4)
  returning id, reference
)
insert into public.beneficiaries
  (request_id, last_name, first_name, dob, place_of_birth, nationality, address, height, gender, position)
select r.id, b.last_name, b.first_name, b.dob, b.place_of_birth, b.nationality, b.address, b.height, b.gender, b.position
from r
join (values
  ('N°3901AFC21','DIALLO','Mamadou Alpha','1994-07-06'::date,'Dakar','Sénégal','Tevragh Zeina, Nouakchott',183,'masculin',0),
  ('N°3901AFC21','BA','Abdoulaye','1990-02-11'::date,'Saint-Louis','Sénégal','Ksar, Nouakchott',176,'masculin',1),
  ('N°3901AFC21','KEITA','Mariam','1996-09-23'::date,'Bamako','Mali','Sebkha, Nouakchott',168,'feminin',2),
  ('N°3902AFC21','SIDIBÉ','Yahya','1988-12-01'::date,'Bamako','Mali','Arafat, Nouakchott',180,'masculin',0),
  ('N°3902AFC21','SIMON','Patrick','1992-05-17'::date,'Accra','Ghana','Tevragh Zeina, Nouakchott',178,'masculin',1),
  ('N°3903AFC21','NDIAYE','Aïssatou','1995-03-30'::date,'Thiès','Sénégal','El Mina, Nouakchott',165,'feminin',0)
) as b(reference, last_name, first_name, dob, place_of_birth, nationality, address, height, gender, position)
  on b.reference = r.reference;

-- a couple of appointments tied to the first request
insert into public.appointments (request_id, appointment_date, slot, status)
select id, current_date + 5, '12H - 13H', 'a_venir' from public.requests where reference = 'N°3901AFC21'
union all
select id, current_date - 7, '09H - 10H', 'assiste' from public.requests where reference = 'N°3902AFC21'
union all
select id, current_date - 20, '09H - 10H', 'manque' from public.requests where reference = 'N°3903AFC21';
