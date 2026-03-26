import { requireUser } from "@/lib/utils/auth";
import GeofencedCheckInButton from "@/components/attendance/geofenced-checkin-button";
import CheckoutForm from "@/components/attendance/checkout-form";
import SignOutButton from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, shift_start")
    .eq("id", user.id)
    .single();

  const { data: settings } = await supabase
    .from("settings")
    .select("office_latitude, office_longitude, geofence_radius_m")
    .limit(1)
    .single();

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .gte("check_in", `${today}T00:00:00`)
    .lte("check_in", `${today}T23:59:59`)
    .maybeSingle();

  const hasCheckedIn = !!attendance;
  const hasCheckedOut = !!attendance?.check_out;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-600">
            Welcome {profile?.full_name || user.email}
          </p>
        </div>

        <SignOutButton />
      </div>

      {attendance && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today’s Status</h2>
          <div className="space-y-2 text-slate-700">
            <p><strong>Check In:</strong> {attendance.check_in}</p>
            <p><strong>Check Out:</strong> {attendance.check_out || "Not checked out yet"}</p>
          </div>
        </div>
      )}

      {!hasCheckedIn && profile && settings && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <GeofencedCheckInButton
            officeLat={settings.office_latitude}
            officeLng={settings.office_longitude}
            radiusMeters={settings.geofence_radius_m}
            shiftStart={profile.shift_start}
          />
        </div>
      )}

      {hasCheckedIn && !hasCheckedOut && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <CheckoutForm />
        </div>
      )}

      {hasCheckedOut && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-700 shadow-sm">
          Attendance completed for today
        </div>
      )}
    </main>
  );
}