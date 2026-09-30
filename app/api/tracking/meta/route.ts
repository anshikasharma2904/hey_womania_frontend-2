import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventData, eventSourceUrl, clientIp, userAgent, fbc, fbp } = body;

    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_TOKEN;

    if (!pixelId || !accessToken) {
      return NextResponse.json({ success: false, error: "Meta CAPI credentials missing" }, { status: 500 });
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: "website",
          user_data: {
            client_ip_address: clientIp || req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0",
            client_user_agent: userAgent || req.headers.get("user-agent"),
            fbc: fbc || undefined,
            fbp: fbp || undefined,
          },
          custom_data: eventData
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Meta CAPI Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
