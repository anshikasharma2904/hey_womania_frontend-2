import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hey_womania_session");

    if (!sessionToken) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, message: "Failed to add payment method" }, { status: res.status });
    }

    const user = await res.json();
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hey_womania_session");

    if (!sessionToken || !id) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/payments/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      body: JSON.stringify({ paymentId: id })
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, message: "Failed to remove payment method" }, { status: res.status });
    }

    const user = await res.json();
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
