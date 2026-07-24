import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Mocking success response for frontend UX
    return NextResponse.json({ ok: true, message: "Withdrawal request submitted successfully." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
