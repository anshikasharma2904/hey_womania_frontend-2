"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideoSlider() {
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isDesktopReady, setIsDesktopReady] = useState(false);

  // Fallback to ensure video shows after YouTube title fades
  useEffect(() => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.currentTime = 0;
      void mobileVideoRef.current.play().catch(() => { });
    }

    const timer = setTimeout(() => setIsDesktopReady(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#fcf9f4]">
      <div className="relative h-[65vh] w-full min-h-[420px] max-h-[850px] md:h-[80vh] lg:h-[88vh]">
        {/* Desktop Video */}
        <div className={`absolute inset-0 z-10 hidden md:block overflow-hidden transition-opacity duration-1000 ${isDesktopReady ? 'opacity-100' : 'opacity-0'}`}>
          <iframe
            src="https://www.youtube.com/embed/fAdYAOFqIC4?autoplay=1&mute=1&loop=1&playlist=fAdYAOFqIC4&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0"
            allow="autoplay; encrypted-media; picture-in-picture"
            className="w-full h-full pointer-events-none"
            style={{ border: 0 }}
            onLoad={() => {
              // Wait 2.5s for YouTube's forced title to disappear before showing
              setTimeout(() => setIsDesktopReady(true), 2500);
            }}
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
