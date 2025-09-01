import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import payloadConfig from '@/payload/payload.config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig });
    const body = await request.json();
    const { userId, finalData } = body;

    if (!userId) {
      return createErrorResponse('User ID is required', 'VALIDATION_ERROR', 400);
    }

    // Get onboarding progress
    const progressResult = await payload.find({
      collection: 'onboarding-progress',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1,
    });

    if (progressResult.docs.length === 0) {
      return createErrorResponse('Onboarding progress not found', 'NOT_FOUND', 404);
    }

    const progress = progressResult.docs[0];

    // Calculate final metrics
    const totalSteps = progress.progressMetrics?.totalSteps || 0;
    const completedSteps = progress.completedSteps?.length || 0;
    const skippedSteps = progress.skippedSteps?.length || 0;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 100;

    // Calculate total time spent
    let totalTimeSpent = progress.progressMetrics?.totalTimeSpent || 0;
    if (progress.sessionData?.startedAt) {
      const sessionTime = Math.floor((new Date().getTime() - new Date(progress.sessionData.startedAt).getTime()) / 1000);
      totalTimeSpent += sessionTime;
    }

    // Update progress to completed
    const completedProgress = await payload.update({
      collection: 'onboarding-progress',
      id: progress.id,
      data: {
        status: 'completed',
        completedAt: new Date(),
        progressMetrics: {
          ...progress.progressMetrics,
          totalSteps,
          completedCount: completedSteps,
          skippedCount: skippedSteps,
          progressPercentage,
          totalTimeSpent,
        },
        sessionData: {
          ...progress.sessionData,
          lastActivityAt: new Date(),
        },
        preferences: {
          ...progress.preferences,
          ...finalData?.preferences,
        },
      },
    });

    // Update user profile if final data provided
    if (finalData?.profile) {
      await payload.update({
        collection: 'users',
        id: userId,
        data: {
          profile: {
            ...finalData.profile,
          },
        },
      });
    }

    // Record completion in analytics
    await recordCompletionAnalytics(userId, progress.userType, completedProgress);

    // Send completion notifications/events
    await handleCompletionEvents(userId, progress.userType, completedProgress);

    const response = {
      onboarding: {
        id: completedProgress.id,
        status: 'completed',
        completedAt: completedProgress.completedAt,
        progress: {
          totalSteps,
          completedSteps,
          skippedSteps,
          progressPercentage,
          totalTimeSpent,
        },
      },
      user: {
        id: userId,
        preferences: completedProgress.preferences,
      },
      message: 'Onboarding completed successfully!',
      nextSteps: getNextSteps(progress.userType),
    };

    return createSuccessResponse(response, 'Onboarding completed successfully');
  } catch (error) {
    console.error('POST /api/onboarding/complete error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function recordCompletionAnalytics(userId: string, userType: string, progress: any) {
  const payload = await getPayload({ config: payloadConfig });

  try {
    // Create or update analytics record
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const existingAnalytics = await payload.find({
      collection: 'onboarding-analytics',
      where: {
        userType: {
          equals: userType,
        },
        dateRange: {
          startDate: {
            greater_than_equal: startOfDay,
          },
          endDate: {
            less_than: endOfDay,
          },
        },
      },
      limit: 1,
    });

    if (existingAnalytics.docs.length > 0) {
      // Update existing analytics
      const analytics = existingAnalytics.docs[0];
      await payload.update({
        collection: 'onboarding-analytics',
        id: analytics.id,
        data: {
          metrics: {
            ...analytics.metrics,
            completedUsers: (analytics.metrics?.completedUsers || 0) + 1,
            completionRate: calculateCompletionRate(
              (analytics.metrics?.totalUsers || 0) + 1,
              (analytics.metrics?.completedUsers || 0) + 1
            ),
          },
        },
      });
    } else {
      // Create new analytics record
      await payload.create({
        collection: 'onboarding-analytics',
        data: {
          title: `${userType} Onboarding Analytics - ${today.toISOString().split('T')[0]}`,
          dateRange: {
            startDate: startOfDay,
            endDate: endOfDay,
          },
          userType,
          metrics: {
            totalUsers: 1,
            completedUsers: 1,
            completionRate: 100,
            averageCompletionTime: progress.progressMetrics?.totalTimeSpent || 0,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error recording completion analytics:', error);
  }
}

async function handleCompletionEvents(userId: string, userType: string, progress: any) {
  try {
    // Send welcome email for new customers
    if (userType === 'customer') {
      console.log('Sending welcome email to new customer:', userId);
      // TODO: Implement email sending
    }

    // Grant additional permissions for staff
    if (userType === 'staff' || userType === 'barber') {
      console.log('Granting staff permissions for user:', userId);
      // TODO: Implement permission updates
    }

    // Send admin notification for new admin users
    if (userType === 'admin') {
      console.log('Sending admin setup notification for user:', userId);
      // TODO: Implement admin notifications
    }

    // Update user status or trigger integrations
    console.log('Onboarding completion events processed for user:', userId);
  } catch (error) {
    console.error('Error handling completion events:', error);
  }
}

function calculateCompletionRate(totalUsers: number, completedUsers: number): number {
  return totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0;
}

function getNextSteps(userType: string) {
  const nextSteps = {
    customer: [
      {
        title: 'Book Your First Appointment',
        description: 'Schedule your first visit with one of our expert barbers',
        action: 'book-appointment',
        url: '/book',
      },
      {
        title: 'Explore Our Services',
        description: 'Discover all the services we offer',
        action: 'view-services',
        url: '/services',
      },
      {
        title: 'Join Our Loyalty Program',
        description: 'Earn points and get exclusive discounts',
        action: 'join-loyalty',
        url: '/loyalty',
      },
    ],
    staff: [
      {
        title: 'View Your Schedule',
        description: 'Check your upcoming appointments and availability',
        action: 'view-schedule',
        url: '/staff/schedule',
      },
      {
        title: 'Update Your Profile',
        description: 'Complete your barber profile and specialties',
        action: 'update-profile',
        url: '/staff/profile',
      },
      {
        title: 'Training Resources',
        description: 'Access training materials and guidelines',
        action: 'view-training',
        url: '/staff/training',
      },
    ],
    barber: [
      {
        title: 'Set Your Availability',
        description: 'Configure your working hours and availability',
        action: 'set-availability',
        url: '/barber/availability',
      },
      {
        title: 'View Your Appointments',
        description: 'See your upcoming bookings and client information',
        action: 'view-appointments',
        url: '/barber/appointments',
      },
      {
        title: 'Barber Resources',
        description: 'Access barber-specific tools and resources',
        action: 'view-resources',
        url: '/barber/resources',
      },
    ],
    admin: [
      {
        title: 'Dashboard Overview',
        description: 'View business analytics and key metrics',
        action: 'view-dashboard',
        url: '/admin/dashboard',
      },
      {
        title: 'Manage Staff',
        description: 'Add and manage barber staff members',
        action: 'manage-staff',
        url: '/admin/staff',
      },
      {
        title: 'System Settings',
        description: 'Configure business settings and preferences',
        action: 'system-settings',
        url: '/admin/settings',
      },
    ],
  };

  return nextSteps[userType] || nextSteps.customer;
}
