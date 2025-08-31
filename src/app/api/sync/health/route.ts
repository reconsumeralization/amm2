import { NextRequest, NextResponse } from 'next/server';
import { dataSyncService } from '@/lib/data-sync-service';
import { getSettingsWithFallback } from '@/lib/settings-initializer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const detailed = searchParams.get('detailed') === 'true';

    // Initialize the sync service
    await dataSyncService.initialize();

    const healthCheck = await dataSyncService.healthCheck();
    const settings = await getSettingsWithFallback(tenantId || undefined);

    // Basic health information
    const basicHealth = {
      overall: healthCheck.overall,
      services: healthCheck.services,
      timestamp: new Date().toISOString(),
    };

    // Return basic health if not detailed
    if (!detailed) {
      return NextResponse.json(basicHealth);
    }

    // Detailed health information
    const detailedHealth = {
      ...basicHealth,
      configuration: {
        googleCalendar: {
          enabled: settings.googleCalendar?.enabled || false,
          calendarId: settings.googleCalendar?.calendarId || 'primary',
          timezone: settings.googleCalendar?.timezone || 'America/New_York',
          syncInterval: settings.googleCalendar?.syncInterval || 300,
        },
        chatbot: {
          enabled: settings.chatbot?.enabled || false,
          displayPaths: settings.chatbot?.displayPaths?.length || 0,
          roles: settings.chatbot?.roles?.length || 0,
        },
        email: {
          enabled: settings.email?.enableNotifications || false,
          fromAddress: settings.email?.fromAddress ? '***@***' : 'not configured',
        },
        stripe: {
          currency: settings.stripe?.currency || 'usd',
          taxRate: settings.stripe?.taxRate || 0,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasEmailConfig: !!process.env.SMTP_HOST,
      },
      recommendations: generateHealthRecommendations(healthCheck, settings),
    };

    return NextResponse.json(detailedHealth);

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        overall: 'unhealthy',
        error: 'Failed to perform health check',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function generateHealthRecommendations(healthCheck: any, settings: any): string[] {
  const recommendations: string[] = [];

  // Check for unhealthy services
  Object.entries(healthCheck.services).forEach(([service, status]: [string, any]) => {
    if (status.status === 'unhealthy') {
      switch (service) {
        case 'payload':
          recommendations.push('Database connection issues detected. Check Payload CMS configuration and database connectivity.');
          break;
        case 'googleCalendar':
          recommendations.push('Google Calendar integration is unhealthy. Verify Google API credentials and calendar settings.');
          break;
        case 'settings':
          recommendations.push('Settings service is unhealthy. Check settings initialization and database access.');
          break;
      }
    }
  });

  // Check configuration issues
  if (!settings.googleCalendar?.enabled) {
    recommendations.push('Google Calendar sync is disabled. Enable it in settings for appointment synchronization.');
  }

  if (!settings.email?.enableNotifications) {
    recommendations.push('Email notifications are disabled. Enable them for important system alerts.');
  }

  if (!settings.chatbot?.enabled) {
    recommendations.push('Chatbot is disabled. Enable it to improve customer support.');
  }

  // Check environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    recommendations.push('Google API credentials are missing. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    recommendations.push('Stripe configuration is incomplete. Set STRIPE_SECRET_KEY for payment processing.');
  }

  if (!process.env.SMTP_HOST) {
    recommendations.push('Email configuration is incomplete. Set SMTP_HOST and related variables for email functionality.');
  }

  if (recommendations.length === 0) {
    recommendations.push('All systems are healthy and properly configured.');
  }

  return recommendations;
}
