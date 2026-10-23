"use client";

import React, { useEffect, useState } from "react";

export function DiwaliDiyasDecor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Floating subtle glowing diyas at edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-3 top-1/3 z-30 hidden lg:block select-none opacity-85 transition-opacity"
      >
        <div className="relative flex flex-col items-center">
          <span className="text-3xl animate-bounce drop-shadow-[0_0_12px_rgba(255,180,50,0.7)]" style={{ animationDuration: "3s" }}>
            🪔
          </span>
          <span className="mt-1 h-12 w-0.5 bg-gradient-to-b from-amber-400 to-transparent opacity-60" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-3 top-1/2 z-30 hidden lg:block select-none opacity-85 transition-opacity"
      >
        <div className="relative flex flex-col items-center">
          <span className="text-3xl animate-bounce drop-shadow-[0_0_12px_rgba(255,180,50,0.7)]" style={{ animationDuration: "3.5s" }}>
            🪔
          </span>
          <span className="mt-1 h-12 w-0.5 bg-gradient-to-b from-amber-400 to-transparent opacity-60" />
        </div>
      </div>
    </>
  );
}
