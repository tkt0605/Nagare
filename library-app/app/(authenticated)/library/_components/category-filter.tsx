"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { FileCategory } from "@/types/database";

type Category = FileCategory | "all";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "photo", label: "写真" },
  { value: "document", label: "文書" },
  { value: "music", label: "音楽" },
];

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = (searchParams.get("category") as Category) ?? "all";

  function handleSelect(cat: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`flex gap-2 transition-opacity ${isPending ? "opacity-50" : ""}`}>
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            current === value
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
