"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(2, "ユーザー名は2文字以上です")
    .max(20, "ユーザー名は20文字以内です"),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileResult = { error: string } | { success: true };

export async function updateProfile(
  _prev: UpdateProfileResult | null,
  formData: FormData
): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse({
    username: formData.get("username"),
    avatar_url: formData.get("avatar_url") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "認証が必要です" };

  const update: Record<string, string | null> = {
    username: parsed.data.username,
  };
  if (parsed.data.avatar_url) {
    update.avatar_url = parsed.data.avatar_url;
  }

  // username 重複チェック
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username)
    .neq("id", user.id)
    .single<{ id: string }>();

  if (existing) {
    return { error: "このユーザー名はすでに使われています" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) return { error: "更新に失敗しました。もう一度お試しください" };

  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}
