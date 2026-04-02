"use client";

import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils/format";

type AttendanceRow = {
  id: string;
  user_id: string;
  check_in: string | null;
  check_out: string | null;
  checkout_report?: string | null;
  is_late: boolean;
  late_justification?: string | null;
  is_overtime: boolean;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
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

export default function AttendanceTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [onlyLate, setOnlyLate] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AttendanceRow | null>(null);

  const staffOptions = useMemo(() => {
    const uniqueMap = new Map<string, string>();

    rows.forEach((row) => {
      const name = row.profiles?.full_name?.trim() || "Unknown";
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
      const name = row.profiles?.full_name || "";
      const email = row.profiles?.email || "";
      const lateReason = row.late_justification || "";
      const workReport = row.checkout_report || "";
      const staffKey = normalize(name) || row.user_id;

      const matchesSearch =
        !searchValue ||
        normalize(name).includes(searchValue) ||
        normalize(email).includes(searchValue) ||
        normalize(lateReason).includes(searchValue) ||
        normalize(workReport).includes(searchValue);

      const matchesStaff = staffFilter === "all" || staffFilter === staffKey;
      const matchesLate = !onlyLate || row.is_late;

      return matchesSearch && matchesStaff && matchesLate;
    });
  }, [rows, search, staffFilter, onlyLate]);

  const currentIndex = filteredRows.findIndex((row) => row.id === selectedRow?.id);

  const goPrev = () => {
    if (currentIndex > 0) {
      setSelectedRow(filteredRows[currentIndex - 1]);
    }
  };

  const goNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredRows.length - 1) {
      setSelectedRow(filteredRows[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedRow(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handlePrint = () => {
    if (!selectedRow) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const name = selectedRow.profiles?.full_name || "Unknown";
    const email = selectedRow.profiles?.email || "-";

    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #0f172a;
            }
            h1 {
              margin-bottom: 8px;
            }
            .meta {
              margin-bottom: 24px;
              color: #475569;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 16px;
            }
            .label {
              font-size: 12px;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 8px;
            }
            .value {
              white-space: pre-wrap;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <h1>Attendance Details</h1>
          <div class="meta">${name} • ${email}</div>

          <div class="card">
            <div class="label">Check In</div>
            <div class="value">${formatDateTime(selectedRow.check_in)}</div>
          </div>

          <div class="card">
            <div class="label">Check Out</div>
            <div class="value">${formatDateTime(selectedRow.check_out)}</div>
          </div>

          <div class="card">
            <div class="label">Late Status</div>
            <div class="value">${selectedRow.is_late ? "Late" : "On Time"}</div>
          </div>

          <div class="card">
            <div class="label">Overtime</div>
            <div class="value">${selectedRow.is_overtime ? "Yes" : "No"}</div>
          </div>

          <div class="card">
            <div class="label">Late Reason</div>
            <div class="value">${selectedRow.late_justification?.trim() || "—"}</div>
          </div>

          <div class="card">
            <div class="label">Work Report</div>
            <div class="value">${selectedRow.checkout_report?.trim() || "—"}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, late reason, or work report"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Staff</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
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
          <label className="flex w-full items-center justify-between rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
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

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Search records, filter by staff, and inspect complete details.
        </p>
        <StatusBadge label={`${filteredRows.length} Showing`} variant="default" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
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
                <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {item.profiles?.full_name || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.profiles?.email || "-"}
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
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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

      {selectedRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Attendance Details</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedRow.profiles?.full_name || "Unknown"} •{" "}
                  {selectedRow.profiles?.email || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  onClick={goPrev}
                  disabled={currentIndex <= 0}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  onClick={goNext}
                  disabled={currentIndex === -1 || currentIndex >= filteredRows.length - 1}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Check In
                  </p>
                  <p className="mt-2 text-sm text-slate-800">
                    {formatDateTime(selectedRow.check_in)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Check Out
                  </p>
                  <p className="mt-2 text-sm text-slate-800">
                    {formatDateTime(selectedRow.check_out)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">Late Status</p>
                  <div className="mt-3">
                    {selectedRow.is_late ? (
                      <StatusBadge label="Late" variant="warning" />
                    ) : (
                      <StatusBadge label="On Time" variant="success" />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">Overtime</p>
                  <div className="mt-3">
                    {selectedRow.is_overtime ? (
                      <StatusBadge label="Overtime" variant="default" />
                    ) : (
                      <span className="text-sm text-slate-700">No</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Late Reason</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {selectedRow.late_justification?.trim()
                    ? selectedRow.late_justification
                    : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Work Report</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {selectedRow.checkout_report?.trim()
                    ? selectedRow.checkout_report
                    : "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white transition hover:opacity-90"
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