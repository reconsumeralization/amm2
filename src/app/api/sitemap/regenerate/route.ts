import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { revalidatePath, revalidateTag } from 'next/cache';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Check if this is a webhook from Payload CMS or authorized request
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.PAYLOAD_WEBHOOK_SECRET || 'dev-webhook-secret';
    
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting sitemap regeneration and cache clearing...');

    // Run the sitemap generation script
    const scriptPath = path.join(process.cwd(), 'scripts/generate-sitemap.ts');
    try {
      const { stdout, stderr } = await execAsync(`npx tsx "${scriptPath}"`);
      console.log('Sitemap generation output:', stdout);
      if (stderr) {
        console.log('Sitemap generation warnings:', stderr);
      }
    } catch (execError: any) {
      console.error('Error running sitemap script:', execError);
      // Continue with cache clearing even if sitemap fails
    }

    // Clear Next.js page cache for key pages
    const pagesToRevalidate = [
      '/',
      '/blog',
      '/team',
      '/services',
      '/about',
      '/contact',
      '/gallery',
      '/testimonials',
      '/documentation'
    ];

    // Revalidate static pages
    for (const page of pagesToRevalidate) {
      try {
        revalidatePath(page);
        console.log(`Revalidated page: ${page}`);
      } catch (revalidateError) {
        console.error(`Error revalidating page ${page}:`, revalidateError);
      }
    }

    // Revalidate cache tags
    const tagsToRevalidate = [
      'blog-posts',
      'team-members', 
      'services',
      'testimonials',
      'pages',
      'media'
    ];

    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag);
        console.log(`Revalidated tag: ${tag}`);
      } catch (revalidateError) {
        console.error(`Error revalidating tag ${tag}:`, revalidateError);
      }
    }

    // Get request body to see what triggered this
    const body = await request.json().catch(() => ({}));
    const triggerInfo = {
      collection: body.collection || 'unknown',
      operation: body.operation || 'unknown',
      timestamp: new Date().toISOString()
    };

    console.log('Cache clearing completed for trigger:', triggerInfo);

    return NextResponse.json({
      success: true,
      message: 'Sitemap regenerated and cache cleared successfully',
      timestamp: new Date().toISOString(),
      revalidatedPages: pagesToRevalidate.length,
      revalidatedTags: tagsToRevalidate.length,
      trigger: triggerInfo
    });

  } catch (error) {
    console.error('Error in sitemap regeneration:', error);
    return NextResponse.json(
      { 
        error: 'Failed to regenerate sitemap and clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET requests for manual triggering in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Manual triggering only allowed in development' },
      { status: 403 }
    );
  }

  // Create a mock POST request for development testing
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${process.env.PAYLOAD_WEBHOOK_SECRET || 'dev-webhook-secret'}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      collection: 'manual-trigger',
      operation: 'development-test'
    })
  });

  return POST(mockRequest as NextRequest);
}