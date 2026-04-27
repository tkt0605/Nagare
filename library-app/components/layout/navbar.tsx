"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/types/database";

type Props = { profile: Profile };

export function Navbar({ profile }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/library"
          className="text-lg font-bold tracking-tight text-gray-900"
        >
          Nagare
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/library" active={pathname.startsWith("/library")}>
            ライブラリ
          </NavLink>
          <NavLink href="/upload" active={pathname === "/upload"}>
            放流
          </NavLink>
          <Link
            href={`/profile/${profile.id}`}
            className="ml-2 flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <Avatar profile={profile} size="sm" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-gray-100 text-gray-900"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}

export function Avatar({
  profile,
  size = "md",
}: {
  profile: Pick<Profile, "username" | "avatar_url">;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-lg" }[size];

  if (profile.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatar_url} alt={profile.username} className={`${sizeClass} rounded-full object-cover`} />;
  }

  return (
    <div className={`${sizeClass} rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center`}>
      {profile.username[0].toUpperCase()}
    </div>
  );
}
