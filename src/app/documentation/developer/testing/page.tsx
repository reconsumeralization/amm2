import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Code, Target, GitBranch, Play, CheckCircle, AlertTriangle, Terminal, FileText, Zap, Clock, Settings } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Testing Guide - Developer Documentation',
  description: 'Comprehensive testing strategies, frameworks, and best practices for the Modern Men Hair BarberShop management system.',
}

export default function TestingPage() {
  const testingFrameworks = [
    {
      name: 'Jest',
      description: 'Core test runner for unit and integration tests',
      icon: <Target className="h-6 w-6 text-green-400" />,
      usage: 'Unit tests, integration tests, mocking',
      configFile: 'jest.config.js',
      tags: ['unit-testing', 'mocking', 'coverage']
    },
    {
      name: 'React Testing Library',
      description: 'Component testing with user-centric approach',
      icon: <Code className="h-6 w-6 text-blue-400" />,
      usage: 'Component rendering, user interactions, accessibility',
      configFile: 'setupTests.ts',
      tags: ['component-testing', 'accessibility', 'user-interactions']
    },
    {
      name: 'Playwright',
      description: 'End-to-end testing across multiple browsers',
      icon: <Play className="h-6 w-6 text-purple-400" />,
      usage: 'E2E tests, browser automation, visual testing',
      configFile: 'playwright.config.ts',
      tags: ['e2e-testing', 'browser-testing', 'automation']
    },
    {
      name: 'Storybook Test Runner',
      description: 'Visual regression and component story testing',
      icon: <FileText className="h-6 w-6 text-orange-400" />,
      usage: 'Visual regression, component stories, interaction testing',
      configFile: '.storybook/test-runner.ts',
      tags: ['visual-testing', 'storybook', 'regression']
    }
  ]

  const testCategories = [
    {
      category: 'Unit Tests',
      description: 'Test individual functions and components in isolation',
      location: 'src/__tests__/',
      examples: [
        'appointments.test.ts - Appointment booking logic',
        'validation.test.ts - Form validation utilities',
        'utils.test.ts - Helper functions and utilities',
        'payload-integration.test.ts - Payload CMS integration'
      ],
      bestPractices: [
        'Test one thing at a time',
        'Use descriptive test names',
        'Mock external dependencies',
        'Aim for 80%+ code coverage'
      ]
    },
    {
      category: 'Integration Tests',
      description: 'Test how different parts of the system work together',
      location: 'src/__tests__/api/',
      examples: [
        'API route handlers with database',
        'Authentication flow integration',
        'Payment processing workflows',
        'Email notification systems'
      ],
      bestPractices: [
        'Test realistic user scenarios',
        'Use test databases',
        'Clean up after each test',
        'Test error conditions'
      ]
    },
    {
      category: 'Component Tests',
      description: 'Test React components with user interactions',
      location: 'src/components/__tests__/',
      examples: [
        'Form submission handling',
        'User interface interactions',
        'State management behavior',
        'Accessibility compliance'
      ],
      bestPractices: [
        'Test user behavior, not implementation',
        'Use semantic queries',
        'Test accessibility features',
        'Mock API calls'
      ]
    },
    {
      category: 'E2E Tests',
      description: 'Test complete user workflows across the application',
      location: 'e2e/',
      examples: [
        'Complete booking workflow',
        'User registration and login',
        'Admin dashboard operations',
        'Payment processing flow'
      ],
      bestPractices: [
        'Test critical user paths',
        'Use page object models',
        'Handle async operations',
        'Test across browsers'
      ]
    }
  ]

  const testCommands = [
    {
      command: 'pnpm test',
      description: 'Run all Jest unit and integration tests',
      icon: <Terminal className="h-4 w-4 text-green-400" />
    },
    {
      command: 'pnpm test:watch',
      description: 'Run tests in watch mode for development',
      icon: <Clock className="h-4 w-4 text-blue-400" />
    },
    {
      command: 'pnpm test:coverage',
      description: 'Run tests with coverage reporting',
      icon: <Target className="h-4 w-4 text-purple-400" />
    },
    {
      command: 'pnpm test:e2e',
      description: 'Run Playwright end-to-end tests',
      icon: <Play className="h-4 w-4 text-orange-400" />
    },
    {
      command: 'pnpm test:storybook',
      description: 'Run Storybook visual regression tests',
      icon: <FileText className="h-4 w-4 text-cyan-400" />
    },
    {
      command: 'pnpm test:ci',
      description: 'Run all tests in CI mode',
      icon: <GitBranch className="h-4 w-4 text-yellow-400" />
    }
  ]

  const projectStructure = `src/
├── __tests__/                 # Jest unit & integration tests
│   ├── api/                  # API route tests
│   ├── appointments.test.ts  # Appointment logic tests
│   ├── chatbot.test.tsx      # Chatbot component tests
│   ├── error-boundary.test.tsx # Error handling tests
│   ├── page-builder.test.tsx # Page builder tests
│   ├── payload-expansion.test.ts # Payload expansion tests
│   ├── payload-integration.test.ts # Payload integration tests
│   ├── settings.test.ts      # Settings management tests
│   ├── simple.test.ts        # Basic functionality tests
│   ├── system.test.ts        # System-wide tests
│   ├── utils.test.ts         # Utility function tests
│   └── validation.test.ts    # Validation logic tests
├── components/__tests__/      # Component-specific tests
├── hooks/__tests__/          # Custom hook tests
├── lib/__tests__/            # Library function tests
├── e2e/                      # Playwright E2E tests
├── stories/                  # Storybook component stories
└── test-utils/               # Testing utilities and helpers`

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            Testing Guide
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Comprehensive testing strategies, frameworks, and best practices for building reliable software.
        </p>
      </div>

      {/* Testing Frameworks */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-400" />
          Testing Frameworks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testingFrameworks.map((framework, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {framework.icon}
                  <div>
                    <CardTitle className="text-slate-100">{framework.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {framework.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-1">Usage:</p>
                    <p className="text-sm text-slate-400">{framework.usage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-1">Config:</p>
                    <code className="text-sm bg-slate-900 px-2 py-1 rounded text-green-400">
                      {framework.configFile}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {framework.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Structure */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-purple-400" />
          Project Structure
        </h2>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <pre className="text-sm text-slate-300 overflow-x-auto">
              <code>{projectStructure}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Test Commands */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-green-400" />
          Running Tests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testCommands.map((cmd, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  {cmd.icon}
                  <code className="text-sm bg-slate-900 px-3 py-1 rounded text-green-400 font-mono">
                    {cmd.command}
                  </code>
                </div>
                <p className="text-sm text-slate-400">{cmd.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Test Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-orange-400" />
          Test Categories
        </h2>
        <div className="space-y-6">
          {testCategories.map((category, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">{category.category}</CardTitle>
                <CardDescription className="text-slate-400">
                  {category.description}
                </CardDescription>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="h-4 w-4" />
                  <code>{category.location}</code>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-300 mb-3">Examples:</h4>
                    <ul className="space-y-2">
                      {category.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-sm text-slate-400 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-300 mb-3">Best Practices:</h4>
                    <ul className="space-y-2">
                      {category.bestPractices.map((practice, practiceIndex) => (
                        <li key={practiceIndex} className="text-sm text-slate-400 flex items-start gap-2">
                          <Zap className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-400" />
          Testing Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Do's
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Write tests for every new component and utility
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Keep tests fast; aim for &lt;200ms per test
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Mock external services (Supabase, Payload)
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Use semantic queries for accessibility
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Test error conditions and edge cases
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Don'ts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Don't test implementation details
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Don't write tests that depend on each other
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Don't ignore failing tests
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Don't test third-party library functionality
                </li>
                <li className="text-sm text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Don't skip cleanup in integration tests
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CI/CD Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-yellow-400" />
          Continuous Integration
        </h2>
        <Alert className="bg-slate-800/50 border-slate-700">
          <GitBranch className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-slate-100">GitHub Actions Workflow</AlertTitle>
          <AlertDescription className="text-slate-300">
            The <code className="bg-slate-900 px-2 py-1 rounded text-green-400">.github/workflows/docs-validation.yml</code> workflow 
            runs <code className="bg-slate-900 px-2 py-1 rounded text-green-400">pnpm test</code> and 
            <code className="bg-slate-900 px-2 py-1 rounded text-green-400">pnpm test:e2e</code> on every push and pull request.
          </AlertDescription>
        </Alert>
      </section>

      {/* Resources */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-400" />
          Further Reading
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Jest Documentation', url: 'https://jestjs.io/', description: 'Complete Jest testing framework guide' },
            { name: 'React Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro', description: 'User-centric component testing' },
            { name: 'Playwright Documentation', url: 'https://playwright.dev/', description: 'End-to-end testing across browsers' },
            { name: 'Storybook Testing', url: 'https://storybook.js.org/docs/react/writing-tests/introduction', description: 'Visual testing and component stories' }
          ].map((resource, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-100">{resource.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    External
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
