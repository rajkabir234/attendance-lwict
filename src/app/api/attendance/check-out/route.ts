import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkoutReport, isOvertime } = await req.json();

    if (!checkoutReport?.trim()) {
      return NextResponse.json(
        { error: "Checkout report is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const startOfDay = new Date(`${today}T00:00:00`);
    const endOfDay = new Date(`${today}T23:59:59`);

    const { data: attendance, error: fetchError } = await supabase
      .from("attendance")
      .select("id, check_out")
      .eq("user_id", user.id)
      .gte("check_in", startOfDay.toISOString())
      .lte("check_in", endOfDay.toISOString())
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!attendance) {
      return NextResponse.json(
        { error: "No check-in found for today" },
        { status: 404 }
      );
    }

    if (attendance.check_out) {
      return NextResponse.json(
        { error: "Already checked out today" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("attendance")
      .update({
        check_out: now.toISOString(),
        checkout_report: checkoutReport,
        is_overtime: !!isOvertime,
      })
      .eq("id", attendance.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}