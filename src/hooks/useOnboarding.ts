'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  stepType: string;
  isRequired: boolean;
  isSkippable: boolean;
  status: 'pending' | 'current' | 'completed' | 'skipped';
  estimatedDuration?: number;
  content?: any;
}

interface OnboardingProgress {
  id: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  currentStep?: string;
  progressPercentage: number;
  totalTimeSpent: number;
  completedCount: number;
  totalSteps: number;
  completedAt?: string;
}

interface OnboardingState {
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  progress: OnboardingProgress | null;
  steps: OnboardingStep[];
  currentStep: OnboardingStep | null;
  isLoading: boolean;
  error: string | null;
}

export function useOnboarding(userId: string) {
  const [state, setState] = useState<OnboardingState>({
    status: 'not-started',
    progress: null,
    steps: [],
    currentStep: null,
    isLoading: false,
    error: null,
  });

  // Fetch onboarding status
  const fetchOnboardingStatus = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/onboarding/status?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch onboarding status');
      }

      const data = await response.json();

      if (data.success) {
        const progress = data.data.onboarding;
        const steps = data.data.steps || [];
        const currentStep = steps.find((step: OnboardingStep) => step.status === 'current') ||
                          steps.find((step: OnboardingStep) => step.status === 'pending') ||
                          null;

        setState({
          status: progress.status,
          progress,
          steps,
          currentStep,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(data.error?.message || 'Failed to fetch onboarding status');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [userId]);

  // Start onboarding
  const startOnboarding = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start onboarding');
      }

      const data = await response.json();

      if (data.success) {
        await fetchOnboardingStatus(); // Refresh status
      } else {
        throw new Error(data.error?.message || 'Failed to start onboarding');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [userId, fetchOnboardingStatus]);

  // Complete a step
  const completeStep = useCallback(async (stepId: string) => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'complete-step',
          stepId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete step');
      }

      const data = await response.json();

      if (data.success) {
        await fetchOnboardingStatus(); // Refresh status
      } else {
        throw new Error(data.error?.message || 'Failed to complete step');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [userId, fetchOnboardingStatus]);

  // Skip a step
  const skipStep = useCallback(async (stepId: string, reason?: string) => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'skip-step',
          stepId,
          data: { reason },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to skip step');
      }

      const data = await response.json();

      if (data.success) {
        await fetchOnboardingStatus(); // Refresh status
      } else {
        throw new Error(data.error?.message || 'Failed to skip step');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [userId, fetchOnboardingStatus]);

  // Update progress (for data collection)
  const updateProgress = useCallback(async (action: string, data: any) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data_response = await response.json();

      if (data_response.success) {
        await fetchOnboardingStatus(); // Refresh status
      } else {
        throw new Error(data_response.error?.message || 'Failed to update progress');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [userId, fetchOnboardingStatus]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          finalData: state.progress?.preferences || {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          status: 'completed',
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(data.error?.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [userId, state.progress?.preferences]);

  // Initialize onboarding status
  useEffect(() => {
    if (userId) {
      fetchOnboardingStatus();
    }
  }, [userId, fetchOnboardingStatus]);

  // Auto-refresh status periodically when in progress
  useEffect(() => {
    if (state.status === 'in-progress') {
      const interval = setInterval(() => {
        fetchOnboardingStatus();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [state.status, fetchOnboardingStatus]);

  return {
    ...state,
    startOnboarding,
    completeStep,
    skipStep,
    completeOnboarding,
    updateProgress,
    refreshStatus: fetchOnboardingStatus,
  };
}
