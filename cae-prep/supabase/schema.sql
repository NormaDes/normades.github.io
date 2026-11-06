-- Esquema de Supabase para CAE Prep. NO se usa todavía (Fase 1 guarda en localStorage).
-- Se aplicará al migrar la capa de datos (lib/storage) y en la Fase 4.
-- Ejecutar en Supabase → SQL Editor.

create extension if not exists "pgcrypto";

-- Ejercicios generados (y seeds) cacheados. content = JSON validado con zod.
create table exercises (
  id            text primary key,
  part_id       text not null,
  source        text not null check (source in ('seed','ai')),
  topic         text,
  content       jsonb not null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index on exercises (part_id, created_at desc);

create table attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  exercise_id   text not null references exercises(id) on delete cascade,
  part_id       text not null,
  correct_count int  not null,
  total         int  not null,
  marks         int  not null,
  max_marks     int  not null,
  duration_sec  int  not null default 0,
  timed         boolean not null default false,
  details       jsonb not null default '[]',   -- [{n, correct, skill}]
  created_at    timestamptz not null default now()
);
create index on attempts (user_id, created_at desc);

create table mistakes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  exercise_id   text not null references exercises(id) on delete cascade,
  part_id       text not null,
  n             int  not null,
  skill         text not null,
  given         text,
  expected      text,
  resolved      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index on mistakes (user_id, resolved);

-- Vocabulario con repetición espaciada (SM-2 simplificado)
create table vocab (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
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

-- Caché de artículos reales (Guardian, The Conversation, Wikipedia…). Se refresca a diario.
create table articles (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,           -- 'guardian' | 'conversation' | 'wikipedia' | …
  external_id   text not null,
  title         text not null,
  author        text,
  published_at  timestamptz,
  url           text not null,           -- URL original (atribución obligatoria)
  license       text not null,           -- 'CC BY-ND', 'CC BY-SA', 'Guardian OPEN'…
  full_text_allowed boolean not null default false,  -- false → solo extracto + enlace
  excerpt       text,
  body          text,                    -- solo si full_text_allowed
  topic         text,
  word_count    int,
  difficulty    text,
  fetched_at    timestamptz not null default now(),
  unique (source, external_id)
);

-- Vídeos de la biblioteca (curados + propios). La transcripción pegada es del usuario.
create table videos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade, -- null = curado
  youtube_id    text not null,
  title         text not null,
  channel       text,
  transcript    text,
  created_at    timestamptz not null default now()
);

-- Control de coste: generaciones por usuario y día
create table generation_usage (
  user_id       uuid not null references auth.users(id) on delete cascade,
  day           date not null default current_date,
  count         int  not null default 0,
  primary key (user_id, day)
);

-- RLS: cada usuario solo ve lo suyo; exercises/articles se leen para todos los autenticados.
alter table exercises enable row level security;
alter table attempts enable row level security;
alter table mistakes enable row level security;
alter table vocab enable row level security;
alter table articles enable row level security;
alter table videos enable row level security;
alter table generation_usage enable row level security;

create policy "read exercises" on exercises for select to authenticated using (true);
create policy "read articles"  on articles  for select to authenticated using (true);
create policy "own attempts"   on attempts  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own mistakes"   on mistakes  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own vocab"      on vocab     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own videos"     on videos    for all to authenticated using (user_id = auth.uid() or user_id is null) with check (user_id = auth.uid());
create policy "own usage"      on generation_usage for select to authenticated using (user_id = auth.uid());
-- Escrituras en exercises/articles/generation_usage: solo desde el servidor con SUPABASE_SERVICE_ROLE_KEY.
