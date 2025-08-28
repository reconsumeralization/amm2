'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, Code } from '@/lib/icon-mapping'
import { APIEndpoint, SDKGenerationConfig, CodeGenerationTemplate } from '@/types/api-documentation'
import { cn } from '@/lib/utils'

interface CodeGeneratorProps {
  endpoint: APIEndpoint
  sdkConfig?: SDKGenerationConfig
  onClose: () => void
}

export function CodeGenerator({ endpoint, sdkConfig, onClose }: CodeGeneratorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript')
  const [generatedCode, setGeneratedCode] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const availableLanguages = sdkConfig?.languages || ['typescript', 'javascript', 'python', 'curl']

  useEffect(() => {
    generateCodeForAllLanguages()
  }, [endpoint])

  const generateCodeForAllLanguages = async () => {
    setLoading(true)
    const codeMap: Record<string, string> = {}

    for (const language of availableLanguages) {
      try {
        codeMap[language] = await generateCodeForLanguage(language)
      } catch (error) {
        console.error(`Failed to generate ${language} code:`, error)
        codeMap[language] = `// Error generating ${language} code`
      }
    }

    setGeneratedCode(codeMap)
    setLoading(false)
  }

  const generateCodeForLanguage = async (language: string): Promise<string> => {
    const baseUrl = sdkConfig?.baseUrl || 'https://api.modernmen.com'
    const includeAuth = sdkConfig?.includeAuth !== false

    switch (language) {
      case 'typescript':
        return generateTypeScriptCode(endpoint, baseUrl, includeAuth)
      case 'javascript':
        return generateJavaScriptCode(endpoint, baseUrl, includeAuth)
      case 'python':
        return generatePythonCode(endpoint, baseUrl, includeAuth)
      case 'curl':
        return generateCurlCode(endpoint, baseUrl, includeAuth)
      case 'php':
        return generatePHPCode(endpoint, baseUrl, includeAuth)
      case 'java':
        return generateJavaCode(endpoint, baseUrl, includeAuth)
      default:
        return `// ${language} code generation not implemented`
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const downloadCode = (language: string, code: string) => {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      curl: 'sh',
      php: 'php',
      java: 'java'
    }

    const extension = extensions[language] || 'txt'
    const filename = `${endpoint.operationId}.${extension}`
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      typescript: '🔷',
      javascript: '🟨',
      python: '🐍',
      curl: '🌐',
      php: '🐘',
      java: '☕'
    }
    return icons[language] || '📄'
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CodeIcon className="w-5 h-5" />
            Code Generation
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
            Generate client code for this API endpoint in multiple programming languages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    <span className="flex items-center gap-2">
                      <span>{getLanguageIcon(lang)}</span>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generatedCode[selectedLanguage] || '')}
                disabled={!generatedCode[selectedLanguage]}
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadCode(selectedLanguage, generatedCode[selectedLanguage] || '')}
                disabled={!generatedCode[selectedLanguage]}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{getLanguageIcon(selectedLanguage)}</span>
                {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Generating code...</div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{generatedCode[selectedLanguage] || 'No code generated'}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SDK Information */}
          {sdkConfig && (
            <Card>
              <CardHeader>
                <CardTitle>SDK Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Base URL:</span>
                    <code className="ml-2 bg-muted px-2 py-1 rounded">{sdkConfig.baseUrl}</code>
                  </div>
                  <div>
                    <span className="font-medium">Authentication:</span>
                    <Badge variant={sdkConfig.includeAuth ? 'default' : 'secondary'} className="ml-2">
                      {sdkConfig.includeAuth ? 'Included' : 'Not included'}
                    </Badge>
                  </div>
                  {sdkConfig.packageName && (
                    <div>
                      <span className="font-medium">Package Name:</span>
                      <code className="ml-2 bg-muted px-2 py-1 rounded">{sdkConfig.packageName}</code>
                    </div>
                  )}
                  {sdkConfig.version && (
                    <div>
                      <span className="font-medium">Version:</span>
                      <code className="ml-2 bg-muted px-2 py-1 rounded">{sdkConfig.version}</code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {getUsageInstructions(selectedLanguage, endpoint)}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Code generation functions
function generateTypeScriptCode(endpoint: APIEndpoint, baseUrl: string, includeAuth: boolean): string {
  const pathParams = endpoint.parameters.path.map(p => `${p.name}: ${getTypeScriptType(p.type)}`).join(', ')
  const queryParams = endpoint.parameters.query.map(p => `${p.name}?: ${getTypeScriptType(p.type)}`).join(', ')
  
  const hasParams = pathParams || queryParams
  const paramsInterface = hasParams ? `
interface ${endpoint.operationId}Params {
  ${pathParams ? pathParams : ''}
  ${pathParams && queryParams ? ', ' : ''}
  ${queryParams ? queryParams : ''}
}` : ''

  const requestBodyType = endpoint.requestBody ? `
interface ${endpoint.operationId}Request {
  // Define your request body structure here
  [key: string]: any
}` : ''

  const authHeader = includeAuth ? `
    'Authorization': \`Bearer \${token}\`,` : ''

  let url = `\`${baseUrl}${endpoint.path}\``
  endpoint.parameters.path.forEach(param => {
    url = url.replace(`{${param.name}}`, `\${params.${param.name}}`)
  })

  const queryStringCode = endpoint.parameters.query.length > 0 ? `
  const queryParams = new URLrchParams()
  ${endpoint.parameters.query.map(p => `
  if (params.${p.name} !== undefined) {
    queryParams.append('${p.name}', String(params.${p.name}))
  }`).join('')}
  
  const queryString = queryParams.toString()
  const url = ${url} + (queryString ? \`?\${queryString}\` : '')` : `
  const url = ${url}`

  return `${paramsInterface}${requestBodyType}

export async function ${endpoint.operationId}(${hasParams ? `params: ${endpoint.operationId}Params` : ''}${endpoint.requestBody ? `${hasParams ? ', ' : ''}data: ${endpoint.operationId}Request` : ''}${includeAuth ? `${hasParams || endpoint.requestBody ? ', ' : ''}token: string` : ''}): Promise<any> {
  ${queryStringCode}
  
  const response = await fetch(url, {
    method: '${endpoint.method}',
    headers: {
      'Content-Type': 'application/json',${authHeader}
    },${endpoint.requestBody ? `
    body: JSON.stringify(data),` : ''}
  })
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`)
  }
  
  return response.json()
}

// Usage example:
// const result = await ${endpoint.operationId}(${hasParams ? `{ ${endpoint.parameters.path.concat(endpoint.parameters.query).map(p => `${p.name}: ${getExampleValue(p.type, p.example)}`).join(', ')} }` : ''}${endpoint.requestBody ? `${hasParams ? ', ' : ''}{ /* your request data */ }` : ''}${includeAuth ? `${hasParams || endpoint.requestBody ? ', ' : ''}'your-jwt-token'` : ''})
`
}

function generateJavaScriptCode(endpoint: APIEndpoint, baseUrl: string, includeAuth: boolean): string {
  let url = `\`${baseUrl}${endpoint.path}\``
  endpoint.parameters.path.forEach(param => {
    url = url.replace(`{${param.name}}`, `\${${param.name}}`)
  })

  const pathParams = endpoint.parameters.path.map(p => p.name).join(', ')
  const queryParams = endpoint.parameters.query.length > 0 ? `
  const queryParams = new URLrchParams()
  ${endpoint.parameters.query.map(p => `
  if (${p.name} !== undefined) {
    queryParams.append('${p.name}', String(${p.name}))
  }`).join('')}
  
  const queryString = queryParams.toString()
  const url = ${url} + (queryString ? \`?\${queryString}\` : '')` : `
  const url = ${url}`

  const authHeader = includeAuth ? `
    'Authorization': \`Bearer \${token}\`,` : ''

  const functionParams = [
    ...endpoint.parameters.path.map(p => p.name),
    ...endpoint.parameters.query.map(p => p.name),
    ...(endpoint.requestBody ? ['data'] : []),
    ...(includeAuth ? ['token'] : [])
  ].join(', ')

  return `async function ${endpoint.operationId}(${functionParams}) {
  ${queryParams}
  
  const response = await fetch(url, {
    method: '${endpoint.method}',
    headers: {
      'Content-Type': 'application/json',${authHeader}
    },${endpoint.requestBody ? `
    body: JSON.stringify(data),` : ''}
  })
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`)
  }
  
  return response.json()
}

// Usage example:
// const result = await ${endpoint.operationId}(${endpoint.parameters.path.concat(endpoint.parameters.query).map(p => getExampleValue(p.type, p.example)).join(', ')}${endpoint.requestBody ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 ? ', ' : ''}{ /* your request data */ }` : ''}${includeAuth ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 || endpoint.requestBody ? ', ' : ''}'your-jwt-token'` : ''})
`
}

function generatePythonCode(endpoint: APIEndpoint, baseUrl: string, includeAuth: boolean): string {
  const pathParams = endpoint.parameters.path.map(p => p.name).join(', ')
  const queryParams = endpoint.parameters.query.map(p => p.name).join(', ')
  
  let url = `f"${baseUrl}${endpoint.path}"`
  endpoint.parameters.path.forEach(param => {
    url = url.replace(`{${param.name}}`, `{${param.name}}`)
  })

  const functionParams = [
    ...endpoint.parameters.path.map(p => p.name),
    ...endpoint.parameters.query.map(p => `${p.name}=None`),
    ...(endpoint.requestBody ? ['data=None'] : []),
    ...(includeAuth ? ['token=None'] : [])
  ].join(', ')

  const queryParamsCode = endpoint.parameters.query.length > 0 ? `
    params = {}
    ${endpoint.parameters.query.map(p => `
    if ${p.name} is not None:
        params['${p.name}'] = ${p.name}`).join('')}` : `
    params = None`

  const authHeader = includeAuth ? `
    if token:
        headers['Authorization'] = f'Bearer {token}'` : ''

  return `import requests
import json

def ${endpoint.operationId}(${functionParams}):
    """
    ${endpoint.description}
    """
    url = ${url}
    ${queryParamsCode}
    
    headers = {
        'Content-Type': 'application/json'
    }${authHeader}
    
    ${endpoint.requestBody ? `
    response = requests.${endpoint.method.toLowerCase()}(
        url, 
        headers=headers, 
        params=params,
        json=data
    )` : `
    response = requests.${endpoint.method.toLowerCase()}(
        url, 
        headers=headers, 
        params=params
    )`}
    
    response.raise_for_status()
    return response.json()

# Usage example:
# result = ${endpoint.operationId}(${endpoint.parameters.path.concat(endpoint.parameters.query).map(p => `${p.name}=${getExampleValue(p.type, p.example)}`).join(', ')}${endpoint.requestBody ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 ? ', ' : ''}data={'key': 'value'}` : ''}${includeAuth ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 || endpoint.requestBody ? ', ' : ''}token='your-jwt-token'` : ''})
`
}

function generateCurlCode(endpoint: APIEndpoint, baseUrl: string, includeAuth: boolean): string {
  let url = `${baseUrl}${endpoint.path}`
  
  // Replace path parameters with example values
  endpoint.parameters.path.forEach(param => {
    const exampleValue = param.example || 'example-value'
    url = url.replace(`{${param.name}}`, exampleValue)
  })

  // Add query parameters
  if (endpoint.parameters.query.length > 0) {
    const queryParams = endpoint.parameters.query
      .map(p => `${p.name}=${p.example || 'example-value'}`)
      .join('&')
    url += `?${queryParams}`
  }

  const authHeader = includeAuth ? ` \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"` : ''

  const requestBody = endpoint.requestBody ? ` \\
  -d '{
    "key": "value"
  }'` : ''

  return `curl -X ${endpoint.method} \\
  "${url}" \\
  -H "Content-Type: application/json"${authHeader}${requestBody}

# Replace YOUR_JWT_TOKEN with your actual JWT token
# Replace example values with actual parameter values
# Replace request body with actual data structure
`
}

function generatePHPCode(endpoint: APIEndpoint, baseUrl: string, includeAuth: boolean): string {
  let url = `"${baseUrl}${endpoint.path}"`
  endpoint.parameters.path.forEach(param => {
    url = url.replace(`{${param.name}}`, `" . $${param.name} . "`)
  })

  const functionParams = [
    ...endpoint.parameters.path.map(p => `$${p.name}`),
    ...endpoint.parameters.query.map(p => `$${p.name} = null`),
    ...(endpoint.requestBody ? ['$data = null'] : []),
    ...(includeAuth ? ['$token = null'] : [])
  ].join(', ')

  const queryParamsCode = endpoint.parameters.query.length > 0 ? `
    $queryParams = [];
    ${endpoint.parameters.query.map(p => `
    if ($${p.name} !== null) {
        $queryParams['${p.name}'] = $${p.name};
    }`).join('')}
    
    if (!empty($queryParams)) {
        $url .= '?' . http_build_query($queryParams);
    }` : ''

  const authHeader = includeAuth ? `
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }` : ''

  return `<?php

function ${endpoint.operationId}(${functionParams}) {
    $url = ${url};
    ${queryParamsCode}
    
    $headers = [
        'Content-Type: application/json'
    ];${authHeader}
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${endpoint.method}');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    ${endpoint.requestBody ? `
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }` : ''}
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 400) {
        throw new Exception('HTTP error: ' . $httpCode);
    }
    
    return json_decode($response, true);
}

// Usage example:
// $result = ${endpoint.operationId}(${endpoint.parameters.path.concat(endpoint.parameters.query).map(p => `${getExampleValue(p.type, p.example)}`).join(', ')}${endpoint.requestBody ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 ? ', ' : ''}['key' => 'value']` : ''}${includeAuth ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 || endpoint.requestBody ? ', ' : ''}'your-jwt-token'` : ''});

?>
`
}

function generateJavaCode(endpoint: APIEndpoint, baseUrl: string, includeAuth: boolean): string {
  const className = endpoint.operationId.charAt(0).toUpperCase() + endpoint.operationId.slice(1)
  
  return `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ${className}Client {
    private static final String BASE_URL = "${baseUrl}";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public ${className}Client() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public Object ${endpoint.operationId}(${endpoint.parameters.path.map(p => `String ${p.name}`).join(', ')}${endpoint.parameters.query.length > 0 ? `${endpoint.parameters.path.length > 0 ? ', ' : ''}${endpoint.parameters.query.map(p => `String ${p.name}`).join(', ')}` : ''}${endpoint.requestBody ? `${endpoint.parameters.path.length > 0 || endpoint.parameters.query.length > 0 ? ', ' : ''}Object data` : ''}${includeAuth ? `${endpoint.parameters.path.length > 0 || endpoint.parameters.query.length > 0 || endpoint.requestBody ? ', ' : ''}String token` : ''}) throws Exception {
        String url = BASE_URL + "${endpoint.path}";
        ${endpoint.parameters.path.map(param => `
        url = url.replace("{${param.name}}", ${param.name});`).join('')}
        
        ${endpoint.parameters.query.length > 0 ? `
        StringBuilder queryParams = new StringBuilder();
        ${endpoint.parameters.query.map(p => `
        if (${p.name} != null) {
            if (queryParams.length() > 0) queryParams.append("&");
            queryParams.append("${p.name}=").append(${p.name});
        }`).join('')}
        
        if (queryParams.length() > 0) {
            url += "?" + queryParams.toString();
        }` : ''}
        
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json");
            
        ${includeAuth ? `
        if (token != null) {
            requestBuilder.header("Authorization", "Bearer " + token);
        }` : ''}
        
        ${endpoint.requestBody ? `
        if (data != null) {
            String jsonBody = objectMapper.writeValueAsString(data);
            requestBuilder.${endpoint.method.toLowerCase()}(HttpRequest.BodyPublishers.ofString(jsonBody));
        } else {
            requestBuilder.${endpoint.method.toLowerCase()}(HttpRequest.BodyPublishers.noBody());
        }` : `
        requestBuilder.${endpoint.method.toLowerCase()}(HttpRequest.BodyPublishers.noBody());`}
        
        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 400) {
            throw new RuntimeException("HTTP error: " + response.statusCode());
        }
        
        return objectMapper.readValue(response.body(), Object.class);
    }
}

// Usage example:
// ${className}Client client = new ${className}Client();
// Object result = client.${endpoint.operationId}(${endpoint.parameters.path.concat(endpoint.parameters.query).map(p => `"${getExampleValue(p.type, p.example)}"`).join(', ')}${endpoint.requestBody ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 ? ', ' : ''}dataObject` : ''}${includeAuth ? `${endpoint.parameters.path.concat(endpoint.parameters.query).length > 0 || endpoint.requestBody ? ', ' : ''}"your-jwt-token"` : ''});
`
}

// Helper functions
function getTypeScriptType(type: string): string {
  const typeMap: Record<string, string> = {
    'string': 'string',
    'integer': 'number',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'any[]',
    'object': 'any'
  }
  return typeMap[type] || 'any'
}

function getExampleValue(type: string, example?: any): string {
  if (example !== undefined) {
    return typeof example === 'string' ? `"${example}"` : String(example)
  }
  
  const examples: Record<string, string> = {
    'string': '"example"',
    'integer': '123',
    'number': '123.45',
    'boolean': 'true',
    'array': '[]',
    'object': '{}'
  }
  return examples[type] || '"example"'
}

function getUsageInstructions(language: string, endpoint: APIEndpoint): React.ReactNode {
  const instructions: Record<string, React.ReactElement> = {
    typescript: (
      <div>
        <p><strong>Installation:</strong></p>
        <code className="block bg-muted p-2 rounded mb-2">npm install axios</code>
        <p><strong>Usage:</strong></p>
        <p>Copy the generated TypeScript function into your project and call it with the required parameters.</p>
      </div>
    ),
    javascript: (
      <div>
        <p><strong>Usage:</strong></p>
        <p>Copy the generated JavaScript function into your project. This code uses the native fetch API available in modern browsers and Node.js.</p>
      </div>
    ),
    python: (
      <div>
        <p><strong>Installation:</strong></p>
        <code className="block bg-muted p-2 rounded mb-2">pip install requests</code>
        <p><strong>Usage:</strong></p>
        <p>Copy the generated Python function into your project and call it with the required parameters.</p>
      </div>
    ),
    curl: (
      <div>
        <p><strong>Usage:</strong></p>
        <p>Copy the generated curl command and run it in your terminal. Replace the example values with actual data.</p>
        <p><strong>Note:</strong> Make sure to replace YOUR_JWT_TOKEN with your actual authentication token.</p>
      </div>
    ),
    php: (
      <div>
        <p><strong>Requirements:</strong></p>
        <p>PHP with cURL extension enabled</p>
        <p><strong>Usage:</strong></p>
        <p>Copy the generated PHP function into your project and call it with the required parameters.</p>
      </div>
    ),
    java: (
      <div>
        <p><strong>Requirements:</strong></p>
        <p>Java 11+ and Jackson library for JSON processing</p>
        <p><strong>Maven dependency:</strong></p>
        <code className="block bg-muted p-2 rounded mb-2">
          {`<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.2</version>
</dependency>`}
        </code>
        <p><strong>Usage:</strong></p>
        <p>Copy the generated Java class into your project and use it to make API calls.</p>
      </div>
    )
  }

  return instructions[language] || <p>No specific instructions available for {language}</p>
}