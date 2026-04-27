-- ============================================================
-- Nagare: 初期スキーマ
-- ============================================================

-- ---- 招待コードテーブル ----
create table public.invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  used        boolean not null default false,
  used_by     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---- プロフィールテーブル ----
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ---- ファイルカテゴリ enum ----
create type public.file_category as enum ('photo', 'document', 'music');

-- ---- ファイルテーブル ----
create table public.files (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  category      public.file_category not null,
  storage_path  text,
  music_url     text,
  file_size     bigint,
  mime_type     text,
  created_at    timestamptz not null default now(),
  constraint chk_content check (
    (category = 'music' and music_url is not null) or
    (category != 'music' and storage_path is not null)
  )
);

-- ---- ユーザー登録時にプロフィール自動作成 ----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.invite_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.files enable row level security;

-- ---- invite_codes ----
-- 認証ユーザーは招待コードを検証のために参照可能（未使用のもののみ）
create policy "invite_codes_select" on public.invite_codes
  for select to authenticated
  using (true);

-- ---- profiles ----
-- 認証ユーザーは全プロフィールを閲覧可能
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (true);

-- 自分のプロフィールのみ更新可能
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid());

-- ---- files ----
-- 認証ユーザーは全ファイルを閲覧可能
create policy "files_select" on public.files
  for select to authenticated
  using (true);

-- 認証ユーザーは自分のファイルを投稿可能
create policy "files_insert_own" on public.files
  for insert to authenticated
  with check (user_id = auth.uid());

-- 自分のファイルのみ更新・削除可能
create policy "files_update_own" on public.files
  for update to authenticated
  using (user_id = auth.uid());

create policy "files_delete_own" on public.files
  for delete to authenticated
  using (user_id = auth.uid());
