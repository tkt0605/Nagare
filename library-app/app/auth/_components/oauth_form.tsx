"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export function SigninWithGoogle() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    // ここには何も書かない。
    // signInWithOAuth はブラウザをGoogleへリダイレクトするため
    // この行以降のコードは OAuth フロー中には実行されない。
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full justify-center items-center gap-3 rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
      >
        <Image
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          width={20}
          height={20}
        />
        Googleで続行
      </button>
    </div>
  );
}
