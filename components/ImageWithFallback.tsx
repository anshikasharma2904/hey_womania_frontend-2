"use client";

import React, { useState, useEffect } from "react";
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
  onError,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  // Only update state if src prop actually changed to a new string
  useEffect(() => {
    setImgSrc(src);
    setErrorCount(0);
  }, [src]);

  const candidates = [...new Set([...fallbackSrcs, fallbackSrc])].filter(
    (candidate) => candidate && candidate !== src
  );

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || ""}
      className={className}
      onError={(event) => {
        onError?.(event);
        if (errorCount < candidates.length) {
          setImgSrc(candidates[errorCount]);
          setErrorCount((prev) => prev + 1);
        }
      }}
    />
  );
}
