import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haversineDistanceMeters } from "@/lib/utils/geo";
import { getNepalNowParts } from "@/lib/utils/timezone";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude, lateJustification } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("shift_start")
      .eq("id", user.id)
      .single();

    const { data: settings } = await supabase
      .from("settings")
      .select("office_latitude, office_longitude, geofence_radius_m")
      .limit(1)
      .single();

    if (!profile || !settings) {
      return NextResponse.json(
        { error: "Profile or settings not found" },
        { status: 400 }
      );
    }

    const distance = haversineDistanceMeters(
      latitude,
      longitude,
      settings.office_latitude,
      settings.office_longitude
    );

    if (distance > settings.geofence_radius_m) {
      return NextResponse.json(
        { error: `Outside allowed radius. Distance: ${Math.round(distance)}m` },
        { status: 400 }
      );
    }

    const now = new Date();
    const nepal = getNepalNowParts();
    const today = nepal.date;
    const currentTime = nepal.time;

    const isLate = currentTime > profile.shift_start;

    if (isLate && !lateJustification?.trim()) {
      return NextResponse.json(
        { error: "Late justification is required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("user_id", user.id)
      .gte("check_in", `${today}T00:00:00+05:45`)
      .lte("check_in", `${today}T23:59:59+05:45`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("attendance").insert({
      user_id: user.id,
      check_in: now.toISOString(),
      latitude,
      longitude,
      is_late: isLate,
      late_justification: isLate ? lateJustification : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}