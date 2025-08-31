import { NextRequest, NextResponse } from 'next/server';
import { dataSyncService } from '@/lib/data-sync-service';

export async function POST(req: NextRequest) {
  try {
    const { tenantId, services } = await req.json();

    // Validate services parameter
    const availableServices = ['calendar', 'users', 'settings', 'all'];
    const requestedServices = Array.isArray(services) ? services : ['all'];
    
    const invalidServices = requestedServices.filter(s => !availableServices.includes(s));
    if (invalidServices.length > 0) {
      return NextResponse.json(
        { error: `Invalid services: ${invalidServices.join(', ')}` },
        { status: 400 }
      );
    }

    const results: any = {};
    let totalSynced = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    // Initialize the sync service
    await dataSyncService.initialize();

    // Handle 'all' service or individual services
    if (requestedServices.includes('all')) {
      const comprehensiveResult = await dataSyncService.syncAllData(tenantId);
      return NextResponse.json({
        success: comprehensiveResult.summary.totalFailed === 0,
        results: {
          calendar: comprehensiveResult.calendar,
          settings: comprehensiveResult.settings,
        },
        summary: comprehensiveResult.summary,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle individual services
    if (requestedServices.includes('calendar')) {
      console.log('Syncing calendar data...');
      results.calendar = await dataSyncService.syncAppointmentsWithCalendar(tenantId);
      totalSynced += results.calendar.synced;
      totalFailed += results.calendar.failed;
      allErrors.push(...results.calendar.errors);
    }

    if (requestedServices.includes('settings')) {
      console.log('Syncing settings...');
      results.settings = await dataSyncService.syncSettingsAcrossServices(tenantId);
      totalSynced += results.settings.synced;
      totalFailed += results.settings.failed;
      allErrors.push(...results.settings.errors);
    }

    if (requestedServices.includes('users')) {
      console.log('Syncing user data...');
      // For user sync, we need a specific user ID or we'll sync all users
      const users = await dataSyncService.payload?.find({
        collection: 'users',
        where: tenantId ? { tenant: { equals: tenantId } } : {},
        limit: 50, // Limit to prevent overwhelming sync
      });

      let userSyncResults = { synced: 0, failed: 0, errors: [] as string[] };
      
      if (users?.docs) {
        for (const user of users.docs) {
          const userResult = await dataSyncService.syncUserData(user.id);
          userSyncResults.synced += userResult.synced;
          userSyncResults.failed += userResult.failed;
          userSyncResults.errors.push(...userResult.errors);
        }
      }

      results.users = userSyncResults;
      totalSynced += userSyncResults.synced;
      totalFailed += userSyncResults.failed;
      allErrors.push(...userSyncResults.errors);
    }

    return NextResponse.json({
      success: totalFailed === 0,
      results,
      summary: {
        totalSynced,
        totalFailed,
        allErrors: allErrors.length > 0 ? allErrors : undefined,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Comprehensive sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform comprehensive sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Health check for all sync services
    const healthCheck = await dataSyncService.healthCheck();
    
    return NextResponse.json({
      ...healthCheck,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform health check',
        details: error instanceof Error ? error.message : 'Unknown error',
        overall: 'unhealthy'
      },
      { status: 500 }
    );
  }
}
