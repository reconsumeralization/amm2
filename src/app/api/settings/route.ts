import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
// Config will be imported dynamically to avoid issues

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  try {
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });

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
        name: tenantId ? `Settings for ${tenantId}` : 'Global Settings',
        chatbot: {
          enabled: true,
          displayPaths: [
            { path: '/portal' },
            { path: '/book' },
            { path: '/services' },
            { path: '/' }
          ],
          roles: ['customer', 'staff'],
          aiTriggers: {
            pendingAppointments: true,
            staffAvailability: true,
            newServices: false,
            userActivityThreshold: 5
          },
          styles: {
            position: 'bottom-right',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '400px',
            animation: 'fade'
          },
          behavior: {
            autoOpen: false,
            welcomeMessage: 'Hello! I\'m your ModernMen assistant. I can help you book appointments, check schedules, or answer questions about our services. How can I help you today?',
            typingIndicator: true
          }
        },
        clock: {
          enabled: true,
          notifications: {
            emailAdmins: true,
            emailTemplate: '<p>{{staffName}} {{action}} at {{timestamp}}.</p>',
            googleCalendarSync: true
          },
          shiftRules: {
            minShiftHours: 4,
            maxShiftHours: 8,
            maxWeeklyHours: 40
          }
        },
        editor: {
          enabledPlugins: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator', 'pageBuilder', 'imageEditor'],
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
          services: [
            { name: 'Classic Haircut', description: 'Professional haircut with styling', price: 35, duration: 45, category: 'haircut' },
            { name: 'Beard Trim', description: 'Precision beard trimming and shaping', price: 25, duration: 30, category: 'beard' },
            { name: 'Hot Towel Shave', description: 'Traditional hot towel shave experience', price: 45, duration: 60, category: 'shave' },
            { name: 'Hair Wash & Style', description: 'Hair wash with professional styling', price: 20, duration: 30, category: 'styling' },
            { name: 'Fade Cut', description: 'Modern fade haircut', price: 40, duration: 45, category: 'haircut' },
            { name: 'Mustache Trim', description: 'Precision mustache trimming', price: 15, duration: 15, category: 'beard' }
          ],
          loyalty: {
            pointsPerBooking: 100,
            pointsPerReferral: 500,
            pointsPerDollar: 10,
            tiers: [
              { name: 'Bronze', minPoints: 0, multiplier: 1.0, benefits: 'Standard rewards' },
              { name: 'Silver', minPoints: 1000, multiplier: 1.1, benefits: '10% bonus points' },
              { name: 'Gold', minPoints: 2500, multiplier: 1.2, benefits: '20% bonus points + priority booking' },
              { name: 'Platinum', minPoints: 5000, multiplier: 1.5, benefits: '50% bonus points + exclusive services' }
            ]
          },
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
          events: {
            enabled: true
          },
          retail: {
            enabled: true
          }
        },
        stripe: {
          currency: 'usd'
        },
        notifications: {
          email: {
            enabled: true
          }
        }
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
    
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });

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
