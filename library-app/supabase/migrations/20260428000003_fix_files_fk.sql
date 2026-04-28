-- files.user_id の参照先を auth.users → public.profiles に変更
-- profiles.id = auth.users.id なので値は同一・データは保持される

ALTER TABLE public.files
  DROP CONSTRAINT files_user_id_fkey;

ALTER TABLE public.files
  ADD CONSTRAINT files_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
