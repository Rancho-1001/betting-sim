-- ─────────────────────────────────────────────────────────────────────────
-- Bankroll Compounder — database schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query
-- → paste → Run. Safe to re-run (uses IF NOT EXISTS / idempotent policies).
-- ─────────────────────────────────────────────────────────────────────────

-- Per-user settings (currently just the journal's starting bankroll).
create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  start_bankroll numeric not null default 1000,
  updated_at timestamptz not null default now()
);

-- One row per logged bet.
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bet_date date not null,
  description text not null default '',
  stake numeric not null,
  odds numeric not null,
  result text not null check (result in ('win', 'loss', 'push')),
  created_at timestamptz not null default now()
);

create index if not exists bets_user_id_created_idx
  on public.bets (user_id, created_at);

-- ── Row Level Security ───────────────────────────────────────────────────
-- This is the part that makes the app multi-user-safe: every query is
-- automatically scoped to the logged-in user. No user can read or write
-- another user's rows, even though they share the same tables.

alter table public.settings enable row level security;
alter table public.bets enable row level security;

-- settings policies
drop policy if exists "settings_select_own" on public.settings;
create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);

drop policy if exists "settings_insert_own" on public.settings;
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "settings_update_own" on public.settings;
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- bets policies
drop policy if exists "bets_select_own" on public.bets;
create policy "bets_select_own" on public.bets
  for select using (auth.uid() = user_id);

drop policy if exists "bets_insert_own" on public.bets;
create policy "bets_insert_own" on public.bets
  for insert with check (auth.uid() = user_id);

drop policy if exists "bets_update_own" on public.bets;
create policy "bets_update_own" on public.bets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "bets_delete_own" on public.bets;
create policy "bets_delete_own" on public.bets
  for delete using (auth.uid() = user_id);
