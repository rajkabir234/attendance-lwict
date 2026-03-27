"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  leaveId: string;
};

export default function LeaveActionButtons({ leaveId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(status);

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
        alert(data.error || "Failed to update leave status.");
        return;
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading !== null}
        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading === "approved" ? "Approving..." : "Approve"}
      </button>

      <button
        onClick={() => handleAction("rejected")}
        disabled={loading !== null}
        className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading === "rejected" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  );
}