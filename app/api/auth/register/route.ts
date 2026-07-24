import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ ok: false, message: data.error }, { status: res.status });
    }
    
    const response = NextResponse.json({ ok: true, user: data.user });
    
    // Forward the session cookie
    const cookieHeader = res.headers.get("set-cookie");
    if (cookieHeader) {
      response.headers.set("set-cookie", cookieHeader);
    }
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unable to create account." },
      { status: 500 }
    );
  }
}

