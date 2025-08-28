import express, { Request, Response, Router } from 'express'
import { z } from 'zod'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const router = Router()
app.use(cors())
app.use(express.json())

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

// Tool registry
const tools = new Map<string, {
  schema: z.ZodType<any>,
  handler: (params: any) => Promise<any>
}>()

// Register a tool
function registerTool(name: string, schema: z.ZodType<any>, handler: (params: any) => Promise<any>) {
  tools.set(name, { schema, handler })
}

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
    model: z.string().optional().default('gpt-3.5-turbo')
  }),
  async ({ messages, model }) => {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages, model }
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

// Example tool registration
registerTool('executeCommand', 
  z.object({
    command: z.string(),
    args: z.array(z.string()).optional()
  }),
  async ({ command, args }) => {
    try {
      return { 
        content: [{ 
          type: "text", 
          text: `Executed command: ${command} ${args?.join(' ') || ''}` 
        }] 
      }
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

// SSE endpoint for Cursor
router.get('/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Send initial tools list
  const toolList = Array.from(tools.entries()).map(([name, { schema }]) => ({
    name,
    schema: schema._def
  }))
  
  res.write(`data: ${JSON.stringify({ type: 'tools', tools: toolList })}\n\n`)

  // Keep connection alive
  const interval = setInterval(() => {
    res.write(': keepalive\n\n')
  }, 30000)

  req.on('close', () => {
    clearInterval(interval)
  })
})

// Tool execution endpoint
router.post('/execute', async (req: Request, res: Response) => {
  const { tool, params } = req.body
  
  if (!tools.has(tool)) {
    return res.status(404).json({ error: 'Tool not found' })
  }

  const { schema, handler } = tools.get(tool)!
  
  try {
    const validatedParams = schema.parse(params)
    const result = await handler(validatedParams)
    res.json(result)
  } catch (error) {
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
app.listen(PORT, () => {
  console.log(`Cursor Bridge MCP Server running on port ${PORT}`)
}) 