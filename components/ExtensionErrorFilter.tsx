"use client";

import { useEffect } from "react";

export function ExtensionErrorFilter() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event.reason?.stack || event.reason?.message || event.reason || "");
      if (
        reasonStr.includes("chrome-extension://") ||
        reasonStr.includes("MetaMask") ||
        reasonStr.includes("Phantom") ||
        reasonStr.includes("inpage.js")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
