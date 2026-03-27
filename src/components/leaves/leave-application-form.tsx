"use client";

import { useState } from "react";

export default function LeaveApplicationForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      setMessage("All fields are required.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/leaves/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to apply for leave.");
        return;
      }

      setMessage("Leave request submitted successfully.");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Apply for Leave</h2>
        <p className="text-sm text-slate-600">
          Submit your leave request for admin approval.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Reason</label>
        <textarea
          className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
          rows={4}
          placeholder="Write the reason for your leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <button
        onClick={handleApply}
        className="rounded-md bg-black px-5 py-3 text-white hover:opacity-90 disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Apply Leave"}
      </button>

      {message && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {message}
        </div>
      )}
    </div>
  );
}