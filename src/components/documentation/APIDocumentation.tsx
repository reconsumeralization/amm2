'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown, ChevronRight, Play, Copy, Download } from '@/lib/icon-mapping'
import { APIEndpoint, APIDocumentationSection, SDKGenerationConfig } from '@/types/api-documentation'
import { HTTPMethod } from '@/types/documentation'
import { APITester } from './APITester'
import { CodeGenerator } from './CodeGenerator'
import { cn } from '@/lib/utils'

interface APIDocumentationProps {
  sections: APIDocumentationSection[]
  authentication?: {
    enabled: boolean
    types: readonly ('bearer' | 'apiKey' | 'oauth2')[]
    testCredentials?: {
      bearer?: string
      apiKey?: string
    }
  }
  interactiveTesting?: boolean
  sdkGeneration?: SDKGenerationConfig
  onEndpointTest?: (endpoint: APIEndpoint, result: any) => void
}

export function APIDocumentation({
  sections,
  authentication = { enabled: true, types: ['bearer'] as const },
  interactiveTesting = true,
  sdkGeneration,
  onEndpointTest
}: APIDocumentationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set())
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [showTester, setShowTester] = useState(false)
  const [showCodeGen, setShowCodeGen] = useState(false)

  // Auto-expand first section
  useEffect(() => {
    if (sections.length > 0) {
      setExpandedSections(new Set([sections[0].id]))
    }
  }, [sections])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleEndpoint = (endpointId: string) => {
    const newExpanded = new Set(expandedEndpoints)
    if (newExpanded.has(endpointId)) {
      newExpanded.delete(endpointId)
    } else {
      newExpanded.add(endpointId)
    }
    setExpandedEndpoints(newExpanded)
  }

  const getEndpointId = (endpoint: APIEndpoint) => {
    return `${endpoint.method}-${endpoint.path}`
  }

  const getMethodColor = (method: HTTPMethod) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800 border-blue-200',
      POST: 'bg-green-100 text-green-800 border-green-200',
      PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PATCH: 'bg-orange-100 text-orange-800 border-orange-200',
      DELETE: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const handleTestEndpoint = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint)
    setShowTester(true)
  }

  const handleGenerateCode = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint)
    setShowCodeGen(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadOpenAPISpec = () => {
    // Generate OpenAPI spec from sections
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Modern Men Hair Salon API',
        version: '1.0.0',
        description: 'API documentation for the Modern Men Hair Salon management system'
      },
      paths: {}
    }

    // Convert sections to OpenAPI format
    sections.forEach(section => {
      section.endpoints.forEach(endpoint => {
        if (!(endpoint.path in spec.paths)) {
          (spec.paths as any)[endpoint.path] = {}
        }
        (spec.paths as any)[endpoint.path][endpoint.method.toLowerCase()] = {
          summary: endpoint.summary,
          description: endpoint.description,
          tags: endpoint.tags,
          parameters: [
            ...endpoint.parameters.path,
            ...endpoint.parameters.query,
            ...endpoint.parameters.header
          ],
          responses: endpoint.responses
        }
      })
    })

    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'api-spec.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive API reference with interactive testing and code generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadOpenAPISpec}>
            <Download className="w-4 h-4 mr-2" />
            Download OpenAPI Spec
          </Button>
          {sdkGeneration && (
            <Button variant="outline" onClick={() => setShowCodeGen(true)}>
              Generate SDK
            </Button>
          )}
        </div>
      </div>

      {/* Authentication Info */}
      {authentication.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication
              <Badge variant="secondary">Required</Badge>
            </CardTitle>
            <CardDescription>
              Most endpoints require authentication. Supported methods:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {authentication.types.map(type => (
                <Badge key={type} variant="outline">
                  {type === 'bearer' ? 'Bearer Token' : type.toUpperCase()}
                </Badge>
              ))}
            </div>
            {authentication.types.includes('bearer') && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Bearer Token Format:</p>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  Authorization: Bearer &lt;your-jwt-token&gt;
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Sections */}
      <div className="space-y-4">
        {sections.map(section => (
          <Card key={section.id}>
            <Collapsible
              open={expandedSections.has(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {section.title}
                        <Badge variant="secondary">
                          {section.endpoints.length} endpoint{section.endpoints.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {section.endpoints.map(endpoint => {
                      const endpointId = getEndpointId(endpoint)
                      const isExpanded = expandedEndpoints.has(endpointId)

                      return (
                        <Card key={endpointId} className="border-l-4 border-l-primary/20">
                          <Collapsible
                            open={isExpanded}
                            onOpenChange={() => toggleEndpoint(endpointId)}
                          >
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                    <Badge className={cn('font-mono text-xs', getMethodColor(endpoint.method))}>
                                      {endpoint.method}
                                    </Badge>
                                    <code className="text-sm font-mono">{endpoint.path}</code>
                                    <span className="text-sm text-muted-foreground">
                                      {endpoint.summary}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    {interactiveTesting && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleTestEndpoint(endpoint)
                                        }}
                                      >
                                        <Play className="w-3 h-3 mr-1" />
                                        Test
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleGenerateCode(endpoint)
                                      }}
                                    >
                                      Code
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <EndpointDetails endpoint={endpoint} />
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* API Tester Modal */}
      {showTester && selectedEndpoint && (
        <APITester
          endpoint={selectedEndpoint}
          authentication={authentication}
          onClose={() => setShowTester(false)}
          onTest={(result) => {
            onEndpointTest?.(selectedEndpoint, result)
          }}
        />
      )}

      {/* Code Generator Modal */}
      {showCodeGen && selectedEndpoint && (
        <CodeGenerator
          endpoint={selectedEndpoint}
          sdkConfig={sdkGeneration}
          onClose={() => setShowCodeGen(false)}
        />
      )}
    </div>
  )
}

// Endpoint Details Component
function EndpointDetails({ endpoint }: { endpoint: APIEndpoint }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
        <TabsTrigger value="request">Request</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
        </div>

        {endpoint.tags.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Tags</h4>
            <div className="flex gap-2">
              {endpoint.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {endpoint.security.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Security</h4>
            <div className="flex gap-2">
              {endpoint.security.map((sec, index) => (
                <Badge key={index} variant="secondary">
                  {sec.type} {sec.scheme && `(${sec.scheme})`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="parameters" className="space-y-4">
        <ParametersSection parameters={endpoint.parameters} />
      </TabsContent>

      <TabsContent value="request" className="space-y-4">
        {endpoint.requestBody ? (
          <RequestBodySection requestBody={endpoint.requestBody} />
        ) : (
          <p className="text-sm text-muted-foreground">No request body required</p>
        )}
      </TabsContent>

      <TabsContent value="responses" className="space-y-4">
        <ResponsesSection responses={endpoint.responses} />
      </TabsContent>
    </Tabs>
  )
}

// Parameters Section Component
function ParametersSection({ parameters }: { parameters: APIEndpoint['parameters'] }) {
  const allParams = [
    ...parameters.path.map(p => ({ ...p, in: 'path' })),
    ...parameters.query.map(p => ({ ...p, in: 'query' })),
    ...parameters.header.map(p => ({ ...p, in: 'header' })),
    ...parameters.cookie.map(p => ({ ...p, in: 'cookie' }))
  ]

  if (allParams.length === 0) {
    return <p className="text-sm text-muted-foreground">No parameters required</p>
  }

  return (
    <div className="space-y-4">
      {allParams.map((param, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {param.name}
            </code>
            <Badge variant="outline">{param.in}</Badge>
            <Badge variant={param.required ? 'destructive' : 'secondary'}>
              {param.required ? 'Required' : 'Optional'}
            </Badge>
            <span className="text-xs text-muted-foreground">{param.type}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{param.description}</p>
          {param.example && (
            <div>
              <span className="text-xs font-medium">Example:</span>
              <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                {JSON.stringify(param.example)}
              </code>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Request Body Section Component
function RequestBodySection({ requestBody }: { requestBody: NonNullable<APIEndpoint['requestBody']> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant={requestBody.required ? 'destructive' : 'secondary'}>
          {requestBody.required ? 'Required' : 'Optional'}
        </Badge>
      </div>

      {requestBody.content.map((content, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{content.mediaType}</Badge>
          </div>

          {content.examples && content.examples.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Examples:</span>
              {content.examples.map((example, exIndex) => (
                <div key={exIndex} className="bg-muted rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{example.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(example.value, null, 2))}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(example.value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Responses Section Component
function ResponsesSection({ responses }: { responses: APIEndpoint['responses'] }) {
  return (
    <div className="space-y-4">
      {Object.entries(responses).map(([statusCode, response]) => (
        <div key={statusCode} className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant={statusCode.startsWith('2') ? 'default' : statusCode.startsWith('4') ? 'destructive' : 'secondary'}
            >
              {statusCode}
            </Badge>
            <span className="text-sm">{(response as any).description || 'No description'}</span>
          </div>

          {(response as any).content && (response as any).content.length > 0 && (
            <div className="space-y-2">
              {(response as any).content.map((content: any, index: number) => (
                <div key={index}>
                  <Badge variant="outline" className="mb-2">{content.mediaType}</Badge>
                  {content.examples && content.examples.length > 0 && (
                    <div className="space-y-2">
                      {content.examples.map((example: any, exIndex: number) => (
                        <div key={exIndex} className="bg-muted rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">{example.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigator.clipboard.writeText(JSON.stringify(example.value, null, 2))}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(example.value, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
