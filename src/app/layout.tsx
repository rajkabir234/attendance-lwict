import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { LayoutDashboard, Home, ShieldCheck, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/sign-out-button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
      <body className={`${poppins.className} min-h-screen bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen flex-col">
          
          {/* HEADER */}
          <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
              
              <Link href="/" className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-1">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>

                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Attendance System
                  </h1>
                  <p className="text-xs text-slate-400">
                    Staff Management Portal
                  </p>
                </div>
              </Link>

              <nav className="flex items-center gap-2">
                <Link className="nav-dark" href="/">
                  <Home size={16} /> Home
                </Link>

                {user && (
                  <>
                    <Link className="nav-dark" href="/dashboard">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>

                    {role === "admin" && (
                      <Link className="nav-dark" href="/admin">
                        <ShieldCheck size={16} /> Admin
                      </Link>
                    )}

                    <SignOutButton />
                  </>
                )}

                {!user && (
                  <Link href="/login" className="btn-dark">
                    <LogIn size={16} /> Sign In
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          {/* FOOTER */}
          <footer className="border-t border-slate-800 bg-slate-950">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-sm md:flex-row">
              
              <div className="flex items-center gap-3 text-slate-400">
                <div className="rounded-md bg-white p-1">
                  <Image src="/logo.png" alt="" width={24} height={24} />
                </div>
                Developed by <span className="text-white">Living with ICT</span>
              </div>

              <div className="text-slate-500">
                Attendance & Staff Management System
              </div>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}