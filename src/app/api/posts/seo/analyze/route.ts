import { NextRequest, NextResponse } from 'next/server';
import { analyzeSeoMetadata } from '@/lib/services/generateSeoMetadata';

// POST /api/posts/seo/analyze - Analyze SEO metadata
export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();

    // Analyze SEO metadata
    const analysis = analyzeSeoMetadata(metadata);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SEO metadata' },
      { status: 500 }
    );
  }
}
