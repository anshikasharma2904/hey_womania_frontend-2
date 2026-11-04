export const trackMetaEvent = async (eventName: string, eventData: any, customEventId?: string) => {
  if (typeof window === "undefined") return;

  const eventId = customEventId || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Fire browser pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", eventName, eventData, { eventID: eventId });
  }

  // If this is an AddToCart event, also record it in the store database analytics so Admin matches Meta
  if (eventName === "AddToCart") {
    try {
      let sessionId = localStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("analytics_session_id", sessionId);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.heywomaniyaa.com";
      const payload = {
        eventType: "add_to_cart",
        url: window.location.pathname,
        sessionId,
        metadata: {
          productName: eventData?.content_name || "Product",
          productId: Array.isArray(eventData?.content_ids) ? eventData.content_ids[0] : (eventData?.content_ids || ""),
          price: eventData?.value ? Number(eventData.value) : undefined,
          quantity: eventData?.quantity || 1,
          size: eventData?.size,
          color: eventData?.color,
          sku: eventData?.sku
        }
      };

      // Use keepalive / sendBeacon if supported, or fetch
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
    } catch (err) {
      console.error("Failed to forward AddToCart to admin analytics:", err);
    }
  }

  // Fire CAPI
  try {
    const fbpMatch = document.cookie.match(/_fbp=([^;]*)/);
    const fbcMatch = document.cookie.match(/_fbc=([^;]*)/);
    
    await fetch("/api/tracking/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        eventData,
        eventSourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        fbp: fbpMatch ? fbpMatch[1] : undefined,
        fbc: fbcMatch ? fbcMatch[1] : undefined
      })
    });
  } catch (error) {
    console.error("Failed to send Meta CAPI event", error);
  }
};
