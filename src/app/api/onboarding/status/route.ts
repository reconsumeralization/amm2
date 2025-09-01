import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import payloadConfig from '@/payload/payload.config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig });
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    // Get or create onboarding progress
    let progress = await payload.find({
      collection: 'onboarding-progress',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1,
    });

    let onboardingProgress;
    if (progress.docs.length === 0) {
      // Create initial progress record
      onboardingProgress = await payload.create({
        collection: 'onboarding-progress',
        data: {
          user: userId,
          userType: user.role,
          status: 'not-started',
          progressMetrics: {
            totalSteps: 0,
            completedCount: 0,
            skippedCount: 0,
            progressPercentage: 0,
            totalTimeSpent: 0,
          },
        },
      });
    } else {
      onboardingProgress = progress.docs[0];
    }

    // Get available steps for this user type
    const steps = await payload.find({
      collection: 'onboarding-steps',
      where: {
        userType: {
          equals: user.role,
        },
        isActive: {
          equals: true,
        },
      },
      sort: 'stepOrder',
    });

    // Calculate progress metrics
    const totalSteps = steps.docs.length;
    const completedSteps = onboardingProgress.completedSteps?.length || 0;
    const skippedSteps = onboardingProgress.skippedSteps?.length || 0;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Update progress metrics if they need refreshing
    if (onboardingProgress.progressMetrics.totalSteps !== totalSteps ||
        onboardingProgress.progressMetrics.completedCount !== completedSteps ||
        onboardingProgress.progressMetrics.skippedCount !== skippedSteps) {

      await payload.update({
        collection: 'onboarding-progress',
        id: onboardingProgress.id,
        data: {
          progressMetrics: {
            ...onboardingProgress.progressMetrics,
            totalSteps,
            completedCount: completedSteps,
            skippedCount: skippedSteps,
            progressPercentage,
          },
        },
      });
    }

    // Determine next step
    let nextStep = null;
    if (onboardingProgress.status !== 'completed') {
      const completedStepIds = onboardingProgress.completedSteps?.map(s => s.step) || [];
      const skippedStepIds = onboardingProgress.skippedSteps?.map(s => s.step) || [];

      for (const step of steps.docs) {
        if (!completedStepIds.includes(step.id) && !skippedStepIds.includes(step.id)) {
          nextStep = step;
          break;
        }
      }
    }

    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      onboarding: {
        id: onboardingProgress.id,
        status: onboardingProgress.status,
        currentStep: onboardingProgress.currentStep,
        nextStep,
        progress: {
          totalSteps,
          completedSteps,
          skippedSteps,
          progressPercentage,
          totalTimeSpent: onboardingProgress.progressMetrics?.totalTimeSpent || 0,
        },
        steps: steps.docs,
        completedSteps: onboardingProgress.completedSteps || [],
        skippedSteps: onboardingProgress.skippedSteps || [],
        startedAt: onboardingProgress.sessionData?.startedAt,
        lastActivityAt: onboardingProgress.sessionData?.lastActivityAt,
        completedAt: onboardingProgress.completedAt,
      },
    };

    return createSuccessResponse(response, 'Onboarding status retrieved successfully');
  } catch (error) {
    console.error('GET /api/onboarding/status error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
