"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { haversineDistanceMeters } from "@/lib/utils/geo";

type Props = {
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
  shiftStart: string;
};

export default function GeofencedCheckInButton({
  officeLat,
  officeLng,
  radiusMeters,
  shiftStart,
}: Props) {
  const router = useRouter();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lateJustification, setLateJustification] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();

  const isLate = useMemo(() => {
    const today = now.toISOString().slice(0, 10);
    const shiftDate = new Date(`${today}T${shiftStart}`);
    return now > shiftDate;
  }, [now, shiftStart]);

  useEffect(() => {
    if (!coords) return;

    const d = haversineDistanceMeters(
      coords.latitude,
      coords.longitude,
      officeLat,
      officeLng
    );

    setDistance(d);
  }, [coords, officeLat, officeLng]);

  const withinFence = distance !== null && distance <= radiusMeters;

  const handleGetLocation = () => {
    setLoadingLocation(true);
    setMessage("");
    setMessageType("");

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in your browser.");
      setMessageType("error");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoadingLocation(false);
        setMessage("Location fetched successfully.");
        setMessageType("info");
      },
      (error) => {
        setMessage(error.message);
        setMessageType("error");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleCheckIn = async () => {
    if (!coords) {
      setMessage("Please get your location first.");
      setMessageType("error");
      return;
    }

    if (!withinFence) {
      setMessage("You are outside the office geofence.");
      setMessageType("error");
      return;
    }

    if (isLate && !lateJustification.trim()) {
      setMessage("Late justification is required.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          lateJustification,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Check-in failed");
        setMessageType("error");
        return;
      }

      setMessage("Check-in successful");
      setMessageType("success");
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
          Check In
        </h2>
        <p className="mt-1 text-sm text-muted">
          Fetch your live location, verify office range, and complete attendance.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleGetLocation}
          className="btn-base btn-outline"
          disabled={loadingLocation}
        >
          {loadingLocation ? "Getting location..." : "Get Current Location"}
        </button>

        <button
          type="button"
          onClick={handleCheckIn}
          className="btn-base rounded-xl border border-emerald-200 bg-emerald-600 text-white hover:opacity-90"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Check In"}
        </button>
      </div>

      {coords ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-subtle bg-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Current Coordinates
            </p>
            <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <p>Latitude: {coords.latitude}</p>
              <p>Longitude: {coords.longitude}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-subtle bg-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Geofence Status
            </p>
            <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <p>Distance: {distance ? Math.round(distance) : 0} m</p>
              <p>Allowed Radius: {Math.round(radiusMeters)} m</p>
              <p className={withinFence ? "text-emerald-600" : "text-red-600"}>
                {withinFence ? "Inside office range" : "Outside office range"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isLate ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Late Justification
          </label>
          <textarea
            className="w-full rounded-xl px-4 py-3"
            rows={4}
            placeholder="Please explain why you are checking in late"
            value={lateJustification}
            onChange={(e) => setLateJustification(e.target.value)}
          />
        </div>
      ) : null}

      {message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            messageType === "success"
              ? "status-success"
              : messageType === "info"
              ? "status-info"
              : "status-danger"
          }`}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}