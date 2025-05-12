// This file defines the types for Next.js page props in App Router
// to ensure compatibility with Next.js 15.3

declare module "next" {
  export interface PageProps {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}
