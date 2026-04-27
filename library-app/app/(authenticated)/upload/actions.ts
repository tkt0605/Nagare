"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const insertSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("photo"),
    title: z.string().min(1, "タイトルを入力してください").max(100),
    description: z.string().max(500).optional(),
    storage_path: z.string().min(1),
    file_size: z.number(),
    mime_type: z.string(),
  }),
  z.object({
    category: z.literal("document"),
    title: z.string().min(1, "タイトルを入力してください").max(100),
    description: z.string().max(500).optional(),
    storage_path: z.string().min(1),
    file_size: z.number(),
    mime_type: z.string(),
  }),
  z.object({
    category: z.literal("music"),
    title: z.string().min(1, "タイトルを入力してください").max(100),
    description: z.string().max(500).optional(),
    music_url: z.string().url("有効なURLを入力してください"),
  }),
]);

export type InsertFileInput = z.infer<typeof insertSchema>;
export type InsertResult = { error: string } | { id: string };

export async function insertFile(input: InsertFileInput): Promise<InsertResult> {
  const parsed = insertSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "認証が必要です" };

  const base = {
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    category: parsed.data.category,
  };

  const row =
    parsed.data.category === "music"
      ? { ...base, music_url: parsed.data.music_url, storage_path: null, file_size: null, mime_type: null }
      : {
          ...base,
          storage_path: parsed.data.storage_path,
          file_size: parsed.data.file_size,
          mime_type: parsed.data.mime_type,
          music_url: null,
        };

  const { data, error } = await supabase
    .from("files")
    .insert(row)
    .select("id")
    .single<{ id: string }>();

  if (error) return { error: "投稿に失敗しました。もう一度お試しください" };

  redirect(`/library/${data.id}`);
}
