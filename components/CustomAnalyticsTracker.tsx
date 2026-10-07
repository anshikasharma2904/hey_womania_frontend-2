"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function getSessionId() {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

import { Suspense } from "react";

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.heywomaniyaa.com";
    fetch(`${baseUrl}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "page_view",
        url: url,
        sessionId: getSessionId(),
      }),
    }).catch(err => console.error("Analytics Error:", err));
  }, [pathname, searchParams]);

  return null;
}

export function CustomAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
