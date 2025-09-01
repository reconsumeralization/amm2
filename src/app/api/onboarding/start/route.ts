import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import payloadConfig from '@/payload/payload.config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig });
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return createErrorResponse('User ID is required', 'VALIDATION_ERROR', 400);
    }

    // Get user information
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    });

    if (!user) {
      return createErrorResponse('User not found', 'NOT_FOUND', 404);
    }

    // Check if onboarding progress already exists
    const existingProgress = await payload.find({
      collection: 'onboarding-progress',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1,
    });

    let onboardingProgress;

    if (existingProgress.docs.length > 0) {
      // Update existing progress to restart
      onboardingProgress = await payload.update({
        collection: 'onboarding-progress',
        id: existingProgress.docs[0].id,
        data: {
          status: 'in-progress',
          currentStep: null,
          sessionData: {
            startedAt: new Date(),
            lastActivityAt: new Date(),
            currentStepStartedAt: new Date(),
            sessionCount: (existingProgress.docs[0].sessionData?.sessionCount || 0) + 1,
          },
        },
      });
    } else {
      // Create new onboarding progress
      onboardingProgress = await payload.create({
        collection: 'onboarding-progress',
        data: {
          user: userId,
          userType: user.role,
          status: 'in-progress',
          progressMetrics: {
            totalSteps: 0,
            completedCount: 0,
            skippedCount: 0,
            progressPercentage: 0,
            totalTimeSpent: 0,
          },
          sessionData: {
            startedAt: new Date(),
            lastActivityAt: new Date(),
            currentStepStartedAt: new Date(),
            sessionCount: 1,
          },
        },
      });
    }

    // Get first step for this user type
    const firstStep = await payload.find({
      collection: 'onboarding-steps',
      where: {
        userType: {
          equals: user.role,
        },
        stepOrder: {
          equals: 1,
        },
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    });

    let nextStep = null;
    if (firstStep.docs.length > 0) {
      nextStep = firstStep.docs[0];

      // Update current step
      await payload.update({
        collection: 'onboarding-progress',
        id: onboardingProgress.id,
        data: {
          currentStep: nextStep.id,
          sessionData: {
            ...onboardingProgress.sessionData,
            currentStepStartedAt: new Date(),
          },
        },
      });
    }

    // Send welcome notification/email if configured
    if (nextStep?.actions?.triggerEvents) {
      for (const event of nextStep.actions.triggerEvents) {
        if (event.event === 'send-welcome-email') {
          // TODO: Implement email sending
          console.log('Sending welcome email to:', user.email);
        }
      }
    }

    const response = {
      onboarding: {
        id: onboardingProgress.id,
        status: 'in-progress',
        currentStep: nextStep?.id || null,
        nextStep,
        progress: {
          totalSteps: onboardingProgress.progressMetrics?.totalSteps || 0,
          completedSteps: 0,
          skippedSteps: 0,
          progressPercentage: 0,
          totalTimeSpent: 0,
        },
        startedAt: onboardingProgress.sessionData?.startedAt,
      },
      message: 'Onboarding started successfully',
    };

    return createSuccessResponse(response, 'Onboarding started successfully');
  } catch (error) {
    console.error('POST /api/onboarding/start error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
