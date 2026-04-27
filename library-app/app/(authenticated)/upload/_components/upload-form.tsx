"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { insertFile } from "../actions";
import type { FileCategory } from "@/types/database";

const MAX_SIZE = 200 * 1024 * 1024;

const ACCEPTED_PHOTO = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"];
const ACCEPTED_DOC = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const baseSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(100, "100文字以内で入力してください"),
  description: z.string().max(500, "500文字以内で入力してください").optional(),
  musicUrl: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

type CategoryMeta = {
  label: string;
  icon: string;
  accept: string;
  acceptTypes: string[];
};

const CATEGORY_META: Record<Exclude<FileCategory, "music">, CategoryMeta> = {
  photo: {
    label: "写真",
    icon: "🖼",
    accept: "image/jpeg,image/png,image/gif,image/webp,image/heic",
    acceptTypes: ACCEPTED_PHOTO,
  },
  document: {
    label: "文書",
    icon: "📄",
    accept: ".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx",
    acceptTypes: ACCEPTED_DOC,
  },
};

export function UploadForm() {
  const router = useRouter();
  const [category, setCategory] = useState<FileCategory | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(baseSchema) });

  function handleFileChange(selected: File | null) {
    setFileError(null);
    if (!selected || !category || category === "music") return;
    const meta = CATEGORY_META[category];
    if (selected.size > MAX_SIZE) {
      setFileError("ファイルサイズは200MB以内にしてください");
      return;
    }
    if (!meta.acceptTypes.includes(selected.type)) {
      setFileError("対応していないファイル形式です");
      return;
    }
    setFile(selected);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragRef.current?.classList.remove("border-blue-400", "bg-blue-50");
    handleFileChange(e.dataTransfer.files[0] ?? null);
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);

    // 音楽の場合
    if (category === "music") {
      const url = values.musicUrl?.trim() ?? "";
      if (!url) { setServerError("音楽リンクを入力してください"); return; }
      if (!url.includes("spotify.com") && !url.includes("music.apple.com")) {
        setServerError("Spotify または Apple Music のURLを入力してください");
        return;
      }
      const result = await insertFile({
        category: "music",
        title: values.title,
        description: values.description,
        music_url: url,
      });
      if ("error" in result) setServerError(result.error);
      return;
    }

    // ファイルの場合
    if (!file) { setFileError("ファイルを選択してください"); return; }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setServerError("認証が必要です"); return; }

    const ext = file.name.split(".").pop() ?? "";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    setUploadProgress(0);
    const { error: uploadError } = await supabase.storage
      .from("nagare-files")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setUploadProgress(null);
      setServerError("ファイルのアップロードに失敗しました");
      return;
    }
    setUploadProgress(100);

    const result = await insertFile({
      category: category!,
      title: values.title,
      description: values.description,
      storage_path: path,
      file_size: file.size,
      mime_type: file.type,
    });

    setUploadProgress(null);
    if ("error" in result) setServerError(result.error);
  }

  if (!category) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">放流する</h1>
        <p className="text-sm text-gray-400 mb-8">カテゴリを選んでください</p>
        <div className="grid grid-cols-3 gap-3">
          {(["photo", "document", "music"] as FileCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <span className="text-4xl">
                {cat === "photo" ? "🖼" : cat === "document" ? "📄" : "🎵"}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {cat === "photo" ? "写真" : cat === "document" ? "文書" : "音楽"}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => { setCategory(null); setFile(null); setFileError(null); }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← 戻る
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {category === "photo" ? "写真" : category === "document" ? "文書" : "音楽"}を放流
        </h1>
      </div>

      {/* ファイル or 音楽URL */}
      {category !== "music" ? (
        <div>
          <div
            ref={dragRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add("border-blue-400", "bg-blue-50"); }}
            onDragLeave={() => dragRef.current?.classList.remove("border-blue-400", "bg-blue-50")}
            onDrop={handleDrop}
            className="w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            {file ? (
              <>
                <span className="text-2xl">{category === "photo" ? "🖼" : "📄"}</span>
                <p className="text-sm font-medium text-gray-700 truncate max-w-xs px-4">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </>
            ) : (
              <>
                <span className="text-2xl text-gray-300">+</span>
                <p className="text-sm text-gray-400">クリックまたはドラッグ＆ドロップ</p>
                <p className="text-xs text-gray-300">最大200MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={CATEGORY_META[category].accept}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {fileError && <p className="mt-1.5 text-xs text-red-500">{fileError}</p>}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            音楽リンク（Spotify / Apple Music）
          </label>
          <input
            {...register("musicUrl")}
            type="url"
            placeholder="https://open.spotify.com/track/..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
          />
        </div>
      )}

      {/* タイトル */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">タイトル</label>
        <input
          {...register("title")}
          type="text"
          placeholder="タイトルを入力"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* 説明（任意） */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          説明 <span className="text-gray-300 font-normal">（任意）</span>
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="コメントを追加..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* アップロード進捗 */}
      {uploadProgress !== null && (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {serverError && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      {/* 送信 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "放流中..." : "放流する 🌊"}
      </button>
    </form>
  );
}
