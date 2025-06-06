import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI specification for the Journly API (development only)
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Not available in production
 */
export async function GET() {
  // Only allow access in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'API documentation is only available in development' },
      { status: 404 }
    );
  }

  return NextResponse.json(swaggerSpec);
}
