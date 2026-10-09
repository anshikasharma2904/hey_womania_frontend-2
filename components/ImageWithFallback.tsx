"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
  fallbackSrcs?: string[];
}

export default function ImageWithFallback({
  fallbackSrc = "/products/product-placeholder.png",
  fallbackSrcs = [],
  src,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setImgSrc(src);
    setErrorCount(0);
    setIsLoading(true);
  }, [src]);

  return (
    <div className={`relative h-full w-full ${props.className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#e8e2d7] animate-pulse rounded-inherit" />
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt || ""}
        className={`${props.className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (errorCount < fallbackSrcs.length) {
            setImgSrc(fallbackSrcs[errorCount]);
            setErrorCount(prev => prev + 1);
          } else if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
