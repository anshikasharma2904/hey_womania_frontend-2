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
      credentials: "include",
      body: JSON.stringify({
        eventType: "page_view",
        url: url,
        sessionId: getSessionId(),
      }),
    }).catch(err => console.error("Analytics Error:", err));
  }, [pathname, searchParams]);

  // Global click tracker for cart/buy clicks (matching Meta's button click detection)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest("button, a, [role='button'], input[type='submit']");
      if (!clickable) return;

      const text = (clickable.textContent || (clickable as HTMLInputElement).value || "").toLowerCase().trim();
      const ariaLabel = (clickable.getAttribute("aria-label") || "").toLowerCase().trim();
      const combined = `${text} ${ariaLabel}`;

      const isCartClick =
        combined.includes("add to cart") ||
        combined.includes("add to bag") ||
        combined.includes("buy now") ||
        combined.includes("add to basket");

      if (isCartClick) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.heywomaniyaa.com";
          const heading = document.querySelector("h1, h2, .product-title")?.textContent?.trim() || "Store Product";
          const payload = {
            eventType: "add_to_cart",
            url: window.location.pathname,
            sessionId: getSessionId(),
            metadata: {
              productName: heading,
              buttonText: (clickable.textContent || "").trim() || "Add to Cart Click"
            }
          };

          if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
            navigator.sendBeacon(`${baseUrl}/api/analytics/event`, blob);
          } else {
            fetch(`${baseUrl}/api/analytics/event`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              keepalive: true,
              body: JSON.stringify(payload)
            }).catch(() => {});
          }
        } catch (e) {
          // ignore tracking error
        }
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  return null;
}

export function CustomAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
