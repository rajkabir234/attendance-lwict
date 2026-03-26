import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haversineDistanceMeters } from "@/lib/utils/geo";

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
    const today = now.toISOString().slice(0, 10);
    const shiftDate = new Date(`${today}T${profile.shift_start}`);
    const isLate = now > shiftDate;

    if (isLate && !lateJustification?.trim()) {
      return NextResponse.json(
        { error: "Late justification is required" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(`${today}T00:00:00`);
    const endOfDay = new Date(`${today}T23:59:59`);

    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("user_id", user.id)
      .gte("check_in", startOfDay.toISOString())
      .lte("check_in", endOfDay.toISOString())
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