import { Suspense } from 'react'
import Image from 'next/image'
import { LoadingSkeleton } from '@/components/ui/loading'

// Add type definitions for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

interface Project {
  id: string
  name: string
  framework: string
  latestDeployments?: Array<{
    url?: string
    state?: string
    createdAt?: string
  }>
  updatedAt: string
  link?: {
    type?: string
    repo?: string
    url?: string
  }
}

async function getVercelProjects() {
  try {
    const res = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
      next: { revalidate: 60 }, // Revalidate every minute
    })
    
    if (!res.ok) throw new Error('Failed to fetch projects')
    
    const data = await res.json()
    return data.projects as Project[]
  } catch (error) {
    console.error('Error fetching Vercel projects:', error)
    return []
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getFrameworkIcon(framework: string) {
  switch (framework.toLowerCase()) {
    case 'nextjs':
      return '/frameworks/nextjs.svg'
    case 'react':
      return '/frameworks/react.svg'
    default:
      return null
  }
}

function ProjectsList({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No projects found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first project on Vercel to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900"
        >
          <div className="relative h-48 bg-gray-50 dark:bg-gray-800">
            {project.framework ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={getFrameworkIcon(project.framework) || '/frameworks/default.svg'}
                  alt={project.framework}
                  width={120}
                  height={120}
                  className="object-contain p-4"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">No framework detected</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-2">{project.framework || 'Static'}</span>
                <span>•</span>
                <span className="ml-2">Updated {formatDate(project.updatedAt)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {project.latestDeployments?.[0]?.url && (
                  <a
                    href={`https://${project.latestDeployments[0].url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Live Site
                  </a>
                )}
                {project.link?.repo && (
                  <a
                    href={project.link.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Source
                  </a>
                )}
              </div>
              
              {project.latestDeployments?.[0]?.state && (
                <div className="flex items-center text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    project.latestDeployments[0].state === 'READY' 
                      ? 'bg-green-500' 
                      : project.latestDeployments[0].state === 'ERROR'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}></span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {project.latestDeployments[0].state.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function VercelProjectsPage() {
  const projects = await getVercelProjects()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">My Vercel Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your deployed applications
          </p>
        </div>
        <a
          href="https://vercel.com/new"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          + New Project
        </a>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      }>
        <ProjectsList projects={projects} />
      </Suspense>
    </div>
  )
} 