// src/app/api/docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/docs - Serve API documentation
 * Returns the OpenAPI specification for the Modern Men API
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Read the OpenAPI specification file
    const docsPath = path.join(process.cwd(), 'docs', 'api-specification.yaml');

    if (!fs.existsSync(docsPath)) {
      return NextResponse.json(
        {
          error: 'API documentation not found',
          message: 'The OpenAPI specification file is not available'
        },
        { status: 404 }
      );
    }

    const specContent = fs.readFileSync(docsPath, 'utf-8');

    // Return the YAML content with appropriate headers
    return new NextResponse(specContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/yaml',
        'Content-Disposition': 'inline; filename="modernmen-api-spec.yaml"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error serving API docs:', error);
    return NextResponse.json(
      {
        error: 'Failed to serve API documentation',
        message: 'An error occurred while retrieving the API specification'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/docs - Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
