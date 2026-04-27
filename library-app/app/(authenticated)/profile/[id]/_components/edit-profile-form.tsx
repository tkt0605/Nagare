"use client";

import { useActionState, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type UpdateProfileResult } from "../actions";
import { Avatar } from "@/components/layout/navbar";
import type { Profile } from "@/types/database";

type Props = { profile: Profile };

export function EditProfileForm({ profile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState<UpdateProfileResult | null, FormData>(
    updateProfile,
    null
  );

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("アバターは5MB以内にしてください");
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAvatarUploading(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      setAvatarError("アップロードに失敗しました");
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    setAvatarUrl(publicUrl);
    setAvatarUploading(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
      >
        プロフィール編集
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">プロフィール編集</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form action={action} className="space-y-5">
          {/* アバター */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="cursor-pointer relative"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar
                profile={{ username: profile.username, avatar_url: avatarUrl || null }}
                size="lg"
              />
              <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">変更</span>
              </div>
            </div>
            {avatarUploading && <p className="text-xs text-gray-400">アップロード中...</p>}
            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <input type="hidden" name="avatar_url" value={avatarUrl} />
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              ユーザー名
            </label>
            <input
              name="username"
              type="text"
              defaultValue={profile.username}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {state && "error" in state && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}
          {state && "success" in state && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              更新しました
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending || avatarUploading}
              className="flex-1 py-2 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {pending ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
