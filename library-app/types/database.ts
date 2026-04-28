export type FileCategory = "photo" | "document" | "music";

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type FileItem = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: FileCategory;
  storage_path: string | null;
  music_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  profiles?: Profile;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id">>;
      };
      files: {
        Row: FileItem;
        Insert: Omit<FileItem, "id" | "created_at" | "profiles"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<FileItem, "id" | "user_id" | "profiles">>;
      };
    };
  };
};
