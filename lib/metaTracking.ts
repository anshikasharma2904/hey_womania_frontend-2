export const trackMetaEvent = async (eventName: string, eventData: any) => {
  if (typeof window === "undefined") return;

  const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Fire browser pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", eventName, eventData, { eventID: eventId });
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
