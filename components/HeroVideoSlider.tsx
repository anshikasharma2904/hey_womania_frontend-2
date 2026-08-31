"use client";

import { useEffect, useRef } from "react";

export function HeroVideoSlider() {
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto play on mount
  useEffect(() => {
    if (desktopVideoRef.current) {
      desktopVideoRef.current.currentTime = 0;
      void desktopVideoRef.current.play().catch(() => { });
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.currentTime = 0;
      void mobileVideoRef.current.play().catch(() => { });
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#fcf9f4]">
      <div className="relative h-[65vh] w-full min-h-[420px] max-h-[850px] md:h-[80vh] lg:h-[88vh]">
        {/* Desktop Video */}
        <div className="absolute inset-0 z-10 hidden md:block">
          <video
            ref={desktopVideoRef}
            src="/headerVideo.mp4"
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            autoPlay
            loop
            className="h-full w-full object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Mobile Video */}
        <div className="absolute inset-0 z-10 block md:hidden">
          <video
            ref={mobileVideoRef}
            src="/phoneVideo.mp4"
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            autoPlay
            loop
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
