"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

export function CustomAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    fetch("https://api.heywomaniyaa.com/api/analytics/event", {
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
