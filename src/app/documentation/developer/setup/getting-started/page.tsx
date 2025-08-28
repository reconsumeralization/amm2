import React from 'react'
import { GuideRenderer } from '@/components/documentation'
import { GuideContent } from '@/types/documentation'

// Sample guide data - in a real app, this would come from a CMS or API
const sampleGuide: GuideContent = {
  metadata: {
    id: 'getting-started-guide',
    title: 'Getting Started with Development',
    description: 'A comprehensive guide to setting up your development environment and understanding the project structure.',
    author: 'Development Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 2, patch: 0 },
    targetAudience: ['developer'],
    difficulty: 'beginner',
    estimatedTime: 30,
    tags: ['setup', 'environment', 'getting-started', 'development'],
    locale: 'en',
    deprecated: false
  },
  content: {
    introduction: `
      <p>Welcome to the Modern Men Hair Salon development environment! This guide will walk you through setting up your local development environment, understanding the project structure, and making your first contribution.</p>
      <p>By the end of this guide, you'll have a fully functional development environment and understand the key concepts needed to work effectively with our codebase.</p>
    `,
    prerequisites: [
      {
        id: 'node-js',
        title: 'Node.js 18+ installed',
        description: 'You need Node.js version 18 or higher to run the development server and build tools.',
        required: true,
        link: 'https://nodejs.org/'
      },
      {
        id: 'git',
        title: 'Git version control',
        description: 'Git is required for cloning the repository and managing version control.',
        required: true,
        link: 'https://git-scm.com/'
      },
      {
        id: 'vscode',
        title: 'VS Code (recommended)',
        description: 'While not required, VS Code provides the best development experience with our configured extensions.',
        required: false,
        link: 'https://code.visualstudio.com/'
      },
      {
        id: 'docker',
        title: 'Docker Desktop',
        description: 'Docker is needed for running the database and other services locally.',
        required: false,
        link: 'https://www.docker.com/products/docker-desktop/'
      }
    ],
    steps: [
      {
        id: 'clone-repository',
        title: 'Clone the Repository',
        description: 'Get a local copy of the codebase on your machine',
        content: `
          <p>First, clone the repository to your local machine using Git:</p>
          <ol>
            <li>Open your terminal or command prompt</li>
            <li>Navigate to the directory where you want to store the project</li>
            <li>Run the git clone command</li>
            <li>Navigate into the project directory</li>
          </ol>
        `,
        estimatedTime: 5,
        codeSnippets: [
          {
            id: 'git-clone',
            language: 'bash',
            code: `# Clone the repository
git clone https://github.com/your-org/modern-men-salon.git

# Navigate to the project directory
cd modern-men-salon

# Check the current branch
git branch`,
            description: 'Clone the repository and navigate to the project directory',
            runnable: true,
            filename: 'clone-repo.sh'
          }
        ]
      },
      {
        id: 'install-dependencies',
        title: 'Install Dependencies',
        description: 'Install all required Node.js packages and dependencies',
        content: `
          <p>Install the project dependencies using npm. This will download all the packages listed in package.json:</p>
          <p><strong>Note:</strong> The installation may take a few minutes depending on your internet connection.</p>
        `,
        estimatedTime: 10,
        codeSnippets: [
          {
            id: 'npm-install',
            language: 'bash',
            code: `# Install dependencies
npm install

# Verify installation
npm list --depth=0`,
            description: 'Install project dependencies',
            runnable: true,
            filename: 'install-deps.sh'
          }
        ]
      },
      {
        id: 'environment-setup',
        title: 'Environment Configuration',
        description: 'Set up environment variables and configuration files',
        content: `
          <p>Copy the example environment file and configure it for your local development:</p>
          <ol>
            <li>Copy the .env.example file to .env.local</li>
            <li>Update the environment variables with your local settings</li>
            <li>Generate necessary API keys and secrets</li>
          </ol>
        `,
        estimatedTime: 8,
        codeSnippets: [
          {
            id: 'env-setup',
            language: 'bash',
            code: `# Copy environment file
cp .env.example .env.local

# Generate a secret key (optional)
openssl rand -base64 32`,
            description: 'Set up environment configuration',
            runnable: true,
            filename: 'setup-env.sh'
          },
          {
            id: 'env-example',
            language: 'bash',
            code: `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/salon_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# External APIs
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."`,
            description: 'Example environment variables',
            runnable: false,
            filename: '.env.local'
          }
        ]
      },
      {
        id: 'database-setup',
        title: 'Database Setup',
        description: 'Initialize the database and run migrations',
        content: `
          <p>Set up the database for local development:</p>
          <ol>
            <li>Start the database service (using Docker or local installation)</li>
            <li>Run database migrations to create tables</li>
            <li>Seed the database with sample data</li>
          </ol>
        `,
        estimatedTime: 5,
        codeSnippets: [
          {
            id: 'db-setup',
            language: 'bash',
            code: `# Start database with Docker (if using Docker)
docker-compose up -d postgres

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed`,
            description: 'Initialize and set up the database',
            runnable: true,
            filename: 'setup-db.sh'
          }
        ],
        interactiveExamples: [
          {
            id: 'db-connection-test',
            title: 'Test Database Connection',
            description: 'Verify that your database connection is working correctly',
            type: 'api-test',
            configuration: {
              endpoint: '/api/health/database',
              method: 'GET',
              headers: {},
              expectedResponse: { status: 'connected', database: 'salon_db' }
            }
          }
        ]
      },
      {
        id: 'start-development',
        title: 'Start Development Server',
        description: 'Launch the development server and verify everything works',
        content: `
          <p>Start the development server and open the application in your browser:</p>
          <p>The development server includes hot reloading, so changes you make to the code will automatically refresh the browser.</p>
        `,
        estimatedTime: 2,
        codeSnippets: [
          {
            id: 'dev-server',
            language: 'bash',
            code: `# Start the development server
npm run dev

# The server will start on http://localhost:3000
# Press Ctrl+C to stop the server`,
            description: 'Start the development server',
            runnable: true,
            filename: 'start-dev.sh'
          }
        ],
        interactiveExamples: [
          {
            id: 'health-check',
            title: 'Application Health Check',
            description: 'Test that the application is running correctly',
            type: 'api-test',
            configuration: {
              endpoint: '/api/health',
              method: 'GET',
              headers: {},
              expectedResponse: { status: 'ok', timestamp: 'ISO-date' }
            }
          }
        ]
      }
    ],
    troubleshooting: [
      {
        id: 'port-in-use',
        problem: 'Port 3000 is already in use',
        solution: `
          <p>If you see an error that port 3000 is already in use:</p>
          <ol>
            <li>Check what's running on port 3000: <code>lsof -i :3000</code></li>
            <li>Kill the process: <code>kill -9 &lt;PID&gt;</code></li>
            <li>Or use a different port: <code>npm run dev -- -p 3001</code></li>
          </ol>
        `,
        tags: ['port', 'server', 'development']
      },
      {
        id: 'database-connection',
        problem: 'Cannot connect to database',
        solution: `
          <p>If you're having database connection issues:</p>
          <ol>
            <li>Verify your DATABASE_URL in .env.local</li>
            <li>Make sure PostgreSQL is running</li>
            <li>Check if the database exists: <code>psql -l</code></li>
            <li>Try connecting manually: <code>psql $DATABASE_URL</code></li>
          </ol>
        `,
        tags: ['database', 'postgresql', 'connection']
      },
      {
        id: 'npm-install-fails',
        problem: 'npm install fails with permission errors',
        solution: `
          <p>If npm install fails with permission errors:</p>
          <ol>
            <li>Don't use sudo with npm</li>
            <li>Configure npm to use a different directory: <code>npm config set prefix ~/.npm-global</code></li>
            <li>Add to your PATH: <code>export PATH=~/.npm-global/bin:$PATH</code></li>
            <li>Or use a Node version manager like nvm</li>
          </ol>
        `,
        tags: ['npm', 'permissions', 'installation']
      }
    ],
    relatedContent: [
      {
        id: 'project-structure',
        title: 'Understanding Project Structure',
        type: 'guide',
        url: '/documentation/developer/architecture/project-structure',
        relevanceScore: 0.9
      },
      {
        id: 'coding-standards',
        title: 'Coding Standards and Guidelines',
        type: 'reference',
        url: '/documentation/developer/contributing/coding-standards',
        relevanceScore: 0.8
      },
      {
        id: 'api-overview',
        title: 'API Documentation Overview',
        type: 'api',
        url: '/documentation/developer/api/overview',
        relevanceScore: 0.7
      },
      {
        id: 'testing-guide',
        title: 'Testing Your Code',
        type: 'guide',
        url: '/documentation/developer/testing/getting-started',
        relevanceScore: 0.75
      }
    ],
    interactiveExamples: [
      {
        id: 'component-playground',
        title: 'Button Component Playground',
        description: 'Try out different button variants and props',
        type: 'component-playground',
        configuration: {
          component: 'Button',
          props: {
            variant: 'primary',
            size: 'medium',
            children: 'Click me!'
          },
          allowCodeEdit: true,
          storybookUrl: 'http://localhost:6006/?path=/story/button--primary'
        }
      }
    ],
    codeSnippets: [
      {
        id: 'package-json-scripts',
        language: 'json',
        code: `{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}`,
        description: 'Available npm scripts for development',
        runnable: false,
        filename: 'package.json'
      }
    ]
  },
  validation: {
    reviewed: true,
    reviewedBy: 'senior-developer',
    reviewDate: new Date('2024-01-10'),
    accuracy: 0.95,
    accessibilityCompliant: true,
    lastValidated: new Date('2024-01-15')
  },
  analytics: {
    viewCount: 1250,
    completionRate: 0.87,
    averageRating: 4.6,
    feedbackCount: 23,
    rchRanking: 0.92
  },
  versioning: {
    changeHistory: [
      {
        version: { major: 1, minor: 2, patch: 0 },
        date: new Date('2024-01-15'),
        author: 'dev-team',
        changes: ['Updated Node.js version requirement', 'Added Docker setup instructions'],
        type: 'minor'
      },
      {
        version: { major: 1, minor: 1, patch: 0 },
        date: new Date('2024-01-01'),
        author: 'dev-team',
        changes: ['Added troubleshooting section', 'Improved code examples'],
        type: 'minor'
      }
    ],
    previousVersions: ['1.1.0', '1.0.0'],
    migrationNotes: 'No breaking changes in this version.'
  }
}

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <GuideRenderer
        guide={sampleGuide}
        interactive={true}
        stepByStep={true}
        onStepComplete={(stepId) => {
          console.log('Step completed:', stepId)
          // In a real app, this would track completion analytics
        }}
        onGuideComplete={() => {
          console.log('Guide completed!')
          // In a real app, this would update user progress
        }}
      />
    </div>
  )
}