import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getAdminCookie() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("hey_womania_admin_session");
  const userToken = cookieStore.get("hey_womania_session");
  const token = adminToken || userToken;
  return token ? `hey_womania_admin_session=${token.value}; hey_womania_session=${token.value}` : "";
}

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/admin/dashboard/central-wallet`, {
      headers: {
        Cookie: await getAdminCookie()
      },
      cache: "no-store"
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
