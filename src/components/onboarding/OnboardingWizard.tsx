'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Clock, SkipForward, ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStep } from './OnboardingStep';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingCompletion } from './OnboardingCompletion';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  className?: string;
}

export function OnboardingWizard({
  userId,
  isOpen,
  onClose,
  onComplete,
  className
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    status,
    progress,
    steps,
    currentStep,
    isLoading,
    error,
    startOnboarding,
    completeStep,
    skipStep,
    completeOnboarding,
    updateProgress,
  } = useOnboarding(userId);

  // Auto-start onboarding when opened
  useEffect(() => {
    if (isOpen && status === 'not-started' && !isLoading) {
      startOnboarding();
    }
  }, [isOpen, status, isLoading, startOnboarding]);

  // Update current step index when current step changes
  useEffect(() => {
    if (currentStep && steps.length > 0) {
      const index = steps.findIndex(step => step.id === currentStep.id);
      if (index !== -1) {
        setCurrentStepIndex(index);
      }
    }
  }, [currentStep, steps]);

  const handleNext = useCallback(async () => {
    if (!currentStep) return;

    try {
      await completeStep(currentStep.id);
      const nextIndex = currentStepIndex + 1;

      if (nextIndex >= steps.length) {
        // All steps completed
        await handleComplete();
      } else {
        setCurrentStepIndex(nextIndex);
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  }, [currentStep, currentStepIndex, steps.length, completeStep]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(async (reason?: string) => {
    if (!currentStep) return;

    try {
      await skipStep(currentStep.id, reason);
      const nextIndex = currentStepIndex + 1;

      if (nextIndex >= steps.length) {
        await handleComplete();
      } else {
        setCurrentStepIndex(nextIndex);
      }

      setShowSkipDialog(false);
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  }, [currentStep, currentStepIndex, steps.length, skipStep]);

  const handleComplete = useCallback(async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      if (onComplete) {
        onComplete();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  }, [completeOnboarding, onComplete, onClose]);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (stepIndex <= currentStepIndex || steps[stepIndex]?.status === 'completed') {
      setCurrentStepIndex(stepIndex);
    }
  }, [currentStepIndex, steps]);

  if (!isOpen) return null;

  if (isLoading && !progress) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading onboarding...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (status === 'completed') {
    return (
      <OnboardingCompletion
        progress={progress}
        onClose={onClose}
        onContinue={() => router.push('/dashboard')}
      />
    );
  }

  const currentStepData = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const canGoNext = currentStepData?.status === 'completed' || currentStepData?.isSkippable;
  const canSkip = currentStepData?.isSkippable && !isLastStep;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn("max-w-6xl max-h-[90vh] overflow-hidden", className)}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Welcome to ModernMen!</span>
              <Badge variant="secondary" className="ml-2">
                {currentStepIndex + 1} of {steps.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
            {/* Progress Header */}
            <div className="mb-6">
              <OnboardingProgress
                steps={steps}
                currentStepIndex={currentStepIndex}
                progress={progress}
                onStepClick={handleStepClick}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {currentStepData && (
                <OnboardingStep
                  step={currentStepData}
                  onComplete={handleNext}
                  onDataChange={(data) => updateProgress('update-preferences', data)}
                />
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isCompleting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}

                {canSkip && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowSkipDialog(true)}
                    disabled={isCompleting}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isCompleting}
                >
                  Close
                </Button>

                {isLastStep ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting || !canGoNext}
                    className="min-w-[120px]"
                  >
                    {isCompleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canGoNext || isCompleting}
                    className="min-w-[100px]"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skip this step?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You can always come back to this step later. Why do you want to skip it?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSkip('not-interested')}
                className="flex-1"
              >
                Not Interested
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSkip('already-know')}
                className="flex-1"
              >
                Already Know
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSkip('too-time-consuming')}
                className="flex-1"
              >
                Too Time Consuming
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSkip('technical-issues')}
                className="flex-1"
              >
                Technical Issues
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
