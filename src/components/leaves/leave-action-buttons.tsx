"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  leaveId: string;
};

export default function LeaveActionButtons({ leaveId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [message, setMessage] = useState("");

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(status);
    setMessage("");

    try {
      const res = await fetch("/api/leaves/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leave_id: leaveId,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update leave status.");
        return;
      }

      setMessage(
        status === "approved"
          ? "Leave approved successfully."
          : "Leave rejected successfully."
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleAction("approved")}
          disabled={loading !== null}
          className="btn-base rounded-xl border border-emerald-200 bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading === "approved" ? "Approving..." : "Approve"}
        </button>

        <button
          type="button"
          onClick={() => handleAction("rejected")}
          disabled={loading !== null}
          className="btn-base rounded-xl border border-red-200 bg-red-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading === "rejected" ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-subtle bg-muted px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
          {message}
        </div>
      ) : null}
    </div>
  );
}