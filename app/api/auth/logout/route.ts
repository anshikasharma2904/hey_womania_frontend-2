import { NextResponse } from "next/server";

export async function POST() {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
    method: "POST"
  });
  
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("hey_womania_session");
  return response;
}
