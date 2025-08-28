// API Documentation specific types extending the base documentation types

import { 
  HTTPMethod, 
  Parameter, 
  ContentType, 
  Example, 
  SecurityRequirement,
  APIDocumentationModel 
} from './documentation'

export interface APIEndpoint {
  path: string
  method: HTTPMethod
  summary: string
  description: string
  operationId: string
  tags: string[]
  parameters: {
    path: Parameter[]
    query: Parameter[]
    header: Parameter[]
    cookie: Parameter[]
  }
  requestBody?: {
    required: boolean
    content: ContentType[]
    examples: Example[]
  }
  responses: {
    [statusCode: string]: {
      description?: string
      content?: ContentType[]
      examples?: Example[]
      $ref?: string
    } | {
      $ref: string
    }
  }
  security: SecurityRequirement[]
  deprecated?: boolean
  externalDocs?: {
    description: string
    url: string
  }
}

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    description: string
    version: string
    contact?: {
      name: string
      email: string
      url: string
    }
    license?: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: {
    [path: string]: {
      [method: string]: APIEndpoint
    }
  }
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, SecurityRequirement>
    parameters: Record<string, Parameter>
    responses: Record<string, any>
    examples: Record<string, Example>
  }
}

export interface SDKGenerationConfig {
  languages: readonly ("typescript" | "python" | "curl" | "javascript" | "php" | "java")[]
  includeAuth: boolean
  baseUrl: string
  packageName?: string
  version?: string
  outputPath?: string
}

export interface APITestRequest {
  endpoint: APIEndpoint
  parameters: Record<string, any>
  headers: Record<string, string>
  body?: any
  authentication?: {
    type: 'bearer' | 'apiKey' | 'basic'
    token?: string
    apiKey?: string
    username?: string
    password?: string
  }
}

export interface APITestResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  duration: number
  timestamp: Date
  error?: string
}

export interface APITestHistory {
  id: string
  request: APITestRequest
  response: APITestResponse
  timestamp: Date
  success: boolean
}

export interface CodeGenerationTemplate {
  language: string
  template: string
  dependencies: string[]
  instructions: string
}

export interface APIDocumentationSection {
  articles: any
  id: string
  title: string
  description: string
  endpoints: APIEndpoint[]
  schemas: Record<string, any>
  examples: Example[]
  authentication: SecurityRequirement[]
}

export interface APIValidationResult {
  isValid: boolean
  errors: Array<{
    path: string
    message: string
    severity: 'error' | 'warning'
  }>
  warnings: Array<{
    path: string
    message: string
    suggestion?: string
  }>
}

export interface APIDocumentationConfig {
  baseUrl: string
  version: string
  title: string
  description: string
  authentication: {
    enabled: boolean
    types: ('bearer' | 'apiKey' | 'oauth2')[]
    testCredentials?: {
      bearer?: string
      apiKey?: string
    }
  }
  testing: {
    enabled: boolean
    timeout: number
    retries: number
    mockResponses: boolean
  }
  generation: {
    openapi: boolean
    postman: boolean
    sdk: SDKGenerationConfig
  }
}