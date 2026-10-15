-- =========================================================
-- Linha do tempo da nossa história e padrinhos/madrinhas.
-- Mesmo modelo dos presentes: todos leem, só os noivos editam.
-- =========================================================

create table if not exists public.story_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  date_label text check (char_length(date_label) <= 60),
  description text check (char_length(description) <= 1500),
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.story_events.date_label is
  'Texto livre ("Março de 2019", "Verão de 2021") — nem toda lembrança tem dia certo.';

alter table public.story_events enable row level security;

drop policy if exists "story_events: todos leem" on public.story_events;
create policy "story_events: todos leem"
  on public.story_events for select to anon, authenticated using (true);

drop policy if exists "story_events: noivos editam" on public.story_events;
create policy "story_events: noivos editam"
  on public.story_events for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create table if not exists public.godparents (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  role text not null default 'Padrinhos' check (char_length(role) between 1 and 40),
  side text not null default 'noiva' check (side in ('noiva', 'noivo')),
  description text check (char_length(description) <= 400),
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.godparents.side is 'De que lado do altar: da noiva ou do noivo.';

alter table public.godparents enable row level security;

drop policy if exists "godparents: todos leem" on public.godparents;
create policy "godparents: todos leem"
  on public.godparents for select to anon, authenticated using (true);

drop policy if exists "godparents: noivos editam" on public.godparents;
create policy "godparents: noivos editam"
  on public.godparents for all to authenticated
  using (private.is_admin()) with check (private.is_admin());
