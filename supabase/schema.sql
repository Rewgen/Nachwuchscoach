-- =====================================================================
-- Nachwuchscoach – Supabase-Schema
-- Einmalig im Supabase SQL-Editor ausführen (Dashboard → SQL Editor →
-- New query → einfügen → Run). Kann gefahrlos wiederholt werden.
-- =====================================================================

-- ---------- Tabellen (JSON-Payload + Besitzer, wie im lokalen Schema) ----------

create table if not exists public.uebungen (
  id text primary key,
  user_id uuid not null default auth.uid(),
  json jsonb not null
);

create table if not exists public.medien (
  id text primary key,
  user_id uuid not null default auth.uid(),
  uebung_id text not null,
  json jsonb not null
);
create index if not exists idx_medien_uebung on public.medien (uebung_id);

create table if not exists public.trainings (
  id text primary key,
  user_id uuid not null default auth.uid(),
  json jsonb not null
);

create table if not exists public.teilnehmer (
  id text primary key,
  user_id uuid not null default auth.uid(),
  json jsonb not null
);

create table if not exists public.leistungen (
  id text primary key,
  user_id uuid not null default auth.uid(),
  teilnehmer_id text not null,
  json jsonb not null
);
create index if not exists idx_leistungen_teilnehmer on public.leistungen (teilnehmer_id);

create table if not exists public.checklisten (
  id text primary key,
  user_id uuid not null default auth.uid(),
  json jsonb not null
);

create table if not exists public.stoppuhr_sessions (
  id text primary key,
  user_id uuid not null default auth.uid(),
  json jsonb not null
);

create table if not exists public.platzplaene (
  id text primary key,
  user_id uuid not null default auth.uid(),
  json jsonb not null
);

create table if not exists public.sportabzeichen (
  user_id uuid not null default auth.uid(),
  jahr integer not null,
  teilnehmer_id text not null,
  json jsonb not null,
  primary key (user_id, jahr, teilnehmer_id)
);

create table if not exists public.einstellungen (
  user_id uuid not null default auth.uid(),
  key text not null,
  wert jsonb,
  primary key (user_id, key)
);

-- ---------- Row Level Security: jeder sieht nur seine eigenen Daten ----------

do $$
declare t text;
begin
  foreach t in array array[
    'uebungen','medien','trainings','teilnehmer','leistungen',
    'checklisten','stoppuhr_sessions','platzplaene','sportabzeichen','einstellungen'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "eigene_zeilen" on public.%I', t);
    execute format(
      'create policy "eigene_zeilen" on public.%I for all to authenticated
       using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- ---------- Storage-Bucket für Übungs-Medien ----------
-- Öffentlich lesbar (Dateinamen sind unerratbare UUIDs), schreiben/löschen
-- nur im eigenen Ordner (Pfad beginnt mit der eigenen User-ID).

insert into storage.buckets (id, name, public)
values ('medien', 'medien', true)
on conflict (id) do nothing;

drop policy if exists "medien_lesen" on storage.objects;
create policy "medien_lesen" on storage.objects
  for select using (bucket_id = 'medien');

drop policy if exists "medien_hochladen" on storage.objects;
create policy "medien_hochladen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'medien' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "medien_aendern" on storage.objects;
create policy "medien_aendern" on storage.objects
  for update to authenticated
  using (bucket_id = 'medien' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "medien_loeschen" on storage.objects;
create policy "medien_loeschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'medien' and (storage.foldername(name))[1] = auth.uid()::text);
