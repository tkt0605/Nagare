import { createClient } from "@/lib/supabase/server";
import { fetchProfile, fetchFiles } from "@/lib/queries";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/layout/navbar";
import { FileCard } from "../../library/_components/file-card";
import { EditProfileForm } from "./_components/edit-profile-form";

type Props = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [profile, {
    data: { user: currentUser },
  }] = await Promise.all([
    fetchProfile(supabase, id),
    supabase.auth.getUser(),
  ]);

  if (!profile) notFound();

  const isOwner = currentUser?.id === id;

  // このユーザーの投稿を取得（全カテゴリ）
  const { data: rawFiles } = await supabase
    .from("files")
    .select("*, profiles(id, username, avatar_url, created_at)")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const files = (rawFiles ?? []) as Awaited<ReturnType<typeof fetchFiles>>;

  // 写真の署名付きURL
  const filesWithUrls = await Promise.all(
    files.map(async (file) => {
      if (file.category === "photo" && file.storage_path) {
        const { data } = await supabase.storage
          .from("nagare-files")
          .createSignedUrl(file.storage_path, 3600);
        return { file, signedUrl: data?.signedUrl ?? undefined };
      }
      return { file, signedUrl: undefined };
    })
  );

  const joinedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(new Date(profile.created_at));

  return (
    <div>
      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar profile={profile} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {profile.username}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{joinedDate}から</p>
            <p className="text-sm text-gray-500 mt-1">
              {files.length}件放流
            </p>
          </div>
          {isOwner && (
            <div className="shrink-0">
              <EditProfileForm profile={profile} />
            </div>
          )}
        </div>
      </div>

      {/* 投稿一覧 */}
      <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
        放流したもの
      </h2>

      {filesWithUrls.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🌊</p>
          <p className="text-sm">まだ放流していません</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filesWithUrls.map(({ file, signedUrl }) => (
            <FileCard key={file.id} file={file} signedUrl={signedUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
