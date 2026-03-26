"use client";

import { useState } from "react";

export default function CheckoutForm() {
  const [checkoutReport, setCheckoutReport] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!checkoutReport.trim()) {
      setMessage("Brief report is required.");
      return;
    }

    setSubmitting(true);
    setMessage("");

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

    setSubmitting(false);

    if (!res.ok) {
      setMessage(data.error || "Check-out failed");
      return;
    }

    setMessage("Check-out successful");
    setCheckoutReport("");
    setIsOvertime(false);
  };

  return (
    <div className="border rounded-xl p-5 space-y-4">
      <h2 className="text-xl font-semibold">Check Out</h2>

      <textarea
        className="w-full border rounded-md p-3"
        placeholder="Write a brief report of today's work"
        value={checkoutReport}
        onChange={(e) => setCheckoutReport(e.target.value)}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isOvertime}
          onChange={(e) => setIsOvertime(e.target.checked)}
        />
        Mark as Overtime
      </label>

      <button
        onClick={handleCheckout}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Check Out"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
