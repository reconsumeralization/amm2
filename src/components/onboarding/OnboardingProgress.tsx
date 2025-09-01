'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  stepOrder: number;
  status: 'pending' | 'current' | 'completed' | 'skipped';
  isRequired: boolean;
  estimatedDuration?: number;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
  progress: {
    progressPercentage: number;
    totalTimeSpent: number;
    completedCount: number;
    totalSteps: number;
  };
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function OnboardingProgress({
  steps,
  currentStepIndex,
  progress,
  onStepClick,
  className
}: OnboardingProgressProps) {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'skipped':
        return <SkipForward className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStepColor = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-blue-500 border-blue-500 animate-pulse';
      case 'skipped':
        return 'bg-gray-400 border-gray-400';
      default:
        return 'bg-gray-200 border-gray-200';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{progress.completedCount} of {progress.totalSteps} completed</span>
            <span>{progress.progressPercentage}%</span>
            {progress.totalTimeSpent > 0 && (
              <span>Time: {formatTime(progress.totalTimeSpent)}</span>
            )}
          </div>
        </div>
        <Progress value={progress.progressPercentage} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isClickable = onStepClick &&
            (index <= currentStepIndex || step.status === 'completed');

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 min-w-max cursor-pointer transition-all duration-200",
                isClickable && "hover:scale-105",
                !isClickable && "cursor-not-allowed opacity-60"
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              {/* Step Indicator */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                getStepColor(step)
              )}>
                {getStepIcon(step)}
              </div>

              {/* Step Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    step.status === 'current' && "text-blue-600",
                    step.status === 'completed' && "text-green-600",
                    step.status === 'skipped' && "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                  {!step.isRequired && (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  )}
                </div>
                {step.estimatedDuration && (
                  <span className="text-xs text-muted-foreground">
                    ~{formatTime(step.estimatedDuration)}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 transition-colors duration-200",
                  step.status === 'completed' ? "bg-green-400" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      {steps[currentStepIndex] && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Current Step:</span>
            <span>{steps[currentStepIndex].title}</span>
            {steps[currentStepIndex].estimatedDuration && (
              <Badge variant="secondary" className="text-xs">
                ~{formatTime(steps[currentStepIndex].estimatedDuration)}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
