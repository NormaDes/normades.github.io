-- CAE Prep · esquema de Supabase (v2: cuentas, datos por usuario y material compartido)
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- Es repetible: se puede volver a ejecutar sin romper nada.

create extension if not exists "pgcrypto";

-- ───────── Perfiles (uno por usuario registrado) ─────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         text not null default 'student' check (role in ('student', 'admin')),
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ───────── Ejercicios (generados con IA o subidos por el admin) ─────────
create table if not exists public.exercises (
  id         text primary key,
  part_id    text not null,
  source     text not null check (source in ('seed', 'ai', 'teacher')),
  title      text,
  content    jsonb not null,
  visibility text not null default 'private' check (visibility in ('private', 'class')),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists exercises_part_idx on public.exercises (part_id, created_at desc);

-- ───────── Datos personales de cada alumno ─────────
create table if not exists public.attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id   text not null,
  part_id       text not null,
  correct_count int  not null,
  total         int  not null,
  marks         numeric not null,
  max_marks     numeric not null,
  duration_sec  int  not null default 0,
  timed         boolean not null default false,
  details       jsonb not null default '[]',
  created_at    timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts (user_id, created_at desc);

create table if not exists public.mistakes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id text not null,
  part_id     text not null,
  n           int  not null,
  skill       text not null,
  given       text,
  expected    text,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists mistakes_user_idx on public.mistakes (user_id, resolved);

create table if not exists public.submissions (          -- redacciones y respuestas de Speaking con su feedback
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('writing', 'speaking')),
  exercise_id text not null,
  part_id     text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists submissions_user_idx on public.submissions (user_id, created_at desc);

create table if not exists public.vocab (                -- vocabulario con repetición espaciada (SM-2)
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  term          text not null,
  definition    text,
  example       text,
  collocations  text[] not null default '{}',
  source_url    text,
  ease          real not null default 2.5,
  interval_days int  not null default 0,
  repetitions   int  not null default 0,
  due_at        timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (user_id, term)
);

alter table public.vocab add column if not exists translation  text;
alter table public.vocab add column if not exists context      text;
alter table public.vocab add column if not exists source_title text;
alter table public.vocab add column if not exists lapses       int not null default 0;

create table if not exists public.generation_usage (     -- control de coste de la IA
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);

-- ───────── Material compartido (audios, vídeos, podcasts, artículos, PDFs) ─────────
create table if not exists public.materials (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('audio', 'video', 'podcast', 'article', 'pdf', 'image', 'link')),
  title        text not null,
  description  text,
  storage_path text,            -- archivo en el bucket privado "materials"
  url          text,            -- enlace externo (YouTube, podcast…)
  transcript   text,
  part_id      text,
  topic        text,
  author       text,
  license      text,
  source_url   text,
  published_at timestamptz,
  visibility   text not null default 'class' check (visibility in ('private', 'class')),
  created_by   uuid default auth.uid() references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists materials_kind_idx on public.materials (kind, created_at desc);

create table if not exists public.articles (             -- caché de artículos reales (Guardian, Wikipedia…)
  id                uuid primary key default gen_random_uuid(),
  source            text not null,
  external_id       text not null,
  title             text not null,
  author            text,
  published_at      timestamptz,
  url               text not null,
  license           text not null,
  full_text_allowed boolean not null default false,
  excerpt           text,
  body              text,
  topic             text,
  word_count        int,
  difficulty        text,
  fetched_at        timestamptz not null default now(),
  unique (source, external_id)
);

-- ───────── Seguridad (RLS): cada alumno solo ve lo suyo ─────────
alter table public.profiles         enable row level security;
alter table public.exercises        enable row level security;
alter table public.attempts         enable row level security;
alter table public.mistakes         enable row level security;
alter table public.submissions      enable row level security;
alter table public.vocab            enable row level security;
alter table public.generation_usage enable row level security;
alter table public.materials        enable row level security;
alter table public.articles         enable row level security;

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant  update (display_name) on public.profiles to authenticated;   -- el rol no se puede cambiar desde la app

drop policy if exists "exercises read"   on public.exercises;
drop policy if exists "exercises insert" on public.exercises;
drop policy if exists "exercises modify" on public.exercises;
drop policy if exists "exercises delete" on public.exercises;
create policy "exercises read" on public.exercises for select to authenticated
  using (visibility = 'class' or created_by = auth.uid() or public.is_admin());
create policy "exercises insert" on public.exercises for insert to authenticated
  with check (created_by = auth.uid() and ((source <> 'teacher' and visibility = 'private') or public.is_admin()));
create policy "exercises modify" on public.exercises for update to authenticated
  using (created_by = auth.uid() or public.is_admin());
create policy "exercises delete" on public.exercises for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

drop policy if exists "own attempts"    on public.attempts;
drop policy if exists "own mistakes"    on public.mistakes;
drop policy if exists "own submissions" on public.submissions;
drop policy if exists "own vocab"       on public.vocab;
drop policy if exists "own usage"       on public.generation_usage;
create policy "own attempts"    on public.attempts    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own mistakes"    on public.mistakes    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own submissions" on public.submissions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own vocab"       on public.vocab       for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own usage"       on public.generation_usage for select to authenticated using (user_id = auth.uid());

drop policy if exists "materials read"   on public.materials;
drop policy if exists "materials insert" on public.materials;
drop policy if exists "materials modify" on public.materials;
drop policy if exists "materials delete" on public.materials;
create policy "materials read" on public.materials for select to authenticated
  using (visibility = 'class' or created_by = auth.uid() or public.is_admin());
create policy "materials insert" on public.materials for insert to authenticated
  with check (created_by = auth.uid() and (visibility = 'private' or public.is_admin()));
create policy "materials modify" on public.materials for update to authenticated
  using (created_by = auth.uid() or public.is_admin());
create policy "materials delete" on public.materials for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

drop policy if exists "articles read" on public.articles;
create policy "articles read" on public.articles for select to authenticated using (true);
-- Escritura en articles y generation_usage: solo desde el servidor con SUPABASE_SERVICE_ROLE_KEY.

-- ───────── Almacenamiento privado para audios/PDF/imágenes del profe ─────────
insert into storage.buckets (id, name, public) values ('materials', 'materials', false)
on conflict (id) do nothing;

drop policy if exists "materials files read"   on storage.objects;
drop policy if exists "materials files write"  on storage.objects;
drop policy if exists "materials files update" on storage.objects;
drop policy if exists "materials files delete" on storage.objects;
create policy "materials files read"   on storage.objects for select to authenticated using (bucket_id = 'materials');
create policy "materials files write"  on storage.objects for insert to authenticated with check (bucket_id = 'materials' and public.is_admin());
create policy "materials files update" on storage.objects for update to authenticated using (bucket_id = 'materials' and public.is_admin());
create policy "materials files delete" on storage.objects for delete to authenticated using (bucket_id = 'materials' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Lista de espera (marketing). Solo se escribe/lee desde el servidor con la clave de servicio.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  exam        text not null default 'c1-advanced',
  role        text not null default 'alumno',
  source      text,
  consent     boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.waitlist enable row level security;   -- sin políticas: nadie la lee desde el navegador
