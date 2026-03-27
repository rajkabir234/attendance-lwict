import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LiveDateTime from "@/components/home/live-date-time";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    role = profile?.role ?? null;
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Attendance System
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Welcome
            </h1>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <LiveDateTime />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-black px-5 py-3 text-white hover:opacity-90"
                >
                  Open Dashboard
                </Link>

                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-slate-300 bg-white px-5 py-3 text-slate-700 hover:bg-slate-100"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-black px-5 py-3 text-white hover:opacity-90"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}