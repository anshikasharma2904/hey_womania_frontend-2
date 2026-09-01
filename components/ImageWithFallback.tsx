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

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || ""}
      onError={() => {
        if (errorCount < fallbackSrcs.length) {
          setImgSrc(fallbackSrcs[errorCount]);
          setErrorCount(prev => prev + 1);
        } else if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
