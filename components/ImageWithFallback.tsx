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
  onLoad,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);
  const candidates = [...new Set([...fallbackSrcs, fallbackSrc])].filter(candidate => candidate !== src);

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setImgSrc(src);
    setErrorCount(0);
    setIsLoading(true);
  }, [src]);

  return (
    <div className={`relative h-full w-full ${props.className || ''}`}>
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 bg-[#e8e2d7] animate-pulse rounded-inherit" />
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt || ""}
        className={`relative ${props.className || ''}`}
        onLoad={(event) => {
          setIsLoading(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          onError?.(event);
          if (errorCount < candidates.length) {
            setImgSrc(candidates[errorCount]);
            setErrorCount(prev => prev + 1);
          } else {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
