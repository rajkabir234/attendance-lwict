"use client";

import { useState } from "react";

export default function LeaveApplicationForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageType("");

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
        setMessageType("error");
        return;
      }

      setMessage("Leave request submitted successfully.");
      setMessageType("success");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Apply for Leave
        </h2>
        <p className="mt-1 text-sm text-muted">
          Submit your leave request for admin approval.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Start Date
          </label>
          <input
            type="date"
            className="w-full rounded-xl px-4 py-3"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            End Date
          </label>
          <input
            type="date"
            className="w-full rounded-xl px-4 py-3"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Reason
        </label>
        <textarea
          className="w-full rounded-xl px-4 py-3"
          rows={5}
          placeholder="Write the reason for your leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApply}
          className="btn-base btn-primary"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Apply Leave"}
        </button>
      </div>

      {message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            messageType === "success"
              ? "status-success"
              : "status-danger"
          }`}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}