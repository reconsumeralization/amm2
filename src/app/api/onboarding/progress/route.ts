import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import payloadConfig from '@/payload/payload.config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig });
    const body = await request.json();
    const { userId, action, stepId, data } = body;

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

    switch (action) {
      case 'complete-step': {
        if (!stepId) {
          return createErrorResponse('Step ID is required for complete-step action', 'VALIDATION_ERROR', 400);
        }

        // Verify step exists and belongs to user type
        const step = await payload.findByID({
          collection: 'onboarding-steps',
          id: stepId,
        });

        if (!step) {
          return createErrorResponse('Step not found', 'NOT_FOUND', 404);
        }

        // Calculate time spent on current step
        const timeSpent = progress.sessionData?.currentStepStartedAt
          ? Math.floor((new Date().getTime() - new Date(progress.sessionData.currentStepStartedAt).getTime()) / 1000)
          : 0;

        // Add to completed steps
        const completedSteps = progress.completedSteps || [];
        const existingIndex = completedSteps.findIndex(s => s.step === stepId);

        if (existingIndex === -1) {
          completedSteps.push({
            step: stepId,
            completedAt: new Date(),
            timeSpent,
          });
        }

        // Update progress
        const updatedProgress = await payload.update({
          collection: 'onboarding-progress',
          id: progress.id,
          data: {
            completedSteps,
            sessionData: {
              ...progress.sessionData,
              lastActivityAt: new Date(),
              currentStepStartedAt: null,
            },
            progressMetrics: {
              ...progress.progressMetrics,
              completedCount: completedSteps.length,
              totalTimeSpent: (progress.progressMetrics?.totalTimeSpent || 0) + timeSpent,
            },
          },
        });

        // Trigger completion events
        if (step.actions?.triggerEvents) {
          for (const event of step.actions.triggerEvents) {
            await handleStepEvent(event, progress.user, data);
          }
        }

        return createSuccessResponse({
          progress: updatedProgress,
          message: 'Step completed successfully',
        }, 'Step completed successfully');
      }

      case 'skip-step': {
        if (!stepId) {
          return createErrorResponse('Step ID is required for skip-step action', 'VALIDATION_ERROR', 400);
        }

        const skippedSteps = progress.skippedSteps || [];
        const existingIndex = skippedSteps.findIndex(s => s.step === stepId);

        if (existingIndex === -1) {
          skippedSteps.push({
            step: stepId,
            skippedAt: new Date(),
            reason: data?.reason || 'not-interested',
            customReason: data?.customReason,
          });
        }

        const updatedProgress = await payload.update({
          collection: 'onboarding-progress',
          id: progress.id,
          data: {
            skippedSteps,
            sessionData: {
              ...progress.sessionData,
              lastActivityAt: new Date(),
            },
            progressMetrics: {
              ...progress.progressMetrics,
              skippedCount: skippedSteps.length,
            },
          },
        });

        return createSuccessResponse({
          progress: updatedProgress,
          message: 'Step skipped successfully',
        }, 'Step skipped successfully');
      }

      case 'update-current-step': {
        if (!stepId) {
          return createErrorResponse('Step ID is required for update-current-step action', 'VALIDATION_ERROR', 400);
        }

        const updatedProgress = await payload.update({
          collection: 'onboarding-progress',
          id: progress.id,
          data: {
            currentStep: stepId,
            sessionData: {
              ...progress.sessionData,
              lastActivityAt: new Date(),
              currentStepStartedAt: new Date(),
            },
          },
        });

        return createSuccessResponse({
          progress: updatedProgress,
          message: 'Current step updated successfully',
        }, 'Current step updated successfully');
      }

      case 'update-preferences': {
        const updatedProgress = await payload.update({
          collection: 'onboarding-progress',
          id: progress.id,
          data: {
            preferences: {
              ...progress.preferences,
              ...data,
            },
            sessionData: {
              ...progress.sessionData,
              lastActivityAt: new Date(),
            },
          },
        });

        return createSuccessResponse({
          progress: updatedProgress,
          message: 'Preferences updated successfully',
        }, 'Preferences updated successfully');
      }

      default:
        return createErrorResponse('Invalid action', 'VALIDATION_ERROR', 400);
    }
  } catch (error) {
    console.error('POST /api/onboarding/progress error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function handleStepEvent(event: any, userId: string, additionalData?: any) {
  const payload = await getPayload({ config: payloadConfig });

  switch (event.event) {
    case 'send-welcome-email':
      // TODO: Implement email sending
      console.log('Sending welcome email to user:', userId);
      break;

    case 'create-profile':
      // Update user profile with onboarding data
      if (additionalData?.profile) {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            profile: {
              ...additionalData.profile,
            },
          },
        });
      }
      break;

    case 'setup-preferences':
      // Update user preferences
      if (additionalData?.preferences) {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            profile: {
              preferences: {
                ...additionalData.preferences,
              },
            },
          },
        });
      }
      break;

    case 'grant-permissions':
      // Update user role or permissions
      if (additionalData?.role) {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            role: additionalData.role,
          },
        });
      }
      break;

    case 'send-notification':
      // TODO: Implement notification system
      console.log('Sending notification to user:', userId, event.data);
      break;

    case 'custom-action':
      // Handle custom events
      console.log('Custom event triggered:', event.event, event.data);
      break;

    default:
      console.log('Unknown event type:', event.event);
  }
}
