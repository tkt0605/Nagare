import { createClient } from "@/lib/supabase/server";
import { fetchFileById } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/layout/navbar";

type Props = { params: Promise<{ id: string }> };

const MIME_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
};

export default async function FileDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const file = await fetchFileById(supabase, id);

  if (!file) notFound();

  // ファイルダウンロード用の署名付きURL（1時間有効）
  let fileUrl: string | undefined;
  if (file.storage_path) {
    const { data } = await supabase.storage
      .from("nagare-files")
      .createSignedUrl(file.storage_path, 3600);
    fileUrl = data?.signedUrl ?? undefined;
  }

  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(file.created_at));

  const fileSizeMB = file.file_size
    ? (file.file_size / (1024 * 1024)).toFixed(1)
    : null;

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← ライブラリに戻る
      </Link>

      {/* プレビュー */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-4">
        {file.category === "photo" && fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={file.title}
            className="w-full object-contain max-h-96"
          />
        ) : file.category === "music" ? (
          <MusicPreview url={file.music_url!} />
        ) : (
          <div className="h-48 flex flex-col items-center justify-center gap-3 bg-gray-50">
            <span className="text-5xl">📄</span>
            {file.mime_type && MIME_LABEL[file.mime_type] && (
              <span className="text-sm font-mono text-gray-400">
                {MIME_LABEL[file.mime_type]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 詳細 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{file.title}</h1>
        {file.description && (
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            {file.description}
          </p>
        )}

        <div className="flex items-center gap-3 mb-5 pt-4 border-t border-gray-50">
          <Link href={`/profile/${file.profiles.id}`}>
            <Avatar profile={file.profiles} size="md" />
          </Link>
          <div>
            <Link
              href={`/profile/${file.profiles.id}`}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              {file.profiles.username}
            </Link>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
          {fileSizeMB && (
            <span className="ml-auto text-xs text-gray-400">
              {fileSizeMB} MB
            </span>
          )}
        </div>

        {/* ダウンロード or 音楽リンク */}
        {file.category === "music" && file.music_url ? (
          <a
            href={file.music_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 text-center text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
          >
            音楽リンクを開く
          </a>
        ) : fileUrl ? (
          <a
            href={fileUrl}
            download={file.title}
            className="block w-full py-2.5 text-center text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
          >
            ダウンロード
          </a>
        ) : null}
      </div>
    </div>
  );
}

function MusicPreview({ url }: { url: string }) {
  const isSpotify = url.includes("spotify.com");
  const isAppleMusic = url.includes("music.apple.com");

  return (
    <div className="h-48 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-50 to-teal-50">
      <span className="text-5xl">{isSpotify ? "🎵" : isAppleMusic ? "🎶" : "🎵"}</span>
      <span className="text-sm text-gray-500">
        {isSpotify ? "Spotify" : isAppleMusic ? "Apple Music" : "音楽リンク"}
      </span>
    </div>
  );
}
