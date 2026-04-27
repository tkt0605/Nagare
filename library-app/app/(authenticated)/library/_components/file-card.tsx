import Link from "next/link";
import type { FileWithProfile } from "@/lib/queries";
import { Avatar } from "@/components/layout/navbar";

const CATEGORY_ICON: Record<string, string> = {
  photo: "🖼",
  document: "📄",
  music: "🎵",
};

const MIME_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPT",
};

type Props = {
  file: FileWithProfile;
  signedUrl?: string;
};

export function FileCard({ file, signedUrl }: Props) {
  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
  }).format(new Date(file.created_at));

  return (
    <Link
      href={`/library/${file.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      {/* サムネイル */}
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
        {file.category === "photo" && signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={file.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl">{CATEGORY_ICON[file.category]}</span>
        )}
      </div>

      {/* 情報 */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {file.title}
          </p>
          {file.category === "document" && file.mime_type && MIME_LABEL[file.mime_type] && (
            <span className="shrink-0 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">
              {MIME_LABEL[file.mime_type]}
            </span>
          )}
          {file.category === "music" && (
            <span className="shrink-0 text-xs px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
              ♪
            </span>
          )}
        </div>

        {/* 投稿者 */}
        <div className="flex items-center gap-2">
          <Avatar profile={file.profiles} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {file.profiles.username}
            </p>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
