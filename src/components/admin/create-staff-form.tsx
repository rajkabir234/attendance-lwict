"use client";

import { useState } from "react";

export default function CreateStaffForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shiftStart, setShiftStart] = useState("09:00");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateStaff = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !shiftStart.trim()) {
      setMessage("All fields are required.");
      return;
    }

    setSubmitting(true);
    setMessage("");

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
        return;
      }

      setMessage("Staff account created successfully.");
      setFullName("");
      setEmail("");
      setPassword("");
      setShiftStart("09:00");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Create Staff Account</h2>
        <p className="text-sm text-slate-600">Add a new staff member and assign shift time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full rounded-md border border-slate-300 p-3 outline-none focus:border-black"
          type="time"
          value={shiftStart}
          onChange={(e) => setShiftStart(e.target.value)}
        />
      </div>

      <button
        onClick={handleCreateStaff}
        className="rounded-md bg-black px-5 py-3 text-white hover:opacity-90 disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Creating..." : "Create Staff"}
      </button>

      {message && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {message}
        </div>
      )}
    </div>
  );
}