"use client";

import { useEffect, useState } from "react";

export default function LiveDateTime() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="space-y-1 text-slate-600">
        <p className="text-sm">Loading date and time...</p>
      </div>
    );
  }

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-2">
      <p className="text-base text-white-100">{formattedDate}</p>
      <p className="text-3xl font-bold text-white-900">{formattedTime}</p>
    </div>
  );
}