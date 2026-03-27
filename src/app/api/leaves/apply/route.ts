import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { start_date, end_date, reason } = await req.json();

    if (!start_date || !end_date || !reason?.trim()) {
      return NextResponse.json(
        { error: "Start date, end date, and reason are required." },
        { status: 400 }
      );
    }

    if (new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        { error: "Start date cannot be after end date." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("leaves").insert({
      user_id: user.id,
      start_date,
      end_date,
      reason,
      status: "pending",
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