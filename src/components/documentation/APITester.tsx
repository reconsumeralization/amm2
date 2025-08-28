'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Play, Copy, Download, Clock, AlertTriangle, CheckCircle } from '@/lib/icon-mapping'
import { APIEndpoint, APITestRequest, APITestResponse, APITestHistory } from '@/types/api-documentation'
import { cn } from '@/lib/utils'

interface APITesterProps {
  endpoint: APIEndpoint
  authentication?: {
    enabled: boolean
    types: readonly ('bearer' | 'apiKey' | 'oauth2')[]
    testCredentials?: {
      bearer?: string
      apiKey?: string
    }
  }
  onClose: () => void
  onTest?: (result: APITestResponse) => void
}

export function APITester({ endpoint, authentication, onClose, onTest }: APITesterProps) {
  const [loading, setLoading] = useState(false)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json'
  })
  const [requestBody, setRequestBody] = useState('')
  const [authType, setAuthType] = useState<'bearer' | 'apiKey' | 'none'>('bearer')
  const [authToken, setAuthToken] = useState('')
  const [response, setResponse] = useState<APITestResponse | null>(null)
  const [history, setHistory] = useState<APITestHistory[]>([])
  const [saveToHistory, setSaveToHistory] = useState(true)

  // Initialize with default values
  useEffect(() => {
    // Set default auth token if available
    if (authentication?.testCredentials?.bearer) {
      setAuthToken(authentication.testCredentials.bearer)
    }

    // Initialize parameters with examples
    const defaultParams: Record<string, any> = {}
    const allParams = [
      ...endpoint.parameters.path,
      ...endpoint.parameters.query,
      ...endpoint.parameters.header,
      ...endpoint.parameters.cookie
    ]

    allParams.forEach(param => {
      if (param.example !== undefined) {
        defaultParams[param.name] = param.example
      }
    })

    setParameters(defaultParams)

    // Set default request body if available
    if (endpoint.requestBody?.content[0]?.examples?.[0]?.value) {
      setRequestBody(JSON.stringify(endpoint.requestBody.content[0].examples[0].value, null, 2))
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem(`api-test-history-${endpoint.operationId}`)
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.warn('Failed to load test history:', error)
      }
    }
  }, [endpoint, authentication])

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleHeaderChange = (name: string, value: string) => {
    setHeaders(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addCustomHeader = () => {
    const name = prompt('Header name:')
    if (name) {
      setHeaders(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const removeHeader = (name: string) => {
    setHeaders(prev => {
      const newHeaders = { ...prev }
      delete newHeaders[name]
      return newHeaders
    })
  }

  const buildRequestUrl = () => {
    let url = endpoint.path

    // Replace path parameters
    endpoint.parameters.path.forEach(param => {
      const value = parameters[param.name]
      if (value !== undefined) {
        url = url.replace(`{${param.name}}`, encodeURIComponent(value))
      }
    })

    // Add query parameters
    const queryParams = new URLrchParams()
    endpoint.parameters.query.forEach(param => {
      const value = parameters[param.name]
      if (value !== undefined && value !== '') {
        queryParams.append(param.name, value)
      }
    })

    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    return url
  }

  const buildRequestHeaders = () => {
    const requestHeaders = { ...headers }

    // Add authentication header
    if (authType === 'bearer' && authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    } else if (authType === 'apiKey' && authToken) {
      requestHeaders['X-API-Key'] = authToken
    }

    // Add parameter headers
    endpoint.parameters.header.forEach(param => {
      const value = parameters[param.name]
      if (value !== undefined && value !== '') {
        requestHeaders[param.name] = value
      }
    })

    return requestHeaders
  }

  const executeTest = async () => {
    setLoading(true)
    const startTime = Date.now()

    try {
      const url = buildRequestUrl()
      const requestHeaders = buildRequestHeaders()
      
      let body: any = undefined
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && requestBody.trim()) {
        try {
          body = JSON.parse(requestBody)
        } catch (error) {
          throw new Error('Invalid JSON in request body')
        }
      }

      const testRequest: APITestRequest = {
        endpoint,
        parameters,
        headers: requestHeaders,
        body,
        authentication: authType !== 'none' ? {
          type: authType,
          token: authToken
        } : undefined
      }

      // Make the actual API call
      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers: requestHeaders
      }

      if (body) {
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, fetchOptions)
      const responseData = await response.text()
      
      let parsedData: any
      try {
        parsedData = JSON.parse(responseData)
      } catch {
        parsedData = responseData
      }

      const duration = Date.now() - startTime
      const testResponse: APITestResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData,
        duration,
        timestamp: new Date()
      }

      setResponse(testResponse)
      onTest?.(testResponse)

      // Save to history
      if (saveToHistory) {
        const historyItem: APITestHistory = {
          id: Date.now().toString(),
          request: testRequest,
          response: testResponse,
          timestamp: new Date(),
          success: response.ok
        }

        const newHistory = [historyItem, ...history.slice(0, 9)] // Keep last 10
        setHistory(newHistory)
        localStorage.setItem(`api-test-history-${endpoint.operationId}`, JSON.stringify(newHistory))
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorResponse: APITestResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        duration,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      setResponse(errorResponse)
      onTest?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }

  const loadFromHistory = (historyItem: APITestHistory) => {
    setParameters(historyItem.request.parameters)
    setHeaders(historyItem.request.headers)
    if (historyItem.request.body) {
      setRequestBody(JSON.stringify(historyItem.request.body, null, 2))
    }
    if (historyItem.request.authentication) {
      // Only set auth type if it's a valid type for our state
      if (historyItem.request.authentication.type !== 'basic') {
        setAuthType(historyItem.request.authentication.type)
      }
      setAuthToken(historyItem.request.authentication.token || '')
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={cn('font-mono text-xs', 
              endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
              endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
              endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            )}>
              {endpoint.method}
            </Badge>
            <code className="text-sm font-mono">{endpoint.path}</code>
          </DialogTitle>
          <DialogDescription>
            Test this API endpoint with custom parameters and authentication
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="parameters" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="auth">Auth</TabsTrigger>
                  </TabsList>

                  <TabsContent value="parameters" className="space-y-4">
                    {[...endpoint.parameters.path, ...endpoint.parameters.query].map(param => (
                      <div key={param.name} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {param.name}
                          <Badge variant={param.required ? 'destructive' : 'secondary'} className="text-xs">
                            {param.required ? 'Required' : 'Optional'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">({param.type})</span>
                        </Label>
                        <Input
                          value={parameters[param.name] || ''}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          placeholder={param.description}
                        />
                      </div>
                    ))}
                    {[...endpoint.parameters.path, ...endpoint.parameters.query].length === 0 && (
                      <p className="text-sm text-muted-foreground">No parameters required</p>
                    )}
                  </TabsContent>

                  <TabsContent value="headers" className="space-y-4">
                    {Object.entries(headers).map(([name, value]) => (
                      <div key={name} className="flex gap-2">
                        <Input
                          value={name}
                          readOnly
                          className="w-1/3"
                        />
                        <Input
                          value={value}
                          onChange={(e) => handleHeaderChange(name, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeHeader(name)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addCustomHeader}>
                      Add Header
                    </Button>
                  </TabsContent>

                  <TabsContent value="body" className="space-y-4">
                    {['POST', 'PUT', 'PATCH'].includes(endpoint.method) ? (
                      <div className="space-y-2">
                        <Label>Request Body (JSON)</Label>
                        <Textarea
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          placeholder="Enter JSON request body..."
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No request body for {endpoint.method} requests
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="auth" className="space-y-4">
                    {authentication?.enabled ? (
                      <>
                        <div className="space-y-2">
                          <Label>Authentication Type</Label>
                          <Select value={authType} onValueChange={(value: any) => setAuthType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {authentication.types.includes('bearer') && (
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                              )}
                              {authentication.types.includes('apiKey') && (
                                <SelectItem value="apiKey">API Key</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {authType !== 'none' && (
                          <div className="space-y-2">
                            <Label>
                              {authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                            </Label>
                            <Input
                              type="password"
                              value={authToken}
                              onChange={(e) => setAuthToken(e.target.value)}
                              placeholder={`Enter your ${authType === 'bearer' ? 'JWT token' : 'API key'}...`}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Authentication not required for this endpoint
                      </p>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="save-history"
                      checked={saveToHistory}
                      onCheckedChange={setSaveToHistory}
                    />
                    <Label htmlFor="save-history" className="text-sm">
                      Save to history
                    </Label>
                  </div>
                  
                  <Button onClick={executeTest} disabled={loading}>
                    {loading ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4" />
                    Test History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex items-center gap-2">
                          {item.success ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircleIcon className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {item.response.status} - {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.response.duration}ms
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Response */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Response
                  {response && (
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(response.status)}>
                        {response.status} {response.statusText}
                      </Badge>
                      <Badge variant="outline">
                        {response.duration}ms
                      </Badge>
                      <Button variant="outline" size="sm" onClick={copyResponse}>
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response ? (
                  <Tabs defaultValue="body" className="w-full">
                    <TabsList>
                      <TabsTrigger value="body">Response Body</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="body">
                      <div className="bg-muted rounded p-4">
                        {response.error ? (
                          <div className="text-red-600">
                            <p className="font-medium">Error:</p>
                            <p className="text-sm">{response.error}</p>
                          </div>
                        ) : (
                          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                            {typeof response.data === 'string' 
                              ? response.data 
                              : JSON.stringify(response.data, null, 2)
                            }
                          </pre>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="headers">
                      <div className="space-y-2">
                        {Object.entries(response.headers).map(([name, value]) => (
                          <div key={name} className="flex gap-2 text-sm">
                            <span className="font-medium min-w-32">{name}:</span>
                            <span className="text-muted-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PlayIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Click "Send Request" to test this endpoint</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}