export const getApiToken = () => {
  if (typeof window !== 'undefined') {
    throw new Error('API token should not be accessed on the client side')
  }
  
  const token = process.env.API_TOKEN
  if (!token) {
    throw new Error('API token is not configured')
  }
  
  return token
}

export const getVercelConfig = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Vercel config should not be accessed on the client side')
  }

  const token = process.env.VERCEL_TOKEN
  const orgId = process.env.VERCEL_ORG_ID
  const username = process.env.VERCEL_USERNAME
  const team = process.env.VERCEL_TEAM
  const email = process.env.VERCEL_EMAIL

  if (!token || !orgId || !username || !team || !email) {
    throw new Error('Vercel configuration is incomplete')
  }

  return {
    token,
    orgId,
    username,
    team,
    email
  }
} 