import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchFiles } from "@/lib/queries";
import { FileCard } from "./_components/file-card";
import { CategoryFilter } from "./_components/category-filter";
import type { FileCategory } from "@/types/database";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const validCategory = ["photo", "document", "music"].includes(category ?? "")
    ? (category as FileCategory)
    : undefined;

  const supabase = await createClient();
  const files = await fetchFiles(supabase, validCategory ?? "all");

  // 写真のみ署名付きURLを生成
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">ライブラリ</h1>
        <span className="text-sm text-gray-400">{files.length}件</span>
      </div>

      <div className="mb-6">
        <Suspense>
          <CategoryFilter />
        </Suspense>
      </div>

      {filesWithUrls.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-4xl mb-3">🌊</p>
          <p className="text-sm">まだ放流されていません</p>
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
