import Link from "next/link";

export default function HomePage() {
  const now = new Date();

  return (
    <main className="flex items-center justify-center bg-slate-950 px-4 py-16">
      
      <div className="w-full max-w-xl rounded-3xl slate-450- p-10 text-center shadow-2xl">

        <p className="text-sm tracking-widest text-slate-500">
          ATTENDANCE SYSTEM
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Welcome
        </h1>

        {/* DATE + TIME */}
        <div className="mt-6 rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-600">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {now.toLocaleTimeString()}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-center gap-4">
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