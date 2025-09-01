'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { OnboardingWizard } from './OnboardingWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, X, Play, Pause } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface OnboardingTriggerProps {
  userId: string;
  userRole: string;
  isNewUser?: boolean;
  autoStart?: boolean;
  className?: string;
}

export function OnboardingTrigger({
  userId,
  userRole,
  isNewUser = false,
  autoStart = true,
  className
}: OnboardingTriggerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showWizard, setShowWizard] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    status,
    progress,
    steps,
    isLoading,
    startOnboarding,
    refreshStatus,
  } = useOnboarding(userId);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (isNewUser && autoStart && status === 'not-started' && !isLoading && !dismissed) {
      const timer = setTimeout(() => {
        if (!showWizard) {
          setShowPrompt(true);
        }
      }, 2000); // Show prompt after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isNewUser, autoStart, status, isLoading, dismissed, showWizard]);

  // Check if current page should trigger onboarding
  useEffect(() => {
    const onboardingTriggerPages = ['/dashboard', '/profile', '/book', '/services'];
    const shouldTrigger = onboardingTriggerPages.includes(pathname) &&
                         status === 'not-started' &&
                         !isLoading &&
                         !dismissed &&
                         !isNewUser; // Don't double-trigger for new users

    if (shouldTrigger) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds on relevant pages

      return () => clearTimeout(timer);
    }
  }, [pathname, status, isLoading, dismissed, isNewUser]);

  // Refresh status on mount and when user navigates
  useEffect(() => {
    if (userId) {
      refreshStatus();
    }
  }, [userId, refreshStatus]);

  const handleStartOnboarding = async () => {
    setShowPrompt(false);
    setShowWizard(true);
    await startOnboarding();
  };

  const handleDismissPrompt = () => {
    setDismissed(true);
    setShowPrompt(false);
    // Store dismissal in localStorage to persist across sessions
    localStorage.setItem(`onboarding-dismissed-${userId}`, Date.now().toString());
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    refreshStatus();
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    refreshStatus();
    // Could show a success toast or redirect
    router.push('/dashboard');
  };

  // Don't show anything if onboarding is completed or user dismissed it
  if (status === 'completed' || dismissed) {
    return null;
  }

  // Don't show prompts on certain pages
  const hiddenPages = ['/admin', '/auth', '/onboarding'];
  if (hiddenPages.some(page => pathname.startsWith(page))) {
    return null;
  }

  return (
    <>
      {/* Onboarding Prompt */}
      {showPrompt && !showWizard && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Welcome to ModernMen!</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissPrompt}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Let's get you set up with everything you need to make the most of our services.
                This will only take a few minutes!
              </p>

              {progress && progress.totalSteps > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Setup Progress</span>
                    <span>{progress.progressPercentage}%</span>
                  </div>
                  <Progress value={progress.progressPercentage} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleStartOnboarding}
                  className="flex-1"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Setup
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismissPrompt}
                  size="sm"
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Button for Manual Start */}
      {status === 'not-started' && !showPrompt && !showWizard && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleStartOnboarding}
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
            size="lg"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      {status === 'in-progress' && progress && !showWizard && (
        <div className="fixed bottom-6 right-6 z-40">
          <Card className="shadow-lg border-2 border-primary/20 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setShowWizard(true)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs"
                  >
                    {progress.progressPercentage}%
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Continue Setup</p>
                  <p className="text-xs text-muted-foreground">
                    {progress.completedCount} of {progress.totalSteps} completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onboarding Wizard */}
      <OnboardingWizard
        userId={userId}
        isOpen={showWizard}
        onClose={handleWizardClose}
        onComplete={handleWizardComplete}
      />

      {/* Page-level Integration */}
      {status === 'in-progress' && progress && (
        <div className={cn(
          "fixed top-4 right-4 z-30 max-w-xs",
          className
        )}>
          <Card className="shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Setup Progress</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={progress.progressPercentage} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {progress.progressPercentage}%
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWizard(true)}
                  className="h-8 w-8 p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
