import { requireAdmin } from "@/lib/utils/auth";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import CreateStaffForm from "@/components/admin/create-staff-form";
import ExportAttendanceButton from "@/components/admin/export-attendance-button";
import AttendanceTable from "@/components/admin/attendance-table";
import SignOutButton from "@/components/auth/sign-out-button";
import LeaveActionButtons from "@/components/leaves/leave-action-buttons";
import SummaryCard from "@/components/ui/summary-card";
import StatusBadge from "@/components/ui/status-badge";
import CollapsibleCard from "@/components/ui/collapsible-card";

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

  const { data: rawAttendanceRows } = await supabase
    .from("attendance")
    .select(`
      id,
      user_id,
      check_in,
      check_out,
      checkout_report,
      is_late,
      late_justification,
      is_overtime,
      profiles!attendance_user_id_fkey(full_name, email)
    `)
    .gte("check_in", fromDateTime)
    .lte("check_in", toDateTime)
    .order("check_in", { ascending: false });

  const attendanceRows = rawAttendanceRows?.map((row: any) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  }));

  const { data: rawPendingLeaves } = await supabase
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

  const pendingLeaves = rawPendingLeaves?.map((row: any) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  }));

  const { data: rawLeaveHistory } = await supabase
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
    .order("created_at", { ascending: false });

  const leaveHistory = rawLeaveHistory?.map((row: any) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  }));

  const presentCount = attendanceRows?.length || 0;
  const checkedOutCount =
    attendanceRows?.filter((item) => item.check_out).length || 0;
  const lateCount =
    attendanceRows?.filter((item) => item.is_late).length || 0;

  const approvedLeavesCount =
    leaveHistory?.filter((item) => item.status === "approved").length || 0;

  const rejectedLeavesCount =
    leaveHistory?.filter((item) => item.status === "rejected").length || 0;

  const exportRows =
    attendanceRows?.map((item: any) => ({
      name: item.profiles?.full_name || "Unknown",
      email: item.profiles?.email || "-",
      check_in: item.check_in,
      check_out: item.check_out,
      late_reason: item.late_justification || "",
      checkout_report: item.checkout_report || "",
      is_late: item.is_late,
      is_overtime: item.is_overtime,
    })) || [];

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="app-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-muted">
              Manage staff, attendance, reports, and leave requests.
            </p>
          </div>

          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Staff" value={String(totalStaff || 0)} />
        <SummaryCard title="Attendance Records" value={String(presentCount)} />
        <SummaryCard title="Checked Out" value={String(checkedOutCount)} />
        <SummaryCard
          title="Pending Leaves"
          value={String(pendingLeaves?.length || 0)}
          subtitle={`Late in selected range: ${lateCount}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="All Leave Requests"
          value={String(leaveHistory?.length || 0)}
        />
        <SummaryCard
          title="Approved Leaves"
          value={String(approvedLeavesCount)}
        />
        <SummaryCard
          title="Rejected Leaves"
          value={String(rejectedLeavesCount)}
        />
      </div>

      <CollapsibleCard
        title="Create Staff"
        subtitle="Create and manage new staff accounts."
        defaultOpen={false}
      >
        <CreateStaffForm />
      </CollapsibleCard>

      <CollapsibleCard
        title="Attendance Filter"
        subtitle="Choose a date range for attendance records and export them."
        defaultOpen={true}
        rightSlot={<ExportAttendanceButton rows={exportRows} />}
      >
        <form className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              From
            </label>
            <input
              type="date"
              name="from"
              defaultValue={fromDate}
              className="w-full rounded-xl px-4 py-3"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              To
            </label>
            <input
              type="date"
              name="to"
              defaultValue={toDate}
              className="w-full rounded-xl px-4 py-3"
            />
          </div>

          <div className="flex items-end">
            <button type="submit" className="btn-base btn-primary w-full">
              Apply Filter
            </button>
          </div>
        </form>
      </CollapsibleCard>

      <CollapsibleCard
        title="Attendance Records"
        subtitle="Search records, filter staff, and inspect complete attendance details."
        defaultOpen={true}
      >
        <AttendanceTable rows={attendanceRows || []} />
      </CollapsibleCard>

      <CollapsibleCard
        title="Pending Leave Requests"
        subtitle="Review new leave applications and approve or reject them."
        defaultOpen={true}
        rightSlot={
          <StatusBadge
            label={`${pendingLeaves?.length || 0} Pending`}
            variant="warning"
          />
        }
      >
        <div className="overflow-x-auto rounded-2xl border border-subtle">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Applied On</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves?.length ? (
                pendingLeaves.map((leave: any) => (
                  <tr
                    key={leave.id}
                    className="border-b border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {leave.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {leave.profiles?.email || "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(leave.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(leave.end_date)}</td>
                    <td className="px-4 py-3 text-muted">{leave.reason}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(leave.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <LeaveActionButtons leaveId={leave.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted">
                    No pending leave requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="Leave History"
        subtitle="See all past leave applications and their final status."
        defaultOpen={false}
        rightSlot={
          <StatusBadge
            label={`${leaveHistory?.length || 0} Records`}
            variant="default"
          />
        }
      >
        <div className="overflow-x-auto rounded-2xl border border-subtle">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Applied On</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory?.length ? (
                leaveHistory.map((leave: any) => (
                  <tr
                    key={leave.id}
                    className="border-b border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {leave.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {leave.profiles?.email || "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(leave.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(leave.end_date)}</td>
                    <td className="px-4 py-3 text-muted">{leave.reason}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(leave.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === "approved" ? (
                        <StatusBadge label="Approved" variant="success" />
                      ) : leave.status === "rejected" ? (
                        <StatusBadge label="Rejected" variant="danger" />
                      ) : (
                        <StatusBadge label="Pending" variant="warning" />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted">
                    No leave history found.
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