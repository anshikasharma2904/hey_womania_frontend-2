import { NextResponse } from "next/server";
import { callBackendApi } from "@/lib/server/backend-api";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await callBackendApi<{ user?: unknown; error?: string }>("/api/auth/login", {
      method: "POST",
      body: payload
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.error || "Unable to sign in." },
        { status: result.status }
      );
    }

    const response = NextResponse.json({ ok: true, user: result.data?.user });
    const cookieHeader = result.setCookie;
    if (cookieHeader) {
      response.headers.set("set-cookie", cookieHeader);
    }

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid login request payload." },
      { status: 400 }
    );
  }
}
