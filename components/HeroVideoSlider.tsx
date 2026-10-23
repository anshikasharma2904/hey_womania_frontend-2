"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function HeroVideoSlider({ heroVideoMobile }: { heroVideoMobile?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const configuredMobileUrl = heroVideoMobile || "/phoneVideo.mp4";
  const mobileUrl = ["/phoneVideo.mp4", "phoneVideo.mp4"].includes(configuredMobileUrl)
    ? "/media/hero-mobile-v1.mp4"
    : configuredMobileUrl.startsWith("/uploads") ? `${API_URL}${configuredMobileUrl}` : configuredMobileUrl;
  const [videoReady, setVideoReady] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    // Treat as vertical layout on phones AND on tablets in portrait mode
    const portraitMedia = window.matchMedia(
      "(max-width: 1023px) and (orientation: portrait), (max-width: 767px)"
    );
    const updateViewport = () => setIsMobile(portraitMedia.matches);
    updateViewport();
    portraitMedia.addEventListener("change", updateViewport);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    let timer: number | undefined;
    const updatePlayback = () => {
      window.clearTimeout(timer);
      setAllowVideo(false);
      // A still poster avoids decorative downloads on constrained connections.
      if (reducedMotion.matches || connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType || "")) return;
      timer = window.setTimeout(() => setAllowVideo(true), 1500);
    };
    updatePlayback();
    reducedMotion.addEventListener("change", updatePlayback);
    return () => {
      portraitMedia.removeEventListener("change", updateViewport);
      window.clearTimeout(timer);
      reducedMotion.removeEventListener("change", updatePlayback);
    };
  }, []);

  const url = isMobile ? mobileUrl : "/media/hero-desktop-v1.mp4";
  const isImage = /\.(jpe?g|gif|png|webp|avif)(?:[?#]|$)/i.test(url);

  useEffect(() => setVideoReady(false), [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let visible = false;
    const update = () => {
      if (visible && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [allowVideo, isMobile, isImage, url]);

  return (
    <section className="relative w-full overflow-hidden bg-[#fcf9f4]">
      {/* 
        Responsive height and object-top framing:
        - object-top prevents cropping the model's head/face on phones and tablets
        - lg:object-center centers the wide landscape video on desktop
      */}
      <div className="relative h-[72vh] min-h-[460px] max-h-[920px] sm:h-[78vh] md:h-[82vh] lg:h-[88vh] w-full">
        <picture>
          <source media="(max-width: 1023px) and (orientation: portrait), (max-width: 767px)" srcSet="/phoneVideo-poster.webp" />
          <img
            src="/hero-desktop-poster.webp"
            alt="Hey Womaniyaa collection"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-top lg:object-center"
          />
        </picture>
        {isMobile !== null && (isImage ? (
          <img
            src={url}
            alt="Hero Banner"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-top lg:object-center"
          />
        ) : allowVideo && (
          <video
            key={url}
            ref={videoRef}
            src={url}
            muted
            playsInline
            disablePictureInPicture
            preload="none"
            autoPlay
            loop
            onLoadedData={() => setVideoReady(true)}
            className={`absolute inset-0 h-full w-full object-cover object-top lg:object-center transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply" />
      </div>
    </section>
  );
}
