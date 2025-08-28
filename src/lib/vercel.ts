import { getVercelConfig } from '@/config/api'

const VERCEL_API_BASE = 'https://api.vercel.com'

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

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
      next: { revalidate: 60 }, // Revalidate every minute
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch projects')
    }
    
    const data = await res.json()
    return data.projects
  } catch (error) {
    console.error('Error fetching Vercel projects:', error)
    return []
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const res = await fetch(`https://api.vercel.com/v9/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
      next: { revalidate: 60 },
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch project')
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }
}

export async function deployToVercel() {
  const { token, orgId, username, team } = getVercelConfig()

  const response = await fetch(`${VERCEL_API_BASE}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'mcp-nextjs-starter',
      gitSource: {
        type: 'github',
        repo: 'mcp-nextjs-starter',
        ref: 'main',
      },
      target: 'production',
      teamId: orgId,
      team: team,
      user: username,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to deploy: ${response.statusText}`)
  }

  return response.json()
}

export async function getDeployments() {
  const { token, orgId, team } = getVercelConfig()

  const response = await fetch(
    `${VERCEL_API_BASE}/v6/deployments?teamId=${orgId}&team=${team}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch deployments: ${response.statusText}`)
  }

  return response.json()
} 