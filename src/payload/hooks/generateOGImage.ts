// src/payload/hooks/generateOGImage.ts
import type { FieldHook } from 'payload';

export const generateOGImage: FieldHook = async ({ req, data, originalDoc }: any) => {
  try {
    if (!data?.title) return data;

    const collectionSlug = req?.collection?.slug;
    const shouldGenerateOG = shouldGenerateOGImage(collectionSlug, data, originalDoc);

    if (!shouldGenerateOG) return data;

    console.log(`[OG] Generating OG image for ${collectionSlug}: ${data.title}`);

    // Generate OG image
    const ogImageUrl = await generateOGImageFromTitle(data.title, collectionSlug, data);

    if (ogImageUrl) {
      return {
        ...data,
        ogImage: ogImageUrl,
      };
    }

    return data;
  } catch (err) {
    console.error('OG image generation failed:', err);
    return data; // Don't break the main operation
  }
};

function shouldGenerateOGImage(collectionSlug: string | undefined, data: any, originalDoc: any): boolean {
  // Only generate for content collections
  const contentCollections = [
    'pages',
    'blog-posts',
    'products',
    'services',
    'events',
    'testimonials'
  ];

  if (!collectionSlug || !contentCollections.includes(collectionSlug)) {
    return false;
  }

  // Generate if:
  // 1. No existing OG image
  // 2. Title changed
  // 3. Explicitly requested
  const titleChanged = data.title !== originalDoc?.title;
  const noExistingImage = !data.ogImage && !originalDoc?.ogImage;
  const forceRegenerate = data.regenerateOGImage === true;

  return titleChanged || noExistingImage || forceRegenerate;
}

async function generateOGImageFromTitle(
  title: string,
  collectionSlug: string | undefined,
  data: any
): Promise<string | null> {
  try {
    // Option 1: Use a cloud service (recommended for production)
    if (process.env.OG_IMAGE_API_URL) {
      return await generateWithCloudService(title, collectionSlug, data);
    }

    // Option 2: Use Playwright for local generation
    if (process.env.NODE_ENV === 'development') {
      return await generateWithPlaywright(title, collectionSlug, data);
    }

    // Option 3: Use a simple HTML template
    return await generateWithTemplate(title, collectionSlug, data);

  } catch (err) {
    console.error('OG image generation error:', err);
    return null;
  }
}

async function generateWithCloudService(
  title: string,
  collectionSlug: string | undefined,
  data: any
): Promise<string | null> {
  try {
    const response = await fetch(process.env.OG_IMAGE_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OG_IMAGE_API_KEY}`,
      },
      body: JSON.stringify({
        title: title.substring(0, 100), // Limit title length
        subtitle: getCollectionDisplayName(collectionSlug),
        theme: 'dark', // or 'light'
        width: 1200,
        height: 630,
        fontSize: 64,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.imageUrl;
  } catch (err) {
    console.error('Cloud service generation failed:', err);
    return null;
  }
}

async function generateWithPlaywright(
  title: string,
  collectionSlug: string | undefined,
  data: any
): Promise<string | null> {
  // This would require Playwright to be installed
  // Implementation would create an HTML template and screenshot it
  console.log('Playwright OG generation not implemented - using template fallback');
  return generateWithTemplate(title, collectionSlug, data);
}

async function generateWithTemplate(
  title: string,
  collectionSlug: string | undefined,
  data: any
): Promise<string | null> {
  try {
    // Create HTML template
    const html = generateOGHTML(title, collectionSlug);

    // For now, return a placeholder URL
    // In production, you'd upload this to your media storage
    const filename = `og-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;

    try {
      // Convert HTML to image using puppeteer
      const puppeteer = await import('puppeteer')
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
      
      const page = await browser.newPage()
      await page.setViewport({ width: 1200, height: 630 })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const imageBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1200, height: 630 }
      })
      
      await browser.close()

      // Upload image to media collection
      const payload = req.payload
      if (payload) {
        const uploadedImage = await payload.create({
          collection: 'media' as any as any,
          data: {
            alt: `Open Graph image for ${title}`,
            filename: filename,
          },
          file: {
            data: imageBuffer,
            mimetype: 'image/png',
            name: filename,
            size: imageBuffer.length
          } as any
        })

        console.log('OG Image uploaded:', uploadedImage.url)
        return uploadedImage.url || uploadedImage.filename
      }
    } catch (imageError) {
      console.error('Failed to generate OG image:', imageError)
    }

    // Fallback to API endpoint if image generation fails
    return `/api/og-image?title=${encodeURIComponent(title)}&collection=${collectionSlug}`;
  } catch (err) {
    console.error('Template generation failed:', err);
    return null;
  }
}

function generateOGHTML(title: string, collectionSlug: string | undefined): string {
  const displayTitle = title.substring(0, 80);
  const subtitle = getCollectionDisplayName(collectionSlug);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0;
          padding: 60px;
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: white;
          text-align: center;
        }
        .title {
          font-size: 64px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.1;
          max-width: 1000px;
        }
        .subtitle {
          font-size: 32px;
          font-weight: 400;
          opacity: 0.8;
          margin-bottom: 40px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="logo">M</div>
      <h1 class="title">${displayTitle}</h1>
      <p class="subtitle">${subtitle}</p>
    </body>
    </html>
  `;
}

function getCollectionDisplayName(collectionSlug: string | undefined): string {
  const names: Record<string, string> = {
    'pages': 'Modern Men BarberShop',
    'blog-posts': 'Blog Post',
    'products': 'Product',
    'services': 'Service',
    'events': 'Event',
    'testimonials': 'Testimonial',
  };

  return names[collectionSlug || ''] || 'Modern Men BarberShop';
}
