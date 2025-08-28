'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle, Circle, Clock, AlertTriangle, ChevronRight, ChevronDown, Play, Book, Target, Users } from '@/lib/icon-mapping'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InteractiveExample } from './InteractiveExample'
import { CodeSnippetRenderer } from './CodeSnippetRenderer'
import { RelatedContentRecommendations } from './RelatedContentRecommendations'
import { PrerequisiteChecker } from './PrerequisiteChecker'
import { ProgressTracker } from './ProgressTracker'
import { 
  GuideContent, 
  GuideStep, 
  UserRole, 
  Prerequisite,
  InteractiveExample as InteractiveExampleType 
} from '@/types/documentation'
import { getUserRoleFromSession } from '@/lib/documentation-permissions'

interface GuideRendererProps {
  guide: GuideContent
  interactive?: boolean
  stepByStep?: boolean
  onStepComplete?: (stepId: string) => void
  onGuideComplete?: () => void
  className?: string
}

export function GuideRenderer({
  guide,
  interactive = true,
  stepByStep = true,
  onStepComplete,
  onGuideComplete,
  className = ''
}: GuideRendererProps) {
  const { data: session } = useSession()
  const userRole = getUserRoleFromSession(session)
  
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [prerequisitesMet, setPrerequisitesMet] = useState<boolean>(false)
  const [startTime] = useState<Date>(new Date())

  // Initialize expanded steps for non-step-by-step mode
  useEffect(() => {
    if (!stepByStep) {
      setExpandedSteps(new Set(guide.content.steps.map(step => step.id)))
    }
  }, [stepByStep, guide.content.steps])

  // Check if user role matches target audience
  const isTargetAudience = guide.metadata.targetAudience.includes(userRole)

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    const newCompletedSteps = new Set(completedSteps)
    newCompletedSteps.add(stepId)
    setCompletedSteps(newCompletedSteps)
    
    onStepComplete?.(stepId)

    // Auto-advance to next step in step-by-step mode
    if (stepByStep) {
      const currentStepIndex = guide.content.steps.findIndex(step => step.id === stepId)
      if (currentStepIndex < guide.content.steps.length - 1) {
        setCurrentStep(currentStepIndex + 1)
      } else {
        // Guide completed
        onGuideComplete?.()
      }
    }

    // Check if all steps are completed
    if (newCompletedSteps.size === guide.content.steps.length) {
      onGuideComplete?.()
    }
  }

  // Toggle step expansion
  const toggleStepExpansion = (stepId: string) => {
    const newExpandedSteps = new Set(expandedSteps)
    if (newExpandedSteps.has(stepId)) {
      newExpandedSteps.delete(stepId)
    } else {
      newExpandedSteps.add(stepId)
    }
    setExpandedSteps(newExpandedSteps)
  }

  // Calculate completion percentage
  const completionPercentage = (completedSteps.size / guide.content.steps.length) * 100

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Guide Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-cyan-400" />
                {guide.metadata.title}
              </CardTitle>
              <p className="text-slate-300">{guide.metadata.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getDifficultyColor(guide.metadata.difficulty)}>
                {guide.metadata.difficulty}
              </Badge>
              {!isTargetAudience && (
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Not your role
                </Badge>
              )}
            </div>
          </div>
          
          {/* Guide Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {guide.metadata.estimatedTime} min
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {guide.metadata.targetAudience.join(', ')}
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {guide.content.steps.length} steps
            </div>
          </div>

          {/* Tags */}
          {guide.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {guide.metadata.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Prerequisites Checker */}
      {guide.content.prerequisites.length > 0 && (
        <PrerequisiteChecker
          prerequisites={guide.content.prerequisites}
          onPrerequisitesMet={setPrerequisitesMet}
        />
      )}

      {/* Progress Tracker */}
      {interactive && (
        <ProgressTracker
          totalSteps={guide.content.steps.length}
          completedSteps={completedSteps.size}
          currentStep={stepByStep ? currentStep : undefined}
          estimatedTime={guide.metadata.estimatedTime}
          startTime={startTime}
        />
      )}

      {/* Introduction */}
      {guide.content.introduction && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="prose prose-slate prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: guide.content.introduction }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guide Steps */}
      <div className="space-y-4">
        {guide.content.steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isExpanded = expandedSteps.has(step.id)
          const isCurrent = stepByStep && index === currentStep
          const isAccessible = !stepByStep || index <= currentStep || prerequisitesMet

          return (
            <GuideStepRenderer
              key={step.id}
              step={step}
              index={index}
              isCompleted={isCompleted}
              isExpanded={isExpanded}
              isCurrent={isCurrent}
              isAccessible={isAccessible}
              interactive={interactive}
              onToggleExpansion={() => toggleStepExpansion(step.id)}
              onComplete={() => handleStepComplete(step.id)}
            />
          )
        })}
      </div>

      {/* Interactive Examples */}
      {guide.content.interactiveExamples && guide.content.interactiveExamples.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
              <Play className="h-5 w-5 text-cyan-400" />
              Interactive Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {guide.content.interactiveExamples.map((example) => (
              <InteractiveExample
                key={example.id}
                example={example}
                userRole={userRole}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting */}
      {guide.content.troubleshooting.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guide.content.troubleshooting.map((item) => (
                <div key={item.id} className="border-l-2 border-amber-500/30 pl-4">
                  <h4 className="font-medium text-slate-200 mb-2">{item.problem}</h4>
                  <div className="text-slate-300 prose prose-slate prose-invert prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: item.solution }} />
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Content */}
      {guide.content.relatedContent.length > 0 && (
        <RelatedContentRecommendations
          relatedContent={guide.content.relatedContent}
          userRole={userRole}
          currentGuideId={guide.metadata.id}
        />
      )}
    </div>
  )
}

// Individual Step Renderer Component
interface GuideStepRendererProps {
  step: GuideStep
  index: number
  isCompleted: boolean
  isExpanded: boolean
  isCurrent: boolean
  isAccessible: boolean
  interactive: boolean
  onToggleExpansion: () => void
  onComplete: () => void
}

function GuideStepRenderer({
  step,
  index,
  isCompleted,
  isExpanded,
  isCurrent,
  isAccessible,
  interactive,
  onToggleExpansion,
  onComplete
}: GuideStepRendererProps) {
  return (
    <Card className={`transition-all duration-200 ${
      isCurrent 
        ? 'bg-cyan-900/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
        : 'bg-slate-800/50 border-slate-700'
    } ${!isAccessible ? 'opacity-50' : ''}`}>
      <CardHeader 
        className="cursor-pointer"
        onClick={isAccessible ? onToggleExpansion : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-500/20 text-green-400' 
                : isCurrent 
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-600/20 text-slate-400'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-slate-100">{step.title}</CardTitle>
              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step.estimatedTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {step.estimatedTime}m
              </Badge>
            )}
            {isAccessible && (
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && isAccessible && (
        <CardContent className="space-y-4">
          {/* Step Content */}
          <div className="prose prose-slate prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: step.content }} />
          </div>

          {/* Code Snippets */}
          {step.codeSnippets && step.codeSnippets.length > 0 && (
            <div className="space-y-3">
              {step.codeSnippets.map((snippet) => (
                <CodeSnippetRenderer
                  key={snippet.id}
                  snippet={snippet}
                />
              ))}
            </div>
          )}

          {/* Interactive Examples */}
          {step.interactiveExamples && step.interactiveExamples.length > 0 && (
            <div className="space-y-3">
              {step.interactiveExamples.map((example) => (
                <InteractiveExample
                  key={example.id}
                  example={example}
                />
              ))}
            </div>
          )}

          {/* Step Completion */}
          {interactive && !isCompleted && (
            <div className="flex justify-end pt-4 border-t border-slate-700">
              <Button 
                onClick={onComplete}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}