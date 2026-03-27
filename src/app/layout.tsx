import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/sign-out-button";

export const metadata = {
  title: "Attendance System",
  description: "Staff Attendance System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  width={44}
                  height={44}
                  className="rounded-md object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold leading-none">Attendance System</h1>
                  <p className="text-sm text-slate-500">Staff Management Portal</p>
                </div>
              </Link>

              <nav className="flex items-center gap-3 text-sm">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Home
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>

                    {role === "admin" && (
                      <Link
                        href="/admin"
                        className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                      >
                        Admin
                      </Link>
                    )}

                    <SignOutButton />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
                  >
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-slate-600">
              Developed by <span className="font-semibold">Living with ICT</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}