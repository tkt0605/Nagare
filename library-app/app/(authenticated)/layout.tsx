import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { redirect } from "next/navigation";
import { fetchProfile } from "@/lib/queries";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const profile = await fetchProfile(supabase, user.id);
  if (!profile) redirect("/auth");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
