import type { SupabaseClient } from "@supabase/supabase-js";
import type { FileCategory, FileItem, Profile } from "@/types/database";

export type FileWithProfile = Omit<FileItem, "profiles"> & {
  profiles: Profile;
};

export async function fetchFiles(
  supabase: SupabaseClient,
  category?: FileCategory | "all"
): Promise<FileWithProfile[]> {
  let query = supabase
    .from("files")
    .select("*, profiles(id, username, avatar_url, created_at)")
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FileWithProfile[];
}

export async function fetchFileById(
  supabase: SupabaseClient,
  id: string
): Promise<FileWithProfile | null> {
  const { data, error } = await supabase
    .from("files")
    .select("*, profiles(id, username, avatar_url, created_at)")
    .eq("id", id)
    .single<FileWithProfile>();

  if (error) return null;
  return data;
}

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  if (error) return null;
  return data;
}
