-- ============================================================
-- Nagare: Storageバケット設定
-- ============================================================

-- ファイル用バケット（写真・文書）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nagare-files',
  'nagare-files',
  false,
  209715200, -- 200MB in bytes
  array[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
);

-- アバター用バケット（公開）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ---- Storage RLS ----

-- nagare-files: 認証ユーザーのみ閲覧
create policy "nagare_files_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'nagare-files');

-- nagare-files: 自分のフォルダにのみアップロード
create policy "nagare_files_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'nagare-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- nagare-files: 自分のファイルのみ削除
create policy "nagare_files_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'nagare-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatars: 全員が閲覧可能
create policy "avatars_select" on storage.objects
  for select to public
  using (bucket_id = 'avatars');

-- avatars: 自分のアバターのみアップロード
create policy "avatars_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatars: 自分のアバターのみ更新・削除
create policy "avatars_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
