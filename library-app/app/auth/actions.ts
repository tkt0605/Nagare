"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上です"),
});

const signupSchema = z.object({
  username: z
    .string()
    .min(2, "ユーザー名は2文字以上です")
    .max(20, "ユーザー名は20文字以内です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上です"),
});

export type AuthResult = { error: string } | { success: true };

export async function login(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  redirect("/library");
}

export async function signup(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = signupSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, email, password } = parsed.data;

  const supabase = await createClient();
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (signupError) {
    if (signupError.code === "user_already_exists") {
      return { error: "このメールアドレスはすでに登録されています" };
    }
    return { error: "登録に失敗しました。もう一度お試しください" };
  }

  if (!signupData.user) {
    return { error: "登録に失敗しました。もう一度お試しください" };
  }

  redirect("/library");
}
