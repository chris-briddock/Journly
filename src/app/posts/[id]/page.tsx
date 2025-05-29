import type { Metadata } from "next/types";
import { fetchPostMetadata } from "@/lib/api/posts";
import { PostPageClient } from "./PostPageClient";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Generate metadata for SEO using API route
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;

    // Try to fetch metadata from API
    const metadataResponse = await fetchPostMetadata(id);

    // Return the metadata structure from our API
    return {
      title: metadataResponse.title,
      description: metadataResponse.description,
      keywords: metadataResponse.keywords,
      authors: metadataResponse.authors,
      openGraph: metadataResponse.openGraph,
      twitter: metadataResponse.twitter,
      robots: metadataResponse.robots,
      alternates: metadataResponse.alternates,
    };
  } catch (error) {
    console.error('Error generating metadata for post:', error);

    // Try to get basic post info as fallback
    try {
      // Use a simpler approach for fallback
      return {
        title: "Loading Post...",
        description: "Loading post content...",
      };
    } catch (fallbackError) {
      console.error('Fallback metadata generation failed:', fallbackError);
      return {
        title: "Post Not Found",
        description: "The requested post could not be found.",
      };
    }
  }
}

// Server component that passes the post ID to the client component
export default async function PostPage({ params }: Props) {
  const { id } = await params;

  // Pass the post ID to the client component which will use TanStack Query
  return <PostPageClient postId={id} />;
}
