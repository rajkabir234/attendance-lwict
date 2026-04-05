import { requireUser } from "@/lib/utils/auth";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import GeofencedCheckInButton from "@/components/attendance/geofenced-checkin-button";
import CheckoutForm from "@/components/attendance/checkout-form";
import SignOutButton from "@/components/auth/sign-out-button";
import LeaveApplicationForm from "@/components/leaves/leave-application-form";
import SummaryCard from "@/components/ui/summary-card";
import StatusBadge from "@/components/ui/status-badge";
import CollapsibleCard from "@/components/ui/collapsible-card";

function formatDurationFromDates(
  checkInValue: string | null,
  checkOutValue?: string | null
) {
  if (!checkInValue) return "-";

  const start = new Date(checkInValue).getTime();
  const end = checkOutValue ? new Date(checkOutValue).getTime() : Date.now();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "-";
  }

  const diffMs = end - start;
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

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

  const todayDuration = todayAttendance?.check_in
    ? formatDurationFromDates(todayAttendance.check_in, todayAttendance.check_out)
    : "-";

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="app-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Staff Dashboard
            </h1>
            <p className="mt-1 text-muted">
              Welcome {profile?.full_name || user.email}
            </p>
          </div>

          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Today Status" value={todayStatus} />
        <SummaryCard
          title="Check In"
          value={todayAttendance?.check_in ? formatDateTime(todayAttendance.check_in) : "-"}
        />
        <SummaryCard
          title="Check Out"
          value={todayAttendance?.check_out ? formatDateTime(todayAttendance.check_out) : "-"}
        />
        <SummaryCard title="Hours Stayed" value={todayDuration} />
        <SummaryCard
          title="Overtime"
          value={todayAttendance?.is_overtime ? "Yes" : "No"}
        />
      </div>

      {!hasCheckedIn && profile && settings && (
        <CollapsibleCard
          title="Check In"
          subtitle="Fetch your location and mark attendance inside office range."
          defaultOpen={true}
        >
          <GeofencedCheckInButton
            officeLat={settings.office_latitude}
            officeLng={settings.office_longitude}
            radiusMeters={settings.geofence_radius_m}
            shiftStart={profile.shift_start}
          />
        </CollapsibleCard>
      )}

      {hasCheckedIn && !hasCheckedOut && (
        <CollapsibleCard
          title="Check Out"
          subtitle="Submit your work summary before completing today's attendance."
          defaultOpen={true}
        >
          <CheckoutForm />
        </CollapsibleCard>
      )}

      <CollapsibleCard
        title="Leave Application"
        subtitle="Apply for leave and send your request for admin approval."
        defaultOpen={false}
      >
        <LeaveApplicationForm />
      </CollapsibleCard>

      <CollapsibleCard
        title="Recent Attendance"
        subtitle="Your latest check-in and check-out records."
        defaultOpen={true}
        rightSlot={
          todayAttendance ? (
            todayAttendance.check_out ? (
              <StatusBadge label="Completed" variant="success" />
            ) : (
              <StatusBadge label="Pending Checkout" variant="warning" />
            )
          ) : (
            <StatusBadge label="Not Checked In" variant="danger" />
          )
        }
      >
        <div className="overflow-x-auto rounded-2xl border border-subtle">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Stayed</th>
                <th className="px-4 py-3">Late</th>
                <th className="px-4 py-3">Overtime</th>
                <th className="px-4 py-3">Report</th>
              </tr>
            </thead>
            <tbody>
              {history?.length ? (
                history.map((item) => (
                  <tr key={item.id} className="border-b border-subtle last:border-b-0">
                    <td className="px-4 py-3">{formatDateTime(item.check_in)}</td>
                    <td className="px-4 py-3">{formatDateTime(item.check_out)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {formatDurationFromDates(item.check_in, item.check_out)}
                    </td>
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
                        <span className="text-muted">No</span>
                      )}
                    </td>
                    <td className="max-w-sm px-4 py-3 text-muted">
                      <div className="line-clamp-2">{item.checkout_report || "-"}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted">
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="My Leave Requests"
        subtitle="See your leave application history and current status."
        defaultOpen={false}
        rightSlot={
          <StatusBadge label={`${leaveHistory?.length || 0} Requests`} variant="default" />
        }
      >
        <div className="overflow-x-auto rounded-2xl border border-subtle">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory?.length ? (
                leaveHistory.map((item) => (
                  <tr key={item.id} className="border-b border-subtle last:border-b-0">
                    <td className="px-4 py-3">{formatDate(item.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(item.end_date)}</td>
                    <td className="px-4 py-3 text-muted">{item.reason}</td>
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
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    No leave requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>
    </main>
  );
}