import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxy(request: Request, context: RouteContext, method: "GET" | "POST") {
  try {
    const { path } = await context.params;
    const body = method === "POST" ? await request.text() : undefined;
    const res = await fetch(`${API_URL}/api/zoho/${path.join("/")}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: body || undefined,
      cache: "no-store"
    });
    
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context, "GET");
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context, "POST");
}
