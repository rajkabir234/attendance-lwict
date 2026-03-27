"use client";

type AttendanceRow = {
  name: string;
  email: string;
  check_in: string | null;
  check_out: string | null;
  is_late: boolean;
  is_overtime: boolean;
};

type Props = {
  rows: AttendanceRow[];
};

export default function ExportAttendanceButton({ rows }: Props) {
  const handleExport = () => {
    if (!rows.length) {
      alert("No attendance data to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Check In",
      "Check Out",
      "Late",
      "Overtime",
    ];

    const csvRows = rows.map((row) => [
      row.name,
      row.email,
      row.check_in ?? "",
      row.check_out ?? "",
      row.is_late ? "Yes" : "No",
      row.is_overtime ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      Export CSV
    </button>
  );
}