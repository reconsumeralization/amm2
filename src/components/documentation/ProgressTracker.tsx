'use client'

import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, Target, TrendingUp, Play, Pause, RefreshCw } from '@/lib/icon-mapping'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProgressTrackerProps {
  totalSteps: number
  completedSteps: number
  currentStep?: number
  estimatedTime: number // in minutes
  startTime: Date
  onReset?: () => void
  className?: string
}

export function ProgressTracker({
  totalSteps,
  completedSteps,
  currentStep,
  estimatedTime,
  startTime,
  onReset,
  className = ''
}: ProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedTime, setPausedTime] = useState(0)

  // Update elapsed time every second
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedTime
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isPaused, pausedTime])

  // Calculate progress percentage
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  // Calculate estimated remaining time
  const elapsedMinutes = elapsedTime / 60
  const averageTimePerStep = completedSteps > 0 ? elapsedMinutes / completedSteps : 0
  const remainingSteps = totalSteps - completedSteps
  const estimatedRemainingTime = remainingSteps * averageTimePerStep

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Handle pause/resume
  const handlePauseResume = () => {
    if (isPaused) {
      // Resume: add the paused duration to total paused time
      const now = new Date()
      const pauseDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000) - elapsedTime
      setPausedTime(pausedTime + pauseDuration)
      setIsPaused(false)
    } else {
      // Pause
      setIsPaused(true)
    }
  }

  // Handle reset
  const handleReset = () => {
    setElapsedTime(0)
    setPausedTime(0)
    setIsPaused(false)
    onReset?.()
  }

  // Get progress color based on completion
  const getProgressColor = () => {
    if (progressPercentage === 100) return 'bg-green-500'
    if (progressPercentage >= 75) return 'bg-blue-500'
    if (progressPercentage >= 50) return 'bg-yellow-500'
    if (progressPercentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Get time status
  const getTimeStatus = () => {
    const estimatedSeconds = estimatedTime * 60
    if (elapsedTime > estimatedSeconds * 1.5) {
      return { status: 'over', color: 'text-red-400', bgColor: 'bg-red-500/20' }
    } else if (elapsedTime > estimatedSeconds) {
      return { status: 'approaching', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
    } else {
      return { status: 'on-track', color: 'text-green-400', bgColor: 'bg-green-500/20' }
    }
  }

  const timeStatus = getTimeStatus()

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            Progress Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePauseResume}
              className="text-xs"
            >
              {isPaused ? (
                <Play className="h-3 w-3 mr-1" />
              ) : (
                <Pause className="h-3 w-3 mr-1" />
              )}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-200">
              Step Progress
            </span>
            <span className="text-sm text-slate-400">
              {completedSteps}/{totalSteps} ({Math.round(progressPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Current Step Indicator */}
        {currentStep !== undefined && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
              Current Step: {currentStep + 1}
            </Badge>
            {currentStep < totalSteps - 1 && (
              <span className="text-sm text-slate-400">
                Next: Step {currentStep + 2}
              </span>
            )}
          </div>
        )}

        {/* Time Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Elapsed Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Elapsed</span>
            </div>
            <div className={`text-lg font-mono ${isPaused ? 'text-yellow-400' : 'text-slate-100'}`}>
              {formatTime(elapsedTime)}
              {isPaused && <span className="text-xs ml-1">(Paused)</span>}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Estimated</span>
            </div>
            <div className="text-lg font-mono text-slate-100">
              {estimatedTime}m
            </div>
          </div>

          {/* Remaining Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Remaining</span>
            </div>
            <div className="text-lg font-mono text-slate-100">
              {completedSteps > 0 && remainingSteps > 0 
                ? `~${Math.ceil(estimatedRemainingTime)}m`
                : '--'
              }
            </div>
          </div>
        </div>

        {/* Time Status */}
        <div className={`p-3 rounded-lg ${timeStatus.bgColor} border border-current/20`}>
          <div className={`flex items-center gap-2 ${timeStatus.color}`}>
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {timeStatus.status === 'over' && 'Running over estimated time'}
              {timeStatus.status === 'approaching' && 'Approaching estimated time'}
              {timeStatus.status === 'on-track' && 'On track with estimated time'}
            </span>
          </div>
        </div>

        {/* Completion Status */}
        {progressPercentage === 100 && (
          <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">
                Guide completed! Total time: {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {completedSteps > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
            <div className="text-center">
              <div className="text-sm text-slate-400">Avg per Step</div>
              <div className="text-sm font-mono text-slate-200">
                {Math.round(averageTimePerStep * 60)}s
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Completion Rate</div>
              <div className="text-sm font-mono text-slate-200">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}