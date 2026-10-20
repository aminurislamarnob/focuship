-- Focuship accounts: custom presets, favorites and synced settings.
--
-- Security model: the site is a static export, so the anon key is public by
-- design and every table is guarded by Row Level Security. Owners read and
-- write their own rows; the only anonymous read is a custom preset its owner
-- explicitly made public (the ?p=<uuid> share links).
--
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh
-- project. See docs/supabase-setup.md for the full checklist.

-- Custom presets: a user-saved mix, shaped like a catalog preset ------------

create table public.user_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  -- Sound id -> volume 0..1, same shape as the app's Layers.
  layers jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_presets_user_id_idx on public.user_presets (user_id);

-- Favorites: a ref is a built-in preset id ("deep-work") or a custom uuid ---

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  preset_ref text not null check (char_length(preset_ref) between 1 and 64),
  created_at timestamptz not null default now(),
  primary key (user_id, preset_ref)
);

-- Synced settings: one row per user, last write wins by updated_at ----------

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  timer jsonb not null default '{}'::jsonb,
  volume double precision not null default 0.8 check (volume between 0 and 1),
  updated_at timestamptz not null default now()
);

-- The preset cap: the database backstop for the client-side limit of 50 -----
-- The app checks before inserting; the gateway maps this exception's message
-- ("preset-limit") to a friendly notice if a stale client races past it.

create function public.enforce_preset_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.user_presets where user_id = new.user_id) >= 50 then
    raise exception 'preset-limit';
  end if;
  return new;
end;
$$;

create trigger user_presets_limit
  before insert on public.user_presets
  for each row execute function public.enforce_preset_limit();

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger user_presets_touch
  before update on public.user_presets
  for each row execute function public.touch_updated_at();

-- Delete account: removes the auth user; every owned row follows by cascade -

create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- Row Level Security ---------------------------------------------------------

alter table public.user_presets enable row level security;
alter table public.favorites enable row level security;
alter table public.user_settings enable row level security;

create policy "Owners manage their presets"
  on public.user_presets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The share links: anyone (signed in or not) may read a public preset.
create policy "Public presets are readable by link"
  on public.user_presets for select
  using (is_public = true);

create policy "Owners manage their favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners manage their settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
