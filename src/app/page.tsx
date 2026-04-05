import Link from "next/link";
import LiveDateTime from "@/components/home/live-date-time";

export default function HomePage() {
  return (
    <main className="flex items-center justify-center bg-slate-950 px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl bg-slate-550 p-10 text-center shadow-2xl">

        <p className="text-sm tracking-widest text-slate-500">
          ATTENDANCE SYSTEM
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Welcome
        </h1>

        {/* Live Clock Component */}
        <LiveDateTime />

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="btn-base btn-primary">
            Open Dashboard
          </Link>

          <Link href="/admin" className="btn-base btn-outline">
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  );
}