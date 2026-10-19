-- =========================================================
-- 1. Presentes sem link: o convidado paga pelo PIX do casal.
-- 2. Confirmação de presença dos convidados.
-- =========================================================

alter table public.gifts alter column gift_url drop not null;
alter table public.gifts drop constraint if exists gifts_gift_url_check;
alter table public.gifts add constraint gifts_gift_url_check
  check (gift_url is null or gift_url ~* '^https?://');

-- ---------- Confirmações ----------
-- Convidado não tem conta: qualquer um envia (com limites), só os noivos leem.
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  attending boolean not null,
  companions integer not null default 0 check (companions between 0 and 10),
  companion_names text check (char_length(companion_names) <= 600),
  phone text check (char_length(phone) <= 30),
  message text check (char_length(message) <= 600),
  created_at timestamptz not null default now()
);

create index if not exists rsvps_recentes on public.rsvps (created_at desc);

alter table public.rsvps enable row level security;

drop policy if exists "rsvps: qualquer um confirma" on public.rsvps;
create policy "rsvps: qualquer um confirma"
  on public.rsvps for insert to anon, authenticated
  with check (true);

drop policy if exists "rsvps: noivos leem" on public.rsvps;
create policy "rsvps: noivos leem"
  on public.rsvps for select to authenticated
  using (private.is_admin());

drop policy if exists "rsvps: noivos apagam" on public.rsvps;
create policy "rsvps: noivos apagam"
  on public.rsvps for delete to authenticated
  using (private.is_admin());
