'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only allow access in development
    if (process.env.NODE_ENV !== 'development') {
      redirect('/');
      return;
    }

    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/swagger');
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('API documentation is only available in development');
          }
          throw new Error('Failed to fetch API specification');
        }
        const data = await response.json();
        setSpec(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading API documentation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Error Loading Documentation</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Journly API Documentation</h1>
              <p className="text-muted-foreground mt-2">
                Interactive API documentation for the Journly blog platform
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Development Only
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Journly
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg border overflow-hidden">
          {spec && (
            <SwaggerUI
              spec={spec}
              docExpansion="list"
              defaultModelsExpandDepth={1}
              defaultModelExpandDepth={1}
              displayRequestDuration={true}
              tryItOutEnabled={true}
              filter={true}
              showExtensions={false}
              showCommonExtensions={false}
              supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
              deepLinking={true}
              displayOperationId={false}
              showMutatedRequest={true}
              requestInterceptor={(request) => {
                // Add any custom headers or authentication here
                console.log('Request:', request);
                return request;
              }}
              responseInterceptor={(response) => {
                // Handle responses here if needed
                console.log('Response:', response);
                return response;
              }}
              onComplete={() => {
                console.log('Swagger UI loaded successfully');
              }}
              plugins={[]}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Journly API v1.0.0 • Built with{' '}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Next.js
              </a>{' '}
              and{' '}
              <a
                href="https://swagger.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Swagger
              </a>
            </p>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              This documentation is only available in development mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
