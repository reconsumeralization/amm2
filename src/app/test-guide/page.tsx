import React from 'react'
import { GuideRenderer } from '@/components/documentation'
import { GuideContent } from '@/types/documentation'

// Simple test guide
const testGuide: GuideContent = {
  metadata: {
    id: 'test-guide',
    title: 'Test Guide',
    description: 'A simple test guide to verify our components work',
    author: 'Test Author',
    lastUpdated: new Date(),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['developer'],
    difficulty: 'beginner',
    estimatedTime: 5,
    tags: ['test'],
    locale: 'en',
    deprecated: false
  },
  content: {
    introduction: '<p>This is a test guide to verify our components work correctly.</p>',
    prerequisites: [
      {
        id: 'test-prereq',
        title: 'Test Prerequisite',
        description: 'A simple test prerequisite',
        required: true
      }
    ],
    steps: [
      {
        id: 'step-1',
        title: 'First Step',
        description: 'The first step of our test',
        content: '<p>This is the content of the first step.</p>',
        estimatedTime: 2,
        codeSnippets: [
          {
            id: 'code-1',
            language: 'javascript',
            code: 'console.log("Hello, World!");',
            description: 'A simple console log',
            runnable: true
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Second Step',
        description: 'The second step of our test',
        content: '<p>This is the content of the second step.</p>',
        estimatedTime: 3
      }
    ],
    troubleshooting: [],
    relatedContent: [],
    codeSnippets: []
  },
  validation: {
    reviewed: true,
    reviewedBy: 'test',
    reviewDate: new Date(),
    accuracy: 1.0,
    accessibilityCompliant: true,
    lastValidated: new Date()
  },
  analytics: {
    viewCount: 0,
    completionRate: 0,
    averageRating: 0,
    feedbackCount: 0,
    rchRanking: 0
  },
  versioning: {
    changeHistory: [],
    previousVersions: []
  }
}

export default function TestGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Guide Renderer Test</h1>
      <GuideRenderer
        guide={testGuide}
        interactive={true}
        stepByStep={true}
        onStepComplete={(stepId) => {
          console.log('Step completed:', stepId)
        }}
        onGuideComplete={() => {
          console.log('Guide completed!')
        }}
      />
    </div>
  )
}