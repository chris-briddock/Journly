// This file defines the types for Next.js App Router components

import 'next';

declare module 'next' {
  export interface PageProps {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}

// Augment the next/types module to include Metadata
declare module 'next/types' {
  export interface Metadata {
    title?: string | { default: string; template?: string };
    description?: string;
    [key: string]: unknown;
  }
}
