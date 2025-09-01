import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import payloadConfig from '@/payload/payload.config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig });
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');
    const userId = searchParams.get('userId');

    if (!userType) {
      return createErrorResponse('User type is required', 'VALIDATION_ERROR', 400);
    }

    // Get all active steps for this user type
    const steps = await payload.find({
      collection: 'onboarding-steps',
      where: {
        userType: {
          equals: userType,
        },
        isActive: {
          equals: true,
        },
      },
      sort: 'stepOrder',
    });

    let userProgress = null;
    if (userId) {
      // Get user's progress to filter out completed/skipped steps
      const progressResult = await payload.find({
        collection: 'onboarding-progress',
        where: {
          user: {
            equals: userId,
          },
        },
        limit: 1,
      });

      if (progressResult.docs.length > 0) {
        userProgress = progressResult.docs[0];
      }
    }

    // Filter and enhance steps based on user progress
    const enhancedSteps = steps.docs.map(step => {
      const isCompleted = userProgress?.completedSteps?.some(s => s.step === step.id) || false;
      const isSkipped = userProgress?.skippedSteps?.some(s => s.step === step.id) || false;
      const isCurrent = userProgress?.currentStep === step.id;

      return {
        ...step,
        status: isCompleted ? 'completed' : isSkipped ? 'skipped' : isCurrent ? 'current' : 'pending',
        userProgress: userProgress ? {
          completedAt: userProgress.completedSteps?.find(s => s.step === step.id)?.completedAt,
          skippedAt: userProgress.skippedSteps?.find(s => s.step === step.id)?.skippedAt,
          timeSpent: userProgress.completedSteps?.find(s => s.step === step.id)?.timeSpent,
        } : null,
      };
    });

    // Group steps by status for easier frontend handling
    const groupedSteps = {
      pending: enhancedSteps.filter(step => step.status === 'pending'),
      current: enhancedSteps.filter(step => step.status === 'current'),
      completed: enhancedSteps.filter(step => step.status === 'completed'),
      skipped: enhancedSteps.filter(step => step.status === 'skipped'),
    };

    // Calculate overall progress
    const totalSteps = enhancedSteps.length;
    const completedSteps = groupedSteps.completed.length;
    const skippedSteps = groupedSteps.skipped.length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const response = {
      userType,
      totalSteps,
      completedSteps,
      skippedSteps,
      progressPercentage,
      steps: enhancedSteps,
      groupedSteps,
      userProgress: userProgress ? {
        id: userProgress.id,
        status: userProgress.status,
        startedAt: userProgress.sessionData?.startedAt,
        completedAt: userProgress.completedAt,
        totalTimeSpent: userProgress.progressMetrics?.totalTimeSpent || 0,
      } : null,
    };

    return createSuccessResponse(response, 'Onboarding steps retrieved successfully');
  } catch (error) {
    console.error('GET /api/onboarding/steps error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig });
    const body = await request.json();
    const { userType, steps } = body;

    if (!userType || !Array.isArray(steps)) {
      return createErrorResponse('User type and steps array are required', 'VALIDATION_ERROR', 400);
    }

    // Validate user permissions (only admins can create steps)
    // TODO: Add authentication check

    const createdSteps = [];

    for (let i = 0; i < steps.length; i++) {
      const stepData = steps[i];

      const step = await payload.create({
        collection: 'onboarding-steps',
        data: {
          ...stepData,
          userType,
          stepOrder: stepData.stepOrder || i + 1,
          isActive: stepData.isActive !== undefined ? stepData.isActive : true,
        },
      });

      createdSteps.push(step);
    }

    return createSuccessResponse({
      steps: createdSteps,
      count: createdSteps.length,
    }, `${createdSteps.length} onboarding steps created successfully`);
  } catch (error) {
    console.error('POST /api/onboarding/steps error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
