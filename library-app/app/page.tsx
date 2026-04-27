import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-sm">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-3">
          Nagare
        </h1>
        <p className="text-gray-400 text-base mb-10 leading-relaxed">
          写真・文書・音楽を<br />
          友人と静かに共有する場所
        </p>
        <Link
          href="/auth"
          className="inline-block px-8 py-3 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
        >
          はじめる
        </Link>
      </div>

      <footer className="absolute bottom-6 text-xs text-gray-300">
        招待制クローズドコミュニティ
      </footer>
    </main>
  );
}
