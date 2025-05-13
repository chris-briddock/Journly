"use client";

import Image from "next/image";

interface FeaturedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function FeaturedImage({ src, alt, className = "object-cover", priority = false }: FeaturedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      priority={priority}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
      }}
    />
  );
}
