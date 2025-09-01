import express, { Request, Response, Router } from 'express'
import { z } from 'zod'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { ServerResponse } from 'http'
import { IncomingMessage } from 'http'

const app = express()
const router = Router()
app.use(cors())
app.use(express.json())

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Tool registry
const tools = new Map<string, {
  schema: z.ZodType<any>,
  handler: (params: any) => Promise<any>
}>()

// Register a tool
function registerTool(name: string, schema: z.ZodType<any>, handler: (params: any) => Promise<any>) {
  tools.set(name, { schema, handler })
}

// Web Search Tool
registerTool('webSearch',
  z.object({
    query: z.string(),
    maxResults: z.number().optional().default(5),
    searchType: z.enum(['general', 'news', 'images', 'videos']).optional().default('general')
  }),
  async ({ query, maxResults, searchType }) => {
    try {
      // Use Supabase Edge Function for web search
      const { data, error } = await supabase.functions.invoke('web-search', {
        body: { 
          query, 
          maxResults, 
          searchType,
          // Include additional parameters for better search results
          safeSearch: 'moderate',
          freshness: 'recent'
        }
      })
      
      if (error) throw error
      
      // Format search results for better readability
      const formattedResults = data.results?.map((result: any, index: number) => 
        `${index + 1}. **${result.title}**\n   URL: ${result.url}\n   ${result.snippet}\n`
      ).join('\n') || 'No results found'
      
      return { 
        content: [{ 
          type: "text", 
          text: `Web Search Results for "${query}":\n\n${formattedResults}` 
        }] 
      }
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error performing web search: ${error instanceof Error ? error.message : String(error)}` 
        }] 
      }
    }
  }
)

// Enhanced Web Lookup Tool with AI summarization
registerTool('webLookup',
  z.object({
    url: z.string().url(),
    summarize: z.boolean().optional().default(true),
    extractType: z.enum(['text', 'metadata', 'links', 'all']).optional().default('text')
  }),
  async ({ url, summarize, extractType }) => {
    try {
      // Use Supabase Edge Function for web content extraction
      const { data, error } = await supabase.functions.invoke('web-lookup', {
        body: { 
          url, 
          extractType,
          // Additional options for content extraction
          includeImages: extractType === 'all',
          followRedirects: true,
          timeout: 30000
        }
      })
      
      if (error) throw error
      
      let content = data.content || 'No content extracted'
      
      // If summarization is requested and content is lengthy
      if (summarize && content.length > 1000) {
        try {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('chat', {
            body: { 
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful assistant that summarizes web content. Provide a concise, informative summary of the key points.'
                },
                {
                  role: 'user',
                  content: `Please summarize this web content:\n\n${content.substring(0, 4000)}`
                }
              ],
              model: 'gpt-3.5-turbo'
            }
          })
          
          if (!summaryError && summaryData?.response) {
            content = `**Summary:**\n${summaryData.response}\n\n**Original URL:** ${url}`
          }
        } catch (summaryError) {
          // If summarization fails, return original content
          console.warn('Summarization failed:', summaryError)
        }
      }
      
      return { 
        content: [{ 
          type: "text", 
          text: content
        }] 
      }
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error looking up URL: ${error instanceof Error ? error.message : String(error)}` 
        }] 
      }
    }
  }
)

// Supabase AI Tools
registerTool('supabaseEmbeddings', 
  z.object({
    text: z.string(),
    model: z.string().optional().default('text-embedding-ada-002')
  }),
  async ({ text, model }) => {
    try {
      const { data, error } = await supabase.functions.invoke('embeddings', {
        body: { text, model }
      })
      
      if (error) throw error
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(data) 
        }] 
      }
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error generating embeddings: ${error instanceof Error ? error.message : String(error)}` 
        }] 
      }
    }
  }
)

registerTool('supabaseChat', 
  z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })),
    model: z.string().optional().default('gpt-3.5-turbo'),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().optional().default(1000)
  }),
  async ({ messages, model, temperature, maxTokens }) => {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages, 
          model,
          temperature,
          max_tokens: maxTokens
        }
      })
      
      if (error) throw error
      
      return { 
        content: [{ 
          type: "text", 
          text: data.response 
        }] 
      }
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error in chat completion: ${error instanceof Error ? error.message : String(error)}` 
        }] 
      }
    }
  }
)

// File System Tools
registerTool('readFile',
  z.object({
    path: z.string(),
    encoding: z.string().optional().default('utf8')
  }),
  async ({ path, encoding }) => {
    try {
      const fs = await import('fs/promises')
      const content = await fs.readFile(path, encoding as BufferEncoding)
      return {
        content: [{
          type: "text",
          text: content
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error reading file: ${error instanceof Error ? error.message : String(error)}`
        }]
      }
    }
  }
)

registerTool('writeFile',
  z.object({
    path: z.string(),
    content: z.string(),
    encoding: z.string().optional().default('utf8')
  }),
  async ({ path, content, encoding }) => {
    try {
      const fs = await import('fs/promises')
      await fs.writeFile(path, content, encoding as BufferEncoding)
      return {
        content: [{
          type: "text",
          text: `Successfully wrote to file: ${path}`
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error writing file: ${error instanceof Error ? error.message : String(error)}`
        }]
      }
    }
  }
)

registerTool('listDirectory',
  z.object({
    path: z.string(),
    recursive: z.boolean().optional().default(false)
  }),
  async ({ path, recursive }) => {
    try {
      const fs = await import('fs/promises')
      const pathModule = await import('path')
      
      const listFiles = async (dirPath: string, isRecursive: boolean = false): Promise<string[]> => {
        const items = await fs.readdir(dirPath, { withFileTypes: true })
        let files: string[] = []
        
        for (const item of items) {
          const fullPath = pathModule.join(dirPath, item.name)
          if (item.isDirectory() && isRecursive) {
            const subFiles = await listFiles(fullPath, true)
            files.push(...subFiles)
          } else {
            files.push(fullPath)
          }
        }
        
        return files
      }
      
      const files = await listFiles(path, recursive)
      return {
        content: [{
          type: "text",
          text: files.join('\n')
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error listing directory: ${error instanceof Error ? error.message : String(error)}`
        }]
      }
    }
  }
)

// System Information Tools
registerTool('getSystemInfo',
  z.object({}),
  async () => {
    try {
      const os = await import('os')
      const info = {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        },
        cpus: os.cpus().length
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(info, null, 2)
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error getting system info: ${error instanceof Error ? error.message : String(error)}`
        }]
      }
    }
  }
)

// Example tool registration
registerTool('executeCommand', 
  z.object({
    command: z.string(),
    args: z.array(z.string()).optional()
  }),
  async ({ command, args }) => {
    try {
      const { spawn } = await import('child_process')
      const { promisify } = await import('util')
      
      return new Promise((resolve) => {
        const child = spawn(command, args || [], { stdio: 'pipe' })
        let stdout = ''
        let stderr = ''
        
        child.stdout?.on('data', (data) => {
          stdout += data.toString()
        })
        
        child.stderr?.on('data', (data) => {
          stderr += data.toString()
        })
        
        child.on('close', (code) => {
          resolve({
            content: [{
              type: "text",
              text: `Command: ${command} ${args?.join(' ') || ''}\nExit code: ${code}\n\nStdout:\n${stdout}\n\nStderr:\n${stderr}`
            }]
          })
        })
        
        child.on('error', (error) => {
          resolve({
            content: [{
              type: "text",
              text: `Error executing command: ${error.message}`
            }]
          })
        })
      })
    } catch (error) {
      return { 
        content: [{ 
          type: "text", 
          text: `Error executing command: ${error instanceof Error ? error.message : String(error)}` 
        }] 
      }
    }
  }
)

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// SSE endpoint for Cursor
router.get('/sse', (req: Request, res: Response) => {
  const nativeRes = res as unknown as ServerResponse
  const nativeReq = req as unknown as IncomingMessage
  
  nativeRes.setHeader('Content-Type', 'text/event-stream')
  nativeRes.setHeader('Cache-Control', 'no-cache')
  nativeRes.setHeader('Connection', 'keep-alive')
  nativeRes.setHeader('Access-Control-Allow-Origin', '*')
  nativeRes.setHeader('Access-Control-Allow-Headers', 'Cache-Control')

  // Send initial tools list
  const toolList = Array.from(tools.entries()).map(([name, { schema }]) => ({
    name,
    schema: schema._def
  }))
  
  nativeRes.write(`data: ${JSON.stringify({ type: 'tools', tools: toolList })}\n\n`)

  // Keep connection alive
  const interval = setInterval(() => {
    nativeRes.write(': keepalive\n\n')
  }, 30000)

  nativeReq.on('close', () => {
    clearInterval(interval)
  })
  
  nativeReq.on('error', (error) => {
    console.error('SSE connection error:', error)
    clearInterval(interval)
  })
})

// Define interface for execute request body
interface ExecuteRequestBody {
  tool: string
  params: any
}

// Tool execution endpoint - Fixed TypeScript generic usage
router.post('/execute', async (req: Request, res: Response) => {
  const { tool, params } = req.body as ExecuteRequestBody
  
  if (!tools.has(tool)) {
    return res.status(404).json({ error: 'Tool not found' })
  }

  const { schema, handler } = tools.get(tool)!
  
  try {
    const validatedParams = schema.parse(params)
    const result = await handler(validatedParams)
    res.json(result)
  } catch (error) {
    console.error(`Error executing tool ${tool}:`, error)
    res.status(400).json({ 
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// Tool discovery endpoint
router.get('/tools', (req: Request, res: Response) => {
  const toolList = Array.from(tools.entries()).map(([name, { schema }]) => ({
    name,
    schema: schema._def
  }))
  res.json(toolList)
})

app.use('/', router)

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`Cursor Bridge MCP Server running on port ${PORT}`)
  console.log(`Available tools: ${Array.from(tools.keys()).join(', ')}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
