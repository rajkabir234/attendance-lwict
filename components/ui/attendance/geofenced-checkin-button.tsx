"use client";

import { useMemo, useState } from "react";
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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lateJustification, setLateJustification] = useState("");
  const [message, setMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const now = useMemo(() => new Date(), []);

  const isLate = useMemo(() => {
    const today = now.toISOString().slice(0, 10);
    const shiftDate = new Date(`${today}T${shiftStart}`);
    return now > shiftDate;
  }, [now, shiftStart]);

  const distance = useMemo(() => {
    if (!coords) return null;

    return haversineDistanceMeters(
      coords.latitude,
      coords.longitude,
      officeLat,
      officeLng
    );
  }, [coords, officeLat, officeLng]);

  const withinFence = distance !== null && distance <= radiusMeters;

  const handleGetLocation = () => {
    setLoadingLocation(true);
    setMessage("");

    if (!navigator.geolocation) {
      setMessage("Geolocation not supported in this browser.");
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
      },
      (error) => {
        setMessage(error.message);
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
      return;
    }

    if (!withinFence) {
      setMessage("You are outside the office geofence.");
      return;
    }

    if (isLate && !lateJustification.trim()) {
      setMessage("Late justification is required.");
      return;
    }

    setSubmitting(true);
    setMessage("");

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
    setSubmitting(false);

    if (!res.ok) {
      setMessage(data.error || "Check-in failed");
      return;
    }

    setMessage("Check-in successful");
  };

  return (
    <div className="border rounded-xl p-5 space-y-4">
      <h2 className="text-xl font-semibold">Check In</h2>

      <button
        onClick={handleGetLocation}
        className="px-4 py-2 bg-black text-white rounded-md"
        disabled={loadingLocation}
      >
        {loadingLocation ? "Getting location..." : "Get Current Location"}
      </button>

      {coords && (
        <div className="text-sm space-y-1">
          <p>Latitude: {coords.latitude}</p>
          <p>Longitude: {coords.longitude}</p>
          <p>Distance: {distance ? Math.round(distance) : 0} m</p>
          <p>{withinFence ? "Inside office range" : "Outside office range"}</p>
        </div>
      )}

      {isLate && (
        <textarea
          className="w-full border rounded-md p-3"
          placeholder="Late justification"
          value={lateJustification}
          onChange={(e) => setLateJustification(e.target.value)}
        />
      )}

      <button
        onClick={handleCheckIn}
        className="px-4 py-2 bg-green-600 text-white rounded-md"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Check In"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}