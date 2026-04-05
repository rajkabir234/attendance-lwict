"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutForm() {
  const router = useRouter();

  const [checkoutReport, setCheckoutReport] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!checkoutReport.trim()) {
      setMessage("Brief report is required.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutReport,
          isOvertime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Check-out failed");
        setMessageType("error");
        return;
      }

      setMessage("Check-out successful");
      setMessageType("success");
      setCheckoutReport("");
      setIsOvertime(false);
      router.refresh();
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
          Check Out
        </h2>
        <p className="mt-1 text-sm text-muted">
          Submit a brief work summary before finishing today’s attendance.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Work Report
        </label>
        <textarea
          className="w-full rounded-xl px-4 py-3"
          rows={5}
          placeholder="Write a brief report of today's work"
          value={checkoutReport}
          onChange={(e) => setCheckoutReport(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-subtle bg-muted px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={isOvertime}
          onChange={(e) => setIsOvertime(e.target.checked)}
          className="h-4 w-4"
        />
        <span>Mark this checkout as overtime</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCheckout}
          className="btn-base btn-primary"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Check Out"}
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