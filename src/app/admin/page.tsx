import { requireAdmin } from "@/lib/utils/auth";
import CreateStaffForm from "@/components/admin/create-staff-form";
import SignOutButton from "@/components/auth/sign-out-button";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const today = new Date().toISOString().slice(0, 10);

  const { data: attendance } = await supabase
    .from("attendance")
    .select("id, user_id, check_in, check_out, is_late, is_overtime")
    .gte("check_in", `${today}T00:00:00`)
    .lte("check_in", `${today}T23:59:59`)
    .order("check_in", { ascending: false });

  const { data: pendingLeaves } = await supabase
    .from("leaves")
    .select("id, user_id, start_date, end_date, reason, status")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-600">Manage staff, attendance, and leave requests.</p>
        </div>

        <SignOutButton />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <CreateStaffForm />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Today’s Attendance</h2>

        <div className="space-y-3">
          {attendance?.length ? (
            attendance.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <p><strong>User ID:</strong> {item.user_id}</p>
                <p><strong>Check In:</strong> {item.check_in}</p>
                <p><strong>Check Out:</strong> {item.check_out || "Not checked out"}</p>
                <p><strong>Late:</strong> {item.is_late ? "Yes" : "No"}</p>
                <p><strong>Overtime:</strong> {item.is_overtime ? "Yes" : "No"}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No attendance records for today.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Pending Leave Requests</h2>

        <div className="space-y-3">
          {pendingLeaves?.length ? (
            pendingLeaves.map((leave) => (
              <div key={leave.id} className="rounded-xl border p-4">
                <p><strong>User ID:</strong> {leave.user_id}</p>
                <p><strong>Start Date:</strong> {leave.start_date}</p>
                <p><strong>End Date:</strong> {leave.end_date}</p>
                <p><strong>Reason:</strong> {leave.reason}</p>
                <p><strong>Status:</strong> {leave.status}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No pending leave requests.</p>
          )}
        </div>
      </div>
    </main>
  );
}