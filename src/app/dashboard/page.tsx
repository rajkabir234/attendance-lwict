import { requireUser } from "@/lib/utils/auth";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import GeofencedCheckInButton from "@/components/attendance/geofenced-checkin-button";
import CheckoutForm from "@/components/attendance/checkout-form";
import SignOutButton from "@/components/auth/sign-out-button";
import LeaveApplicationForm from "@/components/leaves/leave-application-form";
import SummaryCard from "@/components/ui/summary-card";
import StatusBadge from "@/components/ui/status-badge";

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

  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .gte("check_in", `${today}T00:00:00`)
    .lte("check_in", `${today}T23:59:59`)
    .maybeSingle();

  const { data: history } = await supabase
    .from("attendance")
    .select("id, check_in, check_out, is_late, is_overtime, checkout_report")
    .eq("user_id", user.id)
    .order("check_in", { ascending: false })
    .limit(10);

  const { data: leaveHistory } = await supabase
    .from("leaves")
    .select("id, start_date, end_date, reason, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const hasCheckedIn = !!todayAttendance;
  const hasCheckedOut = !!todayAttendance?.check_out;

  const todayStatus = !todayAttendance
    ? "Not Checked In"
    : todayAttendance.check_out
      ? "Completed"
      : "Checked In";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-slate-600">
            Welcome {profile?.full_name || user.email}
          </p>
        </div>

        <SignOutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Today Status" value={todayStatus} />
        <SummaryCard
          title="Check In"
          value={todayAttendance?.check_in ? formatDateTime(todayAttendance.check_in) : "-"}
        />
        <SummaryCard
          title="Check Out"
          value={todayAttendance?.check_out ? formatDateTime(todayAttendance.check_out) : "-"}
        />
        <SummaryCard
          title="Overtime"
          value={todayAttendance?.is_overtime ? "Yes" : "No"}
        />
      </div>

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

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <LeaveApplicationForm />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Attendance</h2>
          {todayAttendance ? (
            todayAttendance.check_out ? (
              <StatusBadge label="Completed" variant="success" />
            ) : (
              <StatusBadge label="Pending Checkout" variant="warning" />
            )
          ) : (
            <StatusBadge label="Not Checked In" variant="danger" />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Check In</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Check Out</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Late</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Overtime</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Report</th>
              </tr>
            </thead>
            <tbody>
              {history?.length ? (
                history.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{formatDateTime(item.check_in)}</td>
                    <td className="px-4 py-3">{formatDateTime(item.check_out)}</td>
                    <td className="px-4 py-3">
                      {item.is_late ? (
                        <StatusBadge label="Late" variant="warning" />
                      ) : (
                        <StatusBadge label="On Time" variant="success" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.is_overtime ? (
                        <StatusBadge label="Overtime" variant="default" />
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.checkout_report || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Leave Requests</h2>
          <StatusBadge label={`${leaveHistory?.length || 0} Requests`} variant="default" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Start Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">End Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Reason</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory?.length ? (
                leaveHistory.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{formatDate(item.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(item.end_date)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.reason}</td>
                    <td className="px-4 py-3">
                      {item.status === "approved" ? (
                        <StatusBadge label="Approved" variant="success" />
                      ) : item.status === "rejected" ? (
                        <StatusBadge label="Rejected" variant="danger" />
                      ) : (
                        <StatusBadge label="Pending" variant="warning" />
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDateTime(item.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No leave requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}