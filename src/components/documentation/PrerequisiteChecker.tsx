'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Circle, AlertTriangle, ExternalLink, RefreshCw, HelpCircle } from '@/lib/icon-mapping'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Prerequisite } from '@/types/documentation'

interface PrerequisiteCheckerProps {
  prerequisites: Prerequisite[]
  onPrerequisitesMet: (met: boolean) => void
  className?: string
}

export function PrerequisiteChecker({
  prerequisites,
  onPrerequisitesMet,
  className = ''
}: PrerequisiteCheckerProps) {
  const [checkedPrerequisites, setCheckedPrerequisites] = useState<Set<string>>(new Set())
  const [autoCheckResults, setAutoCheckResults] = useState<Record<string, boolean>>({})
  const [isAutoChecking, setIsAutoChecking] = useState(false)

  // Calculate prerequisites status
  const requiredPrerequisites = prerequisites.filter(p => p.required)
  const optionalPrerequisites = prerequisites.filter(p => !p.required)
  const checkedRequired = requiredPrerequisites.filter(p => checkedPrerequisites.has(p.id))
  const allRequiredMet = checkedRequired.length === requiredPrerequisites.length

  // Notify parent when prerequisites status changes
  useEffect(() => {
    onPrerequisitesMet(allRequiredMet)
  }, [allRequiredMet, onPrerequisitesMet])

  // Handle manual prerequisite checking
  const handlePrerequisiteToggle = (prerequisiteId: string) => {
    const newChecked = new Set(checkedPrerequisites)
    if (newChecked.has(prerequisiteId)) {
      newChecked.delete(prerequisiteId)
    } else {
      newChecked.add(prerequisiteId)
    }
    setCheckedPrerequisites(newChecked)
  }

  // Auto-check prerequisites (placeholder for future implementation)
  const handleAutoCheck = async () => {
    setIsAutoChecking(true)
    const results: Record<string, boolean> = {}

    // Simulate auto-checking process
    for (const prerequisite of prerequisites) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate check delay
      
      // This would contain actual checking logic based on prerequisite type
      // For now, we'll simulate random results
      results[prerequisite.id] = Math.random() > 0.3
    }

    setAutoCheckResults(results)
    
    // Update checked prerequisites based on auto-check results
    const newChecked = new Set<string>()
    Object.entries(results).forEach(([id, passed]) => {
      if (passed) {
        newChecked.add(id)
      }
    })
    setCheckedPrerequisites(newChecked)
    
    setIsAutoChecking(false)
  }

  // Reset all checks
  const handleReset = () => {
    setCheckedPrerequisites(new Set())
    setAutoCheckResults({})
  }

  if (prerequisites.length === 0) return null

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
            <div className="icon-placeholder">Info</div>
            Prerequisites
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoCheck}
              disabled={isAutoChecking}
              className="text-xs"
            >
              {isAutoChecking ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Auto Check
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
        
        {/* Progress Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-1 ${
            allRequiredMet ? 'text-green-400' : 'text-amber-400'
          }`}>
            {allRequiredMet ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>
              {checkedRequired.length}/{requiredPrerequisites.length} required completed
            </span>
          </div>
          {optionalPrerequisites.length > 0 && (
            <div className="text-slate-400">
              {optionalPrerequisites.filter(p => checkedPrerequisites.has(p.id)).length}/{optionalPrerequisites.length} optional completed
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Required Prerequisites */}
        {requiredPrerequisites.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Required
            </h4>
            <div className="space-y-2">
              {requiredPrerequisites.map((prerequisite) => (
                <PrerequisiteItem
                  key={prerequisite.id}
                  prerequisite={prerequisite}
                  isChecked={checkedPrerequisites.has(prerequisite.id)}
                  autoCheckResult={autoCheckResults[prerequisite.id]}
                  onToggle={() => handlePrerequisiteToggle(prerequisite.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Prerequisites */}
        {optionalPrerequisites.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Optional
            </h4>
            <div className="space-y-2">
              {optionalPrerequisites.map((prerequisite) => (
                <PrerequisiteItem
                  key={prerequisite.id}
                  prerequisite={prerequisite}
                  isChecked={checkedPrerequisites.has(prerequisite.id)}
                  autoCheckResult={autoCheckResults[prerequisite.id]}
                  onToggle={() => handlePrerequisiteToggle(prerequisite.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className={`p-3 rounded-lg border ${
          allRequiredMet 
            ? 'bg-green-900/20 border-green-500/30 text-green-300'
            : 'bg-amber-900/20 border-amber-500/30 text-amber-300'
        }`}>
          {allRequiredMet ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>All required prerequisites are met. You can proceed with the guide.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Please complete the required prerequisites before proceeding. 
                Some steps may not work correctly without them.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Individual Prerequisite Item Component
interface PrerequisiteItemProps {
  prerequisite: Prerequisite
  isChecked: boolean
  autoCheckResult?: boolean
  onToggle: () => void
}

function PrerequisiteItem({
  prerequisite,
  isChecked,
  autoCheckResult,
  onToggle
}: PrerequisiteItemProps) {
  const hasAutoResult = autoCheckResult !== undefined
  const showAutoResult = hasAutoResult && autoCheckResult !== isChecked

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      isChecked 
        ? 'bg-green-900/10 border-green-500/30' 
        : 'bg-slate-800/30 border-slate-600/50'
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isChecked
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-slate-500 hover:border-slate-400'
          }`}
        >
          {isChecked && <CheckCircle className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h5 className="font-medium text-slate-200">{prerequisite.title}</h5>
              <p className="text-sm text-slate-400 mt-1">{prerequisite.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Required/Optional Badge */}
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  prerequisite.required 
                    ? 'text-red-400 border-red-500/30' 
                    : 'text-blue-400 border-blue-500/30'
                }`}
              >
                {prerequisite.required ? 'Required' : 'Optional'}
              </Badge>

              {/* Auto-check Result */}
              {showAutoResult && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    autoCheckResult 
                      ? 'text-green-400 border-green-500/30' 
                      : 'text-red-400 border-red-500/30'
                  }`}
                >
                  Auto: {autoCheckResult ? 'Pass' : 'Fail'}
                </Badge>
              )}

              {/* External Link */}
              {prerequisite.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 w-6 p-0"
                >
                  <a 
                    href={prerequisite.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Learn more"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}