"use client";

import { useEffect, useRef, useState } from "react";

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  return match ? match[1] : null;
}

export function HeroVideoSlider() {
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isDesktopReady, setIsDesktopReady] = useState(false);
  
  const [desktopVideoUrl, setDesktopVideoUrl] = useState("fAdYAOFqIC4");
  const [desktopIsYoutube, setDesktopIsYoutube] = useState(true);
  const [desktopIsImage, setDesktopIsImage] = useState(false);
  
  const [mobileVideoUrl, setMobileVideoUrl] = useState("/phoneVideo.mp4");
  const [mobileIsImage, setMobileIsImage] = useState(false);

  useEffect(() => {
    // Fetch dynamic settings
    fetch("http://localhost:5000/api/settings")
      .then(res => {
        if (!res.ok) return {};
        return res.json();
      })
      .then(data => {
        if (data.heroVideoDesktop) {
          const url = data.heroVideoDesktop;
          const isImg = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
          setDesktopIsImage(!!isImg);
          
          if (isImg) {
            setDesktopVideoUrl(url.startsWith('http') ? url : `http://localhost:5000${url}`);
            setDesktopIsYoutube(false);
            setIsDesktopReady(true);
          } else {
            const ytId = getYoutubeId(url);
            if (ytId) {
              setDesktopVideoUrl(ytId);
              setDesktopIsYoutube(true);
            } else {
              setDesktopVideoUrl(url.startsWith('http') ? url : `http://localhost:5000${url}`);
              setDesktopIsYoutube(false);
            }
          }
        }
        
        if (data.heroVideoMobile) {
          const mUrl = data.heroVideoMobile;
          const isImg = mUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
          setMobileIsImage(!!isImg);
          setMobileVideoUrl(mUrl.startsWith('http') ? mUrl : `http://localhost:5000${mUrl}`);
        }
      })
      .catch(err => console.error("Error fetching site settings:", err));
  }, []);

  // Fallback to ensure video shows after YouTube title fades or immediately for native video
  useEffect(() => {
    if (desktopVideoRef.current && !desktopIsYoutube && !desktopIsImage) {
      desktopVideoRef.current.currentTime = 0;
      void desktopVideoRef.current.play().catch(() => { });
    }
    if (mobileVideoRef.current && !mobileIsImage) {
      mobileVideoRef.current.currentTime = 0;
      void mobileVideoRef.current.play().catch(() => { });
    }

    if (!desktopIsYoutube) {
      setIsDesktopReady(true);
    } else {
      const timer = setTimeout(() => setIsDesktopReady(true), 4500);
      return () => clearTimeout(timer);
    }
  }, [desktopIsYoutube, desktopIsImage, desktopVideoUrl, mobileVideoUrl, mobileIsImage]);

  return (
    <section className="relative w-full overflow-hidden bg-[#fcf9f4]">
      <div className="relative h-[65vh] w-full min-h-[420px] max-h-[850px] md:h-[80vh] lg:h-[88vh]">
        
        {/* Desktop View */}
        <div className={`absolute inset-0 z-10 hidden md:block overflow-hidden transition-opacity duration-1000 ${isDesktopReady ? 'opacity-100' : 'opacity-0'}`}>
          {desktopIsImage ? (
            <img src={desktopVideoUrl} alt="Hero Banner" className="w-full h-full object-cover object-center" />
          ) : desktopIsYoutube ? (
            <iframe
              src={`https://www.youtube.com/embed/${desktopVideoUrl}?autoplay=1&mute=1&loop=1&playlist=${desktopVideoUrl}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="w-full h-full pointer-events-none"
              style={{ border: 0 }}
              onLoad={() => {
                setTimeout(() => setIsDesktopReady(true), 2500);
              }}
            />
          ) : (
            <video
              ref={desktopVideoRef}
              src={desktopVideoUrl}
              muted
              playsInline
              autoPlay
              loop
              className="h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Mobile View */}
        <div className="absolute inset-0 z-10 block md:hidden">
          {mobileIsImage ? (
             <img src={mobileVideoUrl} alt="Hero Banner Mobile" className="w-full h-full object-cover object-center" />
          ) : (
            <video
              ref={mobileVideoRef}
              src={mobileVideoUrl}
              muted
              playsInline
              disablePictureInPicture
              preload="auto"
              autoPlay
              loop
              className="h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
