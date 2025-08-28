// API Documentation extraction utilities for Next.js API routes

import { APIEndpoint, OpenAPISpec, APIDocumentationSection } from '@/types/api-documentation'
import { HTTPMethod } from '@/types/documentation'
import fs from 'fs'
import path from 'path'

interface RouteAnalysis {
  path: string
  methods: HTTPMethod[]
  exports: string[]
  imports: string[]
  comments: string[]
  types: string[]
}

export class APIDocumentationExtractor {
  private apiRoutesPath: string
  private extractedEndpoints: APIEndpoint[] = []

  constructor(apiRoutesPath: string = 'src/app/api') {
    this.apiRoutesPath = apiRoutesPath
  }

  /**
   * Extract API documentation from Next.js API routes
   */
  async extractAPIDocumentation(): Promise<APIDocumentationSection[]> {
    const routeFiles = await this.findAPIRoutes()
    const sections: Record<string, APIDocumentationSection> = {}

    for (const routeFile of routeFiles) {
      try {
        const analysis = await this.analyzeRouteFile(routeFile)
        const endpoints = this.extractEndpointsFromAnalysis(analysis)

        for (const endpoint of endpoints) {
          const sectionId = this.getSectionId(endpoint.path)
          
          if (!sections[sectionId]) {
            sections[sectionId] = {
              id: sectionId,
              title: this.formatSectionTitle(sectionId),
              description: `API endpoints for ${sectionId}`,
              endpoints: [],
              schemas: {},
              examples: [],
              authentication: []
            }
          }

          sections[sectionId].endpoints.push(endpoint)
        }
      } catch (error) {
        console.warn(`Failed to analyze route file ${routeFile}:`, error)
      }
    }

    return Object.values(sections)
  }

  /**
   * Generate OpenAPI specification from extracted endpoints
   */
  generateOpenAPISpec(sections: APIDocumentationSection[]): OpenAPISpec {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Modern Men Hair Salon API',
        description: 'API documentation for the Modern Men Hair Salon management system',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@modernmen.com',
          url: 'https://modernmen.com/support'
        }
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
          description: 'Development server'
        },
        {
          url: 'https://modernmen.vercel.app/api',
          description: 'Production server'
        }
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          apiKeyAuth: {
            type: 'apiKey',
            scheme: 'apiKey'
          }
        },
        parameters: {},
        responses: {
          UnauthorizedError: {
            description: 'Authentication information is missing or invalid',
            content: {
              'application/json': {
                examples: [{
                  name: 'Unauthorized',
                  value: { error: 'Unauthorized' }
                }]
              }
            }
          },
          NotFoundError: {
            description: 'The specified resource was not found',
            content: {
              'application/json': {
                examples: [{
                  name: 'Not Found',
                  value: { error: 'Resource not found' }
                }]
              }
            }
          }
        },
        examples: {}
      }
    }

    // Build paths from sections
    for (const section of sections) {
      for (const endpoint of section.endpoints) {
        if (!spec.paths[endpoint.path]) {
          spec.paths[endpoint.path] = {}
        }
        
        spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
          ...endpoint,
          responses: {
            ...endpoint.responses,
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' }
          }
        }
      }
    }

    return spec
  }

  /**
   * Find all API route files in the Next.js app directory
   */
  private async findAPIRoutes(): Promise<string[]> {
    try {
      const files: string[] = []
      this.walkDirectory(this.apiRoutesPath, files)
      return files.filter(file => file.endsWith('route.ts') || file.endsWith('route.js'))
    } catch (error) {
      console.error('Error finding API routes:', error)
      return []
    }
  }

  /**
   * Recursively walk directory to find route files
   */
  private walkDirectory(dir: string, files: string[]): void {
    try {
      if (!fs.existsSync(dir)) {
        return
      }

      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          // Skip node_modules and .next directories
          if (item !== 'node_modules' && item !== '.next') {
            this.walkDirectory(fullPath, files)
          }
        } else if (stat.isFile()) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.warn(`Error walking directory ${dir}:`, error)
    }
  }

  /**
   * Analyze a single route file to extract API information
   */
  private async analyzeRouteFile(filePath: string): Promise<RouteAnalysis> {
    const content = fs.readFileSync(filePath, 'utf-8')
    const relativePath = this.getAPIPath(filePath)

    // Extract HTTP methods from exports
    const methods = this.extractHTTPMethods(content)
    
    // Extract JSDoc comments
    const comments = this.extractJSDocComments(content)
    
    // Extract imports for type analysis
    const imports = this.extractImports(content)
    
    // Extract TypeScript types
    const types = this.extractTypes(content)

    return {
      path: relativePath,
      methods,
      exports: methods,
      imports,
      comments,
      types
    }
  }

  /**
   * Convert route file analysis to API endpoints
   */
  private extractEndpointsFromAnalysis(analysis: RouteAnalysis): APIEndpoint[] {
    const endpoints: APIEndpoint[] = []

    for (const method of analysis.methods) {
      const endpoint: APIEndpoint = {
        path: analysis.path,
        method,
        summary: this.generateSummary(analysis.path, method),
        description: this.extractDescription(analysis.comments, method),
        operationId: this.generateOperationId(analysis.path, method),
        tags: this.generateTags(analysis.path),
        parameters: this.extractParameters(analysis),
        responses: this.generateResponses(method),
        security: this.extractSecurity(analysis)
      }

      // Add request body for POST, PUT, PATCH methods
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        endpoint.requestBody = this.generateRequestBody(analysis, method)
      }

      endpoints.push(endpoint)
    }

    return endpoints
  }

  /**
   * Extract HTTP methods from route file content
   */
  private extractHTTPMethods(content: string): HTTPMethod[] {
    const methods: HTTPMethod[] = []
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    
    for (const method of httpMethods) {
      const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'i')
      if (regex.test(content)) {
        methods.push(method as HTTPMethod)
      }
    }

    return methods
  }

  /**
   * Extract JSDoc comments from content
   */
  private extractJSDocComments(content: string): string[] {
    const comments: string[] = []
    const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g
    let match

    while ((match = jsdocRegex.exec(content)) !== null) {
      comments.push(match[1].trim())
    }

    return comments
  }

  /**
   * Extract import statements
   */
  private extractImports(content: string): string[] {
    const imports: string[] = []
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    return imports
  }

  /**
   * Extract TypeScript interface definitions
   */
  private extractTypes(content: string): string[] {
    const types: string[] = []
    const interfaceRegex = /interface\s+(\w+)/g
    const typeRegex = /type\s+(\w+)/g
    let match

    while ((match = interfaceRegex.exec(content)) !== null) {
      types.push(match[1])
    }

    while ((match = typeRegex.exec(content)) !== null) {
      types.push(match[1])
    }

    return types
  }

  /**
   * Convert file path to API path
   */
  private getAPIPath(filePath: string): string {
    const relativePath = path.relative(this.apiRoutesPath, filePath)
    const pathWithoutFile = path.dirname(relativePath)
    const apiPath = pathWithoutFile === '.' ? '' : pathWithoutFile
    return '/api/' + apiPath.replace(/\\/g, '/')
  }

  /**
   * Get section ID from API path
   */
  private getSectionId(apiPath: string): string {
    const parts = apiPath.split('/').filter(Boolean)
    return parts[1] || 'general' // Skip 'api' part
  }

  /**
   * Format section title
   */
  private formatSectionTitle(sectionId: string): string {
    return sectionId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Generate operation summary
   */
  private generateSummary(path: string, method: HTTPMethod): string {
    const resource = this.getSectionId(path)
    const action = this.getActionFromMethod(method)
    return `${action} ${resource}`
  }

  /**
   * Get action verb from HTTP method
   */
  private getActionFromMethod(method: HTTPMethod): string {
    const actions = {
      GET: 'Get',
      POST: 'Create',
      PUT: 'Update',
      PATCH: 'Update',
      DELETE: 'Delete'
    }
    return actions[method] || method
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(path: string, method: HTTPMethod): string {
    const resource = this.getSectionId(path)
    const action = this.getActionFromMethod(method).toLowerCase()
    return `${action}${resource.charAt(0).toUpperCase()}${resource.slice(1)}`
  }

  /**
   * Generate tags from path
   */
  private generateTags(path: string): string[] {
    const sectionId = this.getSectionId(path)
    return [this.formatSectionTitle(sectionId)]
  }

  /**
   * Extract description from comments
   */
  private extractDescription(comments: string[], method: HTTPMethod): string {
    // Look for method-specific description in comments
    for (const comment of comments) {
      if (comment.toLowerCase().includes(method.toLowerCase())) {
        return comment.replace(/\*/g, '').trim()
      }
    }
    
    // Return first comment if no method-specific found
    if (comments.length > 0) {
      return comments[0].replace(/\*/g, '').trim()
    }

    return `${this.getActionFromMethod(method)} operation`
  }

  /**
   * Extract parameters from analysis
   */
  private extractParameters(analysis: RouteAnalysis): APIEndpoint['parameters'] {
    return {
      path: [],
      query: this.extractQueryParameters(analysis),
      header: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token for authentication',
          example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      ],
      cookie: []
    }
  }

  /**
   * Extract query parameters from route analysis
   */
  private extractQueryParameters(analysis: RouteAnalysis): any[] {
    const commonParams = [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of items to return',
        example: 20
      },
      {
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number for pagination',
        example: 1
      },
      {
        name: 'rch',
        type: 'string',
        required: false,
        description: 'rch query string',
        example: 'john'
      }
    ]

    // Return common parameters for GET requests
    if (analysis.methods.includes('GET')) {
      return commonParams
    }

    return []
  }

  /**
   * Generate request body schema
   */
  private generateRequestBody(analysis: RouteAnalysis, method: HTTPMethod): any {
    const resource = this.getSectionId(analysis.path)
    
    return {
      required: true,
      content: [
        {
          mediaType: 'application/json',
          schema: {
            type: 'object',
            properties: this.generateSchemaProperties(resource, method)
          },
          examples: [
            {
              name: `${method} ${resource}`,
              value: this.generateExampleRequestBody(resource, method)
            }
          ]
        }
      ],
      examples: []
    }
  }

  /**
   * Generate schema properties based on resource
   */
  private generateSchemaProperties(resource: string, method: HTTPMethod): any {
    const commonProperties = {
      users: {
        name: { type: 'string', description: 'User full name' },
        email: { type: 'string', format: 'email', description: 'User email address' },
        role: { type: 'string', enum: ['admin', 'manager', 'stylist', 'customer'], description: 'User role' },
        phone: { type: 'string', description: 'Phone number' }
      },
      employees: {
        name: { type: 'string', description: 'Employee name' },
        email: { type: 'string', format: 'email', description: 'Employee email' },
        bio: { type: 'string', description: 'Employee biography' },
        specializations: { type: 'array', items: { type: 'string' }, description: 'Areas of specialization' }
      }
    }

    return (commonProperties as any)[resource] || {
      name: { type: 'string', description: 'Name' },
      description: { type: 'string', description: 'Description' }
    }
  }

  /**
   * Generate example request body
   */
  private generateExampleRequestBody(resource: string, method: HTTPMethod): any {
    const examples = {
      users: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'stylist',
        phone: '+1234567890'
      },
      employees: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        bio: 'Experienced hair stylist specializing in modern cuts',
        specializations: ['Hair Cutting', 'Hair Coloring', 'Styling']
      }
    }

    return examples[resource as keyof typeof examples] || { name: 'Example Name' }
  }

  /**
   * Generate response schemas
   */
  private generateResponses(method: HTTPMethod): any {
    const responses: any = {
      '500': {
        description: 'Internal server error',
        content: [
          {
            mediaType: 'application/json',
            examples: [
              {
                name: 'Server Error',
                value: { error: 'Internal server error' }
              }
            ]
          }
        ],
        examples: []
      }
    }

    if (method === 'GET') {
      responses['200'] = {
        description: 'Successful response',
        content: [
          {
            mediaType: 'application/json',
            examples: [
              {
                name: 'Success',
                value: { data: [], total: 0, page: 1 }
              }
            ]
          }
        ],
        examples: []
      }
    }

    if (method === 'POST') {
      responses['201'] = {
        description: 'Resource created successfully',
        content: [
          {
            mediaType: 'application/json',
            examples: [
              {
                name: 'Created',
                value: { message: 'Resource created successfully', id: '123' }
              }
            ]
          }
        ],
        examples: []
      }
    }

    return responses
  }

  /**
   * Extract security requirements
   */
  private extractSecurity(analysis: RouteAnalysis): any[] {
    // Most endpoints require authentication
    return [
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    ]
  }
}

// Export singleton instance
export const apiDocExtractor = new APIDocumentationExtractor()