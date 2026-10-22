"use client";

import { useEffect, useRef } from "react";

/** Run decorative carousels only while visible, active and motion is allowed. */
export function useVisibleInterval<T extends HTMLElement>(callback: () => void, delay: number, enabled = true) {
  const ref = useRef<T | null>(null);
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; }, [callback]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: number | undefined;
    const update = () => {
      window.clearInterval(timer);
      timer = undefined;
      if (visible && !document.hidden && !reducedMotion.matches) {
        timer = window.setInterval(() => callbackRef.current(), delay);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, [delay, enabled]);

  return ref;
}
