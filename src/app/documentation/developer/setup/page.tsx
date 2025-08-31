import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal, Cog, Database, Code, GitBranch, CheckCircle, AlertTriangle, FileText, Settings, Zap, Clock, ExternalLink } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Development Setup - Developer Documentation',
  description: 'Complete guide to setting up your development environment for the Modern Men Hair BarberShop management system.',
}

export default function DeveloperSetupPage() {
  const prerequisites = [
    {
      name: 'Node.js 18+',
      description: 'JavaScript runtime environment',
      icon: <Terminal className="h-5 w-5 text-green-400" />,
      command: 'node --version',
      required: true
    },
    {
      name: 'pnpm',
      description: 'Fast, disk space efficient package manager',
      icon: <Zap className="h-5 w-5 text-orange-400" />,
      command: 'pnpm --version',
      required: true
    },
    {
      name: 'Git',
      description: 'Version control system',
      icon: <GitBranch className="h-5 w-5 text-purple-400" />,
      command: 'git --version',
      required: true
    },
    {
      name: 'PostgreSQL',
      description: 'Database system',
      icon: <Database className="h-5 w-5 text-blue-400" />,
      command: 'psql --version',
      required: true
    },
    {
      name: 'VS Code',
      description: 'Recommended code editor',
      icon: <Code className="h-5 w-5 text-cyan-400" />,
      command: 'code --version',
      required: false
    }
  ]

  const setupSteps = [
    {
      step: 1,
      title: 'Clone the Repository',
      description: 'Get the source code from the repository',
      commands: [
        'git clone https://github.com/your-org/modern-men-BarberShop.git',
        'cd modern-men-BarberShop'
      ],
      icon: <GitBranch className="h-6 w-6 text-purple-400" />
    },
    {
      step: 2,
      title: 'Install Dependencies',
      description: 'Install all required packages using pnpm',
      commands: [
        'pnpm install'
      ],
      icon: <Zap className="h-6 w-6 text-orange-400" />
    },
    {
      step: 3,
      title: 'Environment Configuration',
      description: 'Set up environment variables',
      commands: [
        'cp .env.example .env.local',
        '# Edit .env.local with your configuration'
      ],
      icon: <Settings className="h-6 w-6 text-blue-400" />
    },
    {
      step: 4,
      title: 'Database Setup',
      description: 'Initialize and seed the database',
      commands: [
        'pnpm db:migrate',
        'pnpm db:seed'
      ],
      icon: <Database className="h-6 w-6 text-green-400" />
    },
    {
      step: 5,
      title: 'Start Development Server',
      description: 'Launch the development environment',
      commands: [
        'pnpm dev'
      ],
      icon: <Terminal className="h-6 w-6 text-cyan-400" />
    }
  ]

  const developmentCommands = [
    {
      command: 'pnpm dev',
      description: 'Start development server',
      port: '3000'
    },
    {
      command: 'pnpm build',
      description: 'Build for production',
      port: null
    },
    {
      command: 'pnpm start',
      description: 'Start production server',
      port: '3000'
    },
    {
      command: 'pnpm test',
      description: 'Run test suite',
      port: null
    },
    {
      command: 'pnpm test:watch',
      description: 'Run tests in watch mode',
      port: null
    },
    {
      command: 'pnpm lint',
      description: 'Run ESLint',
      port: null
    },
    {
      command: 'pnpm type-check',
      description: 'Run TypeScript type checking',
      port: null
    }
  ]

  const projectStructure = `src/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── documentation/       # Documentation pages
│   ├── admin/              # Admin dashboard
│   ├── portal/             # Staff portal
│   └── ...                 # Other app pages
├── components/              # React components
│   ├── ui/                 # Base UI components
│   ├── features/           # Feature-specific components
│   └── layout/             # Layout components
├── lib/                    # Utility libraries
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── payload/                # Payload CMS configuration
│   ├── collections/        # CMS collections
│   ├── components/         # Admin UI components
│   └── hooks/              # Payload hooks
├── __tests__/              # Test files
└── stories/                # Storybook stories`

  const nextSteps = [
    {
      title: 'API Documentation',
      description: 'Explore the comprehensive API reference',
      href: '/documentation/developer/api',
      icon: <Code className="h-5 w-5 text-orange-400" />
    },
    {
      title: 'Component Library',
      description: 'Browse the UI component documentation',
      href: '/documentation/developer/components',
      icon: <FileText className="h-5 w-5 text-cyan-400" />
    },
    {
      title: 'Testing Guide',
      description: 'Learn about testing strategies and tools',
      href: '/documentation/developer/testing',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />
    },
    {
      title: 'Architecture Overview',
      description: 'Understand the system architecture',
      href: '/documentation/developer/architecture',
      icon: <Settings className="h-5 w-5 text-purple-400" />
    }
  ]

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Cog className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            Development Setup
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Complete guide to setting up your development environment for the Modern Men Hair BarberShop management system.
        </p>
      </div>

      {/* Prerequisites */}
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <CheckCircle className="h-6 w-6 text-green-400" />
            Prerequisites
          </CardTitle>
          <CardDescription className="text-slate-300">
            Ensure you have the following tools installed before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                {prereq.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-100">{prereq.name}</h3>
                    {prereq.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{prereq.description}</p>
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                    {prereq.command}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Terminal className="h-6 w-6 text-green-400" />
            Installation Steps
          </CardTitle>
          <CardDescription className="text-slate-300">
            Follow these steps to set up your development environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {setupSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {step.icon}
                    <h3 className="text-lg font-semibold text-slate-100">{step.title}</h3>
                  </div>
                  <p className="text-slate-300 mb-3">{step.description}</p>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    {step.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="font-mono text-sm text-slate-300">
                        {command.startsWith('#') ? (
                          <span className="text-slate-500">{command}</span>
                        ) : (
                          <span className="text-green-400">$ {command}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Commands */}
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Terminal className="h-6 w-6 text-cyan-400" />
            Development Commands
          </CardTitle>
          <CardDescription className="text-slate-300">
            Common commands you'll use during development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developmentCommands.map((cmd, index) => (
              <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm font-mono text-green-400">{cmd.command}</code>
                  {cmd.port && (
                    <Badge variant="outline" className="text-xs">
                      :{cmd.port}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">{cmd.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Structure */}
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <FileText className="h-6 w-6 text-purple-400" />
            Project Structure
          </CardTitle>
          <CardDescription className="text-slate-300">
            Overview of the project directory structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto border border-slate-700">
            <code>{projectStructure}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <ExternalLink className="h-6 w-6 text-yellow-400" />
            Next Steps
          </CardTitle>
          <CardDescription className="text-slate-300">
            Continue your development journey with these resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <a
                key={index}
                href={step.href}
                className="group p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  {step.icon}
                  <h3 className="font-medium text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-300">{step.description}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert className="mt-8 bg-blue-900/20 border-blue-700">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notes</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>• Make sure to use <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">pnpm</code> instead of npm or yarn for package management</p>
          <p>• The development server runs on port 3000 by default</p>
          <p>• Database migrations are automatically applied during development</p>
          <p>• Check the <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">.env.example</code> file for required environment variables</p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
