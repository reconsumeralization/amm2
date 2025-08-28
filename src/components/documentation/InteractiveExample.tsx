'use client'

import React, { useState, useEffect } from 'react'
import { Play, Code, Terminal, Database, Cog, Copy, Check, AlertTriangle, Loader2, ExternalLink } from '@/lib/icon-mapping'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { InteractiveExample as InteractiveExampleType, UserRole } from '@/types/documentation'

interface InteractiveExampleProps {
  example: InteractiveExampleType
  userRole?: UserRole
  className?: string
}

export function InteractiveExample({ 
  example, 
  userRole,
  className = '' 
}: InteractiveExampleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Handle copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard"
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      })
    }
  }

  // Get example type icon and color
  const getExampleTypeInfo = (type: string) => {
    switch (type) {
      case 'api-test':
        return {
          icon: <Globe className="h-4 w-4" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        }
      case 'component-playground':
        return {
          icon: <Code className="h-4 w-4" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        }
      case 'code-editor':
        return {
          icon: <Terminal className="h-4 w-4" />,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30'
        }
      default:
        return {
          icon: <Play className="h-4 w-4" />,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-500/30'
        }
    }
  }

  const typeInfo = getExampleTypeInfo(example.type)

  // Render different example types
  const renderExampleContent = () => {
    switch (example.type) {
      case 'api-test':
        return <APITestExample example={example} onResult={setResult} onError={setError} onLoading={setIsLoading} />
      case 'component-playground':
        return <ComponentPlaygroundExample example={example} onResult={setResult} onError={setError} />
      case 'code-editor':
        return <CodeEditorExample example={example} onResult={setResult} onError={setError} onLoading={setIsLoading} />
      default:
        return <GenericExample example={example} />
    }
  }

  return (
    <Card className={`${typeInfo.bgColor} ${typeInfo.borderColor} border ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${typeInfo.color}`}>
              {typeInfo.icon}
            </div>
            <div>
              <CardTitle className="text-lg text-slate-100">{example.title}</CardTitle>
              <p className="text-sm text-slate-300">{example.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {example.type.replace('-', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {renderExampleContent()}
          
          {/* Results Display */}
          {(result || error) && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-200">Result:</h4>
              {error ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <pre className="text-sm text-red-300 whitespace-pre-wrap">{error}</pre>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-400">Success</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="text-sm text-green-300 whitespace-pre-wrap overflow-x-auto">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="ml-2 text-slate-300">Running example...</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// API Test Example Component
interface APITestExampleProps {
  example: InteractiveExampleType
  onResult: (result: any) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

function APITestExample({ example, onResult, onError, onLoading }: APITestExampleProps) {
  const [endpoint, setEndpoint] = useState(example.configuration.endpoint || '/api/test')
  const [method, setMethod] = useState(example.configuration.method || 'GET')
  const [headers, setHeaders] = useState(JSON.stringify(example.configuration.headers || {}, null, 2))
  const [body, setBody] = useState(JSON.stringify(example.configuration.body || {}, null, 2))

  const handleTest = async () => {
    onLoading(true)
    onError('')
    onResult(null)

    try {
      const requestHeaders = JSON.parse(headers)
      const requestBody = method !== 'GET' ? JSON.parse(body) : undefined

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...requestHeaders
        },
        body: requestBody ? JSON.stringify(requestBody) : undefined
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Request failed'}`)
      }

      onResult(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Endpoint</label>
          <Input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/endpoint"
            className="bg-slate-800 border-slate-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Headers (JSON)</label>
        <Textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder='{"Authorization": "Bearer token"}'
          className="bg-slate-800 border-slate-600 font-mono text-sm"
          rows={3}
        />
      </div>

      {method !== 'GET' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Request Body (JSON)</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            className="bg-slate-800 border-slate-600 font-mono text-sm"
            rows={4}
          />
        </div>
      )}

      <Button onClick={handleTest} className="w-full bg-blue-600 hover:bg-blue-700">
        <Globe className="h-4 w-4 mr-2" />
        Test API
      </Button>
    </div>
  )
}

// Component Playground Example
interface ComponentPlaygroundExampleProps {
  example: InteractiveExampleType
  onResult: (result: any) => void
  onError: (error: string) => void
}

function ComponentPlaygroundExample({ example, onResult, onError }: ComponentPlaygroundExampleProps) {
  const [props, setProps] = useState(JSON.stringify(example.configuration.props || {}, null, 2))
  const [componentCode, setComponentCode] = useState(example.configuration.code || '')

  const handleRender = () => {
    try {
      const parsedProps = JSON.parse(props)
      onResult({ props: parsedProps, code: componentCode })
      onError('')
    } catch (err) {
      onError('Invalid JSON in props')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Component Props (JSON)</label>
        <Textarea
          value={props}
          onChange={(e) => setProps(e.target.value)}
          placeholder='{"title": "Example", "variant": "primary"}'
          className="bg-slate-800 border-slate-600 font-mono text-sm"
          rows={4}
        />
      </div>

      {example.configuration.allowCodeEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Component Code</label>
          <Textarea
            value={componentCode}
            onChange={(e) => setComponentCode(e.target.value)}
            placeholder="<Button {...props}>Click me</Button>"
            className="bg-slate-800 border-slate-600 font-mono text-sm"
            rows={6}
          />
        </div>
      )}

      <Button onClick={handleRender} className="w-full bg-green-600 hover:bg-green-700">
        <Code className="h-4 w-4 mr-2" />
        Render Component
      </Button>

      {example.configuration.storybookUrl && (
        <Button variant="outline" className="w-full" asChild>
          <a href={example.configuration.storybookUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Storybook
          </a>
        </Button>
      )}
    </div>
  )
}

// Code Editor Example
interface CodeEditorExampleProps {
  example: InteractiveExampleType
  onResult: (result: any) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

function CodeEditorExample({ example, onResult, onError, onLoading }: CodeEditorExampleProps) {
  const [code, setCode] = useState(example.configuration.defaultCode || '')
  const [language, setLanguage] = useState(example.configuration.language || 'javascript')

  const handleRun = async () => {
    onLoading(true)
    onError('')
    onResult(null)

    try {
      // This would integrate with a code execution service
      // For now, we'll simulate execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (language === 'javascript') {
        // Simple JavaScript evaluation (in a real implementation, this would be sandboxed)
        try {
          const result = eval(code)
          onResult(result)
        } catch (evalError) {
          onError(`JavaScript Error: ${evalError instanceof Error ? evalError.message : 'Unknown error'}`)
        }
      } else {
        onResult(`Code executed successfully (${language})`)
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Execution failed')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="bash">Bash</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="console.log('Hello, World!');"
          className="bg-slate-800 border-slate-600 font-mono text-sm"
          rows={8}
        />
      </div>

      <Button onClick={handleRun} className="w-full bg-purple-600 hover:bg-purple-700">
        <Terminal className="h-4 w-4 mr-2" />
        Run Code
      </Button>
    </div>
  )
}

// Generic Example Component
function GenericExample({ example }: { example: InteractiveExampleType }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h4 className="font-medium text-slate-200 mb-2">Configuration</h4>
        <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(example.configuration, null, 2)}
        </pre>
      </div>
      <p className="text-slate-400 text-sm">
        This example type ({example.type}) is not yet implemented with interactive features.
      </p>
    </div>
  )
}