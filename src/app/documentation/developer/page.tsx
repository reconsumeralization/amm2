import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, GitBranch, Cog, Database, Layout, Target, Book, ExternalLink, ArrowRight, Terminal, FileText, Zap } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Developer Documentation - Modern Men Hair BarberShop',
  description: 'Developer documentation for building and extending the BarberShop management system',
}

export default function DeveloperDocumentationPage() {
  const quickStartSections = [
    {
      title: 'Getting Started',
      description: 'Set up your development environment and run the project locally',
      icon: <Terminal className="h-6 w-6 text-green-400" />,
      href: '/documentation/developer/setup/getting-started',
      tags: ['setup', 'environment', 'installation'],
      estimatedTime: '15 min'
    },
    {
      title: 'Project Setup',
      description: 'Configure your development environment with all necessary tools',
      icon: <Cog className="h-6 w-6 text-blue-400" />,
      href: '/documentation/developer/setup',
      tags: ['configuration', 'tools', 'dependencies'],
      estimatedTime: '30 min'
    },
    {
      title: 'Architecture Overview',
      description: 'Understand the system architecture and design patterns',
      icon: <Layout className="h-6 w-6 text-purple-400" />,
      href: '/documentation/developer/architecture',
      tags: ['architecture', 'patterns', 'structure'],
      estimatedTime: '20 min'
    }
  ]

  const developmentSections = [
    {
      title: 'API Documentation',
      description: 'Complete API reference with endpoints, authentication, and examples',
      icon: <Code className="h-6 w-6 text-orange-400" />,
      href: '/documentation/developer/api',
      tags: ['api', 'endpoints', 'rest', 'graphql'],
      features: ['Interactive testing', 'Code examples', 'Authentication guides']
    },
    {
      title: 'Component Library',
      description: 'Reusable UI components and design system documentation',
      icon: <FileText className="h-6 w-6 text-cyan-400" />,
      href: '/documentation/developer/components',
      tags: ['components', 'ui', 'design-system', 'storybook'],
      features: ['Live examples', 'Props documentation', 'Usage guidelines']
    },
    {
      title: 'Testing Guide',
      description: 'Testing strategies, utilities, and best practices',
      icon: <Target className="h-6 w-6 text-red-400" />,
      href: '/documentation/developer/testing',
      tags: ['testing', 'jest', 'cypress', 'unit-tests'],
      features: ['Test utilities', 'Mock data', 'CI/CD integration']
    },
    {
      title: 'Contributing',
      description: 'Guidelines for contributing to the project',
      icon: <GitBranch className="h-6 w-6 text-yellow-400" />,
      href: '/documentation/developer/contributing',
      tags: ['contributing', 'git', 'pull-requests', 'code-review'],
      features: ['Coding standards', 'PR templates', 'Review process']
    }
  ]

  const technicalSpecs = [
    { label: 'Framework', value: 'Next.js 14', color: 'bg-slate-700' },
    { label: 'Language', value: 'TypeScript', color: 'bg-blue-600' },
    { label: 'Database', value: 'PostgreSQL', color: 'bg-blue-500' },
    { label: 'CMS', value: 'Payload CMS', color: 'bg-purple-600' },
    { label: 'Styling', value: 'Tailwind CSS', color: 'bg-cyan-600' },
    { label: 'Testing', value: 'Jest + Cypress', color: 'bg-green-600' },
    { label: 'Deployment', value: 'Vercel', color: 'bg-slate-800' },
    { label: 'Package Manager', value: 'pnpm', color: 'bg-orange-600' }
  ]

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Code className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Developer Documentation
          </h1>
        </div>
        <p className="text-slate-300 text-lg mb-6">
          Comprehensive guides and references for building and extending the Modern Men Hair BarberShop management system.
        </p>
        
        {/* Technical Stack */}
        <div className="flex flex-wrap gap-2 mb-8">
          {technicalSpecs.map((spec) => (
            <Badge key={spec.label} className={`${spec.color} text-white`}>
              {spec.label}: {spec.value}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-slate-100">Quick Start</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStartSections.map((section) => (
            <Card key={section.title} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors group cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  {section.icon}
                  <Badge variant="outline" className="text-xs">
                    {section.estimatedTime}
                  </Badge>
                </div>
                <CardTitle className="text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-3">
                  {section.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center text-cyan-400 text-sm group-hover:text-cyan-300">
                  Get started
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Development Guides */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-100">Development Guides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {developmentSections.map((section) => (
            <Card key={section.title} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors group cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  {section.icon}
                  <CardTitle className="text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {section.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-4">
                  {section.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2 mb-4">
                  {section.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="flex items-center text-cyan-400 text-sm group-hover:text-cyan-300">
                  View documentation
                  <ExternalLink className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-slate-100">Database Schema</h3>
              </div>
              <p className="text-sm text-slate-400">
                Complete database schema documentation with relationships and constraints.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cog className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-slate-100">Configuration</h3>
              </div>
              <p className="text-sm text-slate-400">
                Environment variables, configuration files, and deployment settings.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-slate-100">Version Control</h3>
              </div>
              <p className="text-sm text-slate-400">
                Git workflows, branching strategies, and release management.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
