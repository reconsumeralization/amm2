import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import config from '../../../payload.config';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  try {
    const payload = await getPayload({ config });

    let settings;
    if (tenantId) {
      // Get tenant-specific settings
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
      });
    } else {
      // Get global settings
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { exists: false } },
        limit: 1,
      });
    }

    if (settings.docs.length === 0) {
      // Return default settings if none found
      return NextResponse.json({
        editor: {
          enabledPlugins: ['image', 'serviceTemplate', 'productEmbed', 'aiContent'],
          theme: {
            heading: 'text-2xl font-bold',
            link: 'text-blue-500 underline',
            fontFamily: 'Inter, sans-serif',
          },
          imageOptimization: {
            maxImageSize: 5242880,
            responsiveSizes: [
              { width: 320, label: 'mobile' },
              { width: 768, label: 'tablet' },
              { width: 1200, label: 'desktop' },
            ],
            formats: ['jpeg', 'webp'],
            quality: 80,
            lazyLoading: true,
            webpFallback: true,
          },
        },
        barbershop: {
          simulator: {
            enabled: true,
            styles: [
              { style: 'Classic Fade', category: 'fade' },
              { style: 'High Fade', category: 'fade' },
              { style: 'Low Fade', category: 'fade' },
              { style: 'Pompadour', category: 'classic' },
              { style: 'Quiff', category: 'modern' },
              { style: 'Slick Back', category: 'classic' },
              { style: 'Textured Crop', category: 'modern' },
              { style: 'Buzz Cut', category: 'classic' },
              { style: 'Mohawk', category: 'modern' },
              { style: 'Undercut', category: 'modern' },
              { style: 'Clean Shaven', category: 'beard' },
              { style: 'Stubble', category: 'beard' },
              { style: 'Short Beard', category: 'beard' },
              { style: 'Long Beard', category: 'beard' },
              { style: 'Goatee', category: 'beard' },
              { style: 'Mustache', category: 'beard' },
            ],
          },
        },
      });
    }

    return NextResponse.json(settings.docs[0]);
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, ...settingsData } = body;
    
    const payload = await getPayload({ config });

    // Check if settings already exist for this tenant
    const existingSettings = await payload.find({
      collection: 'settings',
      where: tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
      limit: 1,
    });

    let result;
    if (existingSettings.docs.length > 0) {
      // Update existing settings
      result = await payload.update({
        collection: 'settings',
        id: existingSettings.docs[0].id,
        data: {
          ...settingsData,
          tenant: tenantId || undefined,
        },
      });
    } else {
      // Create new settings
      result = await payload.create({
        collection: 'settings',
        data: {
          name: tenantId ? `Settings for ${tenantId}` : 'Global Settings',
          ...settingsData,
          tenant: tenantId || undefined,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' }, 
      { status: 500 }
    );
  }
}
