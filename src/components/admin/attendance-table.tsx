"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils/format";
import { useEffect } from "react";

type AttendanceRow = {
  id: string;
  user_id: string;
  check_in: string | null;
  check_out: string | null;
  checkout_report?: string | null;
  is_late: boolean;
  late_justification?: string | null;
  is_overtime: boolean;
  profiles?:
    | {
        full_name?: string | null;
        email?: string | null;
      }
    | Array<{
        full_name?: string | null;
        email?: string | null;
      }>
    | null;
};

type Props = {
  rows: AttendanceRow[];
};

function formatShortDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function normalize(value: string | null | undefined) {
  return (value || "").toLowerCase().trim();
}

function getProfile(profile: AttendanceRow["profiles"]) {
  if (Array.isArray(profile)) return profile[0] || null;
  return profile || null;
}

export default function AttendanceTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [onlyLate, setOnlyLate] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AttendanceRow | null>(null);

  const staffOptions = useMemo(() => {
    const uniqueMap = new Map<string, string>();

    rows.forEach((row) => {
      const profile = getProfile(row.profiles);
      const name = profile?.full_name?.trim() || "Unknown";
      const key = normalize(name) || row.user_id;
      if (!uniqueMap.has(key)) uniqueMap.set(key, name);
    });

    return Array.from(uniqueMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const searchValue = normalize(search);

    return rows.filter((row) => {
      const profile = getProfile(row.profiles);
      const name = profile?.full_name || "";
      const email = profile?.email || "";
      const lateReason = row.late_justification || "";
      const workReport = row.checkout_report || "";
      const staffKey = normalize(name) || row.user_id;

      const matchesSearch =
        !searchValue ||
        normalize(name).includes(searchValue) ||
        normalize(email).includes(searchValue) ||
        normalize(lateReason).includes(searchValue) ||
        normalize(workReport).includes(searchValue);

      const matchesStaff =
        staffFilter === "all" || staffFilter === staffKey;

      const matchesLate = !onlyLate || row.is_late;

      return matchesSearch && matchesStaff && matchesLate;
    });
  }, [rows, search, staffFilter, onlyLate]);
const currentIndex = rows.findIndex((r) => r.id === selectedRow?.id);

const goNext = () => {
  if (currentIndex < rows.length - 1) {
    setSelectedRow(rows[currentIndex + 1]);
  }
};

useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setSelectedRow(null);
  };

  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);

const goPrev = () => {
  if (currentIndex > 0) {
    setSelectedRow(rows[currentIndex - 1]);
  }
};
  return (
    <>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attendance Table</h2>
            <p className="text-sm text-slate-600">
              Search records, filter by staff, and inspect details in a popup.
            </p>
          </div>

          <StatusBadge
            label={`${filteredRows.length} Showing`}
            variant="default"
          />
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 xl:col-span-2">
            <label className="text-sm font-medium text-slate-700">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, late reason, or work report"
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Staff</label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-black"
            >
              <option value="all">All Staff</option>
              {staffOptions.map((staff) => (
                <option key={staff.value} value={staff.value}>
                  {staff.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex w-full items-center justify-between rounded-md border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Only Late</span>
              <input
                type="checkbox"
                checked={onlyLate}
                onChange={(e) => setOnlyLate(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Check In</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Check Out</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Late</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Overtime</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length ? (
                filteredRows.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {getProfile(item.profiles)?.full_name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {getProfile(item.profiles)?.email || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {formatShortDate(item.check_in)}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {formatDateTime(item.check_in)}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {formatDateTime(item.check_out)}
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
                        <span className="text-slate-500">No</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRow(item)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No attendance records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow ? (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    onClick={() => setSelectedRow(null)}
  >
    <div
      className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-xl font-semibold">
            Attendance Details
          </h3>
          <p className="text-sm text-slate-600">
            {getProfile(selectedRow.profiles)?.full_name || "Unknown"} •{" "}
            {getProfile(selectedRow.profiles)?.email || "-"}
          </p>
        </div>

        <button
          onClick={() => setSelectedRow(null)}
          className="text-sm px-3 py-2 border rounded-md hover:bg-slate-50"
        >
          Close ✕
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-5">

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-40"
          >
            ← Previous
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex === rows.length - 1}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>

        {/* Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border">
            <p className="text-xs text-slate-500">Check In</p>
            <p className="mt-2 text-sm">
              {formatDateTime(selectedRow.check_in)}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border">
            <p className="text-xs text-slate-500">Check Out</p>
            <p className="mt-2 text-sm">
              {formatDateTime(selectedRow.check_out)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl">
            <p className="text-sm font-semibold">Late Status</p>
            <div className="mt-2">
              {selectedRow.is_late ? "Late" : "On Time"}
            </div>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="text-sm font-semibold">Overtime</p>
            <div className="mt-2">
              {selectedRow.is_overtime ? "Yes" : "No"}
            </div>
          </div>
        </div>

        {/* Late Reason */}
        <div className="p-4 border rounded-xl">
          <p className="font-semibold">Late Reason</p>
          <p className="mt-2 text-sm whitespace-pre-wrap">
            {selectedRow.late_justification || "—"}
          </p>
        </div>

        {/* Work Report */}
        <div className="p-4 border rounded-xl">
          <p className="font-semibold">Work Report</p>
          <p className="mt-2 text-sm whitespace-pre-wrap">
            {selectedRow.checkout_report || "—"}
          </p>
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="w-full mt-2 bg-black text-white py-3 rounded-md"
        >
          Print Report
        </button>
      </div>
    </div>
  </div>
) : null}
    </>
  );
}
