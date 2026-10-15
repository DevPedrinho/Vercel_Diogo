-- =========================================================
-- Site do casamento de Vércia & Diogo
--
-- O painel administra três coisas: a lista de presentes, a música do site
-- e os textos. Não há cadastro de convidado: o site é aberto e quem entra
-- no painel são só os noivos, listados em public.admins.
-- =========================================================

create schema if not exists private;

-- ---------- Quem administra ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Contas do Supabase Auth que entram no painel. Cadastre a conta em Authentication e insira o id aqui.';

-- Fora do schema público de propósito: as policies chamam, mas a API não
-- expõe. security definer para ler admins sem depender do RLS dela.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.admins enable row level security;

-- Cada um vê só a própria linha: é assim que o painel sabe se você é noivo(a).
drop policy if exists "admins: vejo a minha linha" on public.admins;
create policy "admins: vejo a minha linha"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ---------- updated_at automático ----------
create or replace function private.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Textos do site ----------
-- Uma linha só. As chaves de texts são as de src/lib/textos.ts; o que não
-- estiver aqui cai no padrão de lá.
create table if not exists public.site_content (
  id boolean primary key default true check (id),
  texts jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id) values (true) on conflict (id) do nothing;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function private.tocar_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "site_content: todos leem" on public.site_content;
create policy "site_content: todos leem"
  on public.site_content for select to anon, authenticated using (true);

drop policy if exists "site_content: noivos editam" on public.site_content;
create policy "site_content: noivos editam"
  on public.site_content for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---------- Música ----------
create table if not exists public.site_music (
  id boolean primary key default true check (id),
  file_path text,
  title text,
  artist text,
  enabled boolean not null default true,
  volume real not null default 0.5 check (volume between 0 and 1),
  updated_at timestamptz not null default now()
);

comment on column public.site_music.file_path is
  'Caminho do arquivo no bucket "site" (pasta musica/). Vazio = o player não aparece.';

insert into public.site_music (id) values (true) on conflict (id) do nothing;

drop trigger if exists site_music_touch on public.site_music;
create trigger site_music_touch before update on public.site_music
  for each row execute function private.tocar_updated_at();

alter table public.site_music enable row level security;

drop policy if exists "site_music: todos leem" on public.site_music;
create policy "site_music: todos leem"
  on public.site_music for select to anon, authenticated using (true);

drop policy if exists "site_music: noivos editam" on public.site_music;
create policy "site_music: noivos editam"
  on public.site_music for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---------- Presentes ----------
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 600),
  category text not null default 'Casa' check (char_length(category) between 1 and 40),
  price_cents integer check (price_cents >= 0),
  image_path text,
  image_url text,
  gift_url text not null check (gift_url ~* '^https?://'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gifts_ordem on public.gifts (sort_order, created_at);

alter table public.gifts enable row level security;

drop policy if exists "gifts: todos veem os ativos" on public.gifts;
create policy "gifts: todos veem os ativos"
  on public.gifts for select to anon, authenticated
  using (is_active or private.is_admin());

drop policy if exists "gifts: noivos editam" on public.gifts;
create policy "gifts: noivos editam"
  on public.gifts for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---------- Recados de quem presenteou ----------
-- O convidado não tem conta: ao clicar em Presentear ele pode deixar o nome
-- e um recado. Qualquer um insere (com limites de tamanho); só os noivos leem.
create table if not exists public.gift_messages (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid references public.gifts (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  message text check (char_length(message) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists gift_messages_recentes on public.gift_messages (created_at desc);

alter table public.gift_messages enable row level security;

drop policy if exists "gift_messages: qualquer um deixa recado" on public.gift_messages;
create policy "gift_messages: qualquer um deixa recado"
  on public.gift_messages for insert to anon, authenticated
  with check (true);

drop policy if exists "gift_messages: noivos leem" on public.gift_messages;
create policy "gift_messages: noivos leem"
  on public.gift_messages for select to authenticated
  using (private.is_admin());

drop policy if exists "gift_messages: noivos apagam" on public.gift_messages;
create policy "gift_messages: noivos apagam"
  on public.gift_messages for delete to authenticated
  using (private.is_admin());

-- ---------- Arquivos (fotos dos presentes, música, ilustração) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('site', 'site', true, 15728640)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "site: noivos enviam" on storage.objects;
create policy "site: noivos enviam"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site' and private.is_admin());

drop policy if exists "site: noivos trocam" on storage.objects;
create policy "site: noivos trocam"
  on storage.objects for update to authenticated
  using (bucket_id = 'site' and private.is_admin());

drop policy if exists "site: noivos apagam" on storage.objects;
create policy "site: noivos apagam"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site' and private.is_admin());
