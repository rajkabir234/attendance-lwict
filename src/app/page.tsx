import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
           Attendance System
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
             Attendance System
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Secure staff login, geofenced check-in, checkout reports, overtime tracking,
              and admin control 
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-md bg-black px-5 py-3 text-white hover:opacity-90"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-slate-700 hover:bg-slate-100"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Features</h2>

            <div className="grid gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="font-semibold">Geofenced Check-In</h3>
                <p className="text-sm text-slate-600">
                  Allow check-in only when staff are near the office.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="font-semibold">Checkout Reports</h3>
                <p className="text-sm text-slate-600">
                  Collect daily work summaries and overtime flags.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="font-semibold">Admin Dashboard</h3>
                <p className="text-sm text-slate-600">
                  Manage staff, review attendance, and track leave requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}