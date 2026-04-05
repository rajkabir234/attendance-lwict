"use client";

import { useState } from "react";

export default function CreateStaffForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shiftStart, setShiftStart] = useState("09:00");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateStaff = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !shiftStart.trim()) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          shift_start: `${shiftStart}:00`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create staff.");
        setMessageType("error");
        return;
      }

      setMessage("Staff account created successfully.");
      setMessageType("success");
      setFullName("");
      setEmail("");
      setPassword("");
      setShiftStart("09:00");
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
          Create Staff Account
        </h2>
        <p className="mt-1 text-sm text-muted">
          Add a new staff member and assign their shift start time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Full Name
          </label>
          <input
            className="w-full rounded-xl px-4 py-3"
            type="text"
            placeholder="Enter full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            className="w-full rounded-xl px-4 py-3"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
          </label>
          <input
            className="w-full rounded-xl px-4 py-3"
            type="password"
            placeholder="Set temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Shift Start Time
          </label>
          <input
            className="w-full rounded-xl px-4 py-3"
            type="time"
            value={shiftStart}
            onChange={(e) => setShiftStart(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCreateStaff}
          className="btn-base btn-primary"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Staff"}
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