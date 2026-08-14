"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEOS = [
  { id: "v1", src: "/video/hey%20womaniya%20111.mp4" },
  { id: "v2", src: "/video/video%202.mp4" }
];

export function HeroVideoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Auto transition to next video
  const goToNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
  };

  // Play active video when index changes
  useEffect(() => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (videoEl) {
        if (idx === currentIndex) {
          videoEl.currentTime = 0;
          void videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      }
    });
  }, [currentIndex]);

  return (
    <section className="relative w-full overflow-hidden bg-[#fcf9f4]">
      <div className="relative h-[65vh] w-full min-h-[420px] max-h-[850px] md:h-[80vh] lg:h-[88vh]">
        {HERO_VIDEOS.map((item, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                src={item.src}
                muted
                playsInline
                disablePictureInPicture
                preload="auto"
                autoPlay={isActive}
                onEnded={goToNextSlide}
                className="h-full w-full object-cover object-center"
              />
              {/* Subtle cinematic overlay to mask compression artifacts and improve premium feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply pointer-events-none" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
