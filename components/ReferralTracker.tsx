"use client";

import { useEffect } from "react";

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      const type = params.get("type");
      
      if (ref) {
        localStorage.setItem("hey_womania_ref", ref);
      }
      if (type) {
        localStorage.setItem("hey_womania_ref_type", type);
      }
    }
  }, []);

  return null;
}
