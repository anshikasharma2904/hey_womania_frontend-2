import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getSessionCookie() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  return sessionToken ? `hey_womania_session=${sessionToken.value}` : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/api/orders/${id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: await getSessionCookie()
      }
    });
    
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
