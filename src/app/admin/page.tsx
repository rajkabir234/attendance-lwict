import { requireAdmin } from "@/lib/utils/auth";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import CreateStaffForm from "@/components/admin/create-staff-form";
import ExportAttendanceButton from "@/components/admin/export-attendance-button";
import SignOutButton from "@/components/auth/sign-out-button";
import LeaveActionButtons from "@/components/leaves/leave-action-buttons";
import SummaryCard from "@/components/ui/summary-card";
import StatusBadge from "@/components/ui/status-badge";

type AdminPageProps = {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { supabase } = await requireAdmin();

  const params = (await searchParams) || {};
  const today = new Date().toISOString().slice(0, 10);

  const fromDate = params.from || today;
  const toDate = params.to || today;

  const fromDateTime = `${fromDate}T00:00:00`;
  const toDateTime = `${toDate}T23:59:59`;

  const { count: totalStaff } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "staff");

  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select(`
      id,
      user_id,
      check_in,
      check_out,
      is_late,
      is_overtime,
      profiles!attendance_user_id_fkey(full_name, email)
    `)
    .gte("check_in", fromDateTime)
    .lte("check_in", toDateTime)
    .order("check_in", { ascending: false });

  const { data: pendingLeaves } = await supabase
    .from("leaves")
    .select(`
      id,
      user_id,
      start_date,
      end_date,
      reason,
      status,
      created_at,
      profiles!leaves_user_id_fkey(full_name, email)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const presentCount = attendanceRows?.length || 0;
  const checkedOutCount =
    attendanceRows?.filter((item) => item.check_out).length || 0;
  const lateCount =
    attendanceRows?.filter((item) => item.is_late).length || 0;

  const exportRows =
    attendanceRows?.map((item: any) => ({
      name: item.profiles?.full_name || "Unknown",
      email: item.profiles?.email || "-",
      check_in: item.check_in,
      check_out: item.check_out,
      is_late: item.is_late,
      is_overtime: item.is_overtime,
    })) || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-600">Manage staff, attendance, and leave requests.</p>
        </div>

        <SignOutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Staff" value={String(totalStaff || 0)} />
        <SummaryCard title="Filtered Attendance" value={String(presentCount)} />
        <SummaryCard title="Checked Out" value={String(checkedOutCount)} />
        <SummaryCard
          title="Pending Leaves"
          value={String(pendingLeaves?.length || 0)}
          subtitle={`Late in Range: ${lateCount}`}
        />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <CreateStaffForm />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attendance Filter</h2>
            <p className="text-sm text-slate-600">
              Filter attendance by date range and export results.
            </p>
          </div>

          <ExportAttendanceButton rows={exportRows} />
        </div>

        <form className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <input
              type="date"
              name="from"
              defaultValue={fromDate}
              className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <input
              type="date"
              name="to"
              defaultValue={toDate}
              className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-black px-4 py-3 text-white hover:opacity-90"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Attendance Table</h2>
          <StatusBadge
            label={`${presentCount} Records`}
            variant="default"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Check In</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Check Out</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Late</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Overtime</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows?.length ? (
                attendanceRows.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.profiles?.email || "-"}
                    </td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    No attendance records found for this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pending Leave Requests</h2>
          <StatusBadge
            label={`${pendingLeaves?.length || 0} Pending`}
            variant="warning"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Start Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">End Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Reason</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Applied On</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves?.length ? (
                pendingLeaves.map((leave: any) => (
                  <tr key={leave.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {leave.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {leave.profiles?.email || "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(leave.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(leave.end_date)}</td>
                    <td className="px-4 py-3 text-slate-600">{leave.reason}</td>
                    <td className="px-4 py-3">{formatDateTime(leave.created_at)}</td>
                    <td className="px-4 py-3">
                      <LeaveActionButtons leaveId={leave.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No pending leave requests.
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