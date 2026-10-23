"use client";

import React from "react";

export function DiwaliFairyLights() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-10 overflow-hidden z-20 select-none"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing filter for fairy light bulbs */}
          <filter id="glow-bulb" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hanging wire festoons (catenary arcs across the top) */}
        <path
          d="M 0,0 Q 150,22 300,0 Q 450,22 600,0 Q 750,22 900,0 Q 1050,22 1200,0"
          stroke="#fde047"
          strokeWidth="0.8"
          strokeOpacity="0.45"
          fill="none"
        />
        <path
          d="M -50,0 Q 100,16 250,0 Q 400,16 550,0 Q 700,16 850,0 Q 1000,16 1150,0 Q 1250,16 1300,0"
          stroke="#fef08a"
          strokeWidth="0.6"
          strokeOpacity="0.3"
          fill="none"
        />

        {/* Glowing diamond fairy light bulbs positioned along the wire */}
        {[
          { cx: 30, cy: 7, delay: "0s" },
          { cx: 70, cy: 13, delay: "0.4s" },
          { cx: 110, cy: 17, delay: "0.8s" },
          { cx: 150, cy: 18, delay: "1.2s" },
          { cx: 190, cy: 17, delay: "0.2s" },
          { cx: 230, cy: 13, delay: "0.6s" },
          { cx: 270, cy: 7, delay: "1.0s" },
          { cx: 330, cy: 7, delay: "0.3s" },
          { cx: 370, cy: 13, delay: "0.7s" },
          { cx: 410, cy: 17, delay: "1.1s" },
          { cx: 450, cy: 18, delay: "0.5s" },
          { cx: 490, cy: 17, delay: "0.9s" },
          { cx: 530, cy: 13, delay: "1.3s" },
          { cx: 570, cy: 7, delay: "0.1s" },
          { cx: 630, cy: 7, delay: "0.4s" },
          { cx: 670, cy: 13, delay: "0.8s" },
          { cx: 710, cy: 17, delay: "1.2s" },
          { cx: 750, cy: 18, delay: "0.2s" },
          { cx: 790, cy: 17, delay: "0.6s" },
          { cx: 830, cy: 13, delay: "1.0s" },
          { cx: 870, cy: 7, delay: "0.3s" },
          { cx: 930, cy: 7, delay: "0.7s" },
          { cx: 970, cy: 13, delay: "1.1s" },
          { cx: 1010, cy: 17, delay: "0.5s" },
          { cx: 1050, cy: 18, delay: "0.9s" },
          { cx: 1090, cy: 17, delay: "1.3s" },
          { cx: 1130, cy: 13, delay: "0.2s" },
          { cx: 1170, cy: 7, delay: "0.6s" },
        ].map((bulb, idx) => (
          <g
            key={idx}
            className="animate-pulse"
            style={{ animationDelay: bulb.delay, animationDuration: "1.8s" }}
          >
            {/* Outer soft glow ring */}
            <circle
              cx={bulb.cx}
              cy={bulb.cy}
              r="4.5"
              fill="#fbbf24"
              opacity="0.35"
              filter="url(#glow-bulb)"
            />
            {/* Diamond shaped bright filament bulb */}
            <rect
              x={bulb.cx - 2}
              y={bulb.cy - 2}
              width="4"
              height="4"
              transform={`rotate(45 ${bulb.cx} ${bulb.cy})`}
              fill="#fffbeb"
              stroke="#fef08a"
              strokeWidth="0.8"
              filter="url(#glow-bulb)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
