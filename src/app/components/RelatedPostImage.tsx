"use client";

import Image from "next/image";

interface RelatedPostImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function RelatedPostImage({ src, alt, className = "object-cover transition-transform hover:scale-105" }: RelatedPostImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
      }}
    />
  );
}
