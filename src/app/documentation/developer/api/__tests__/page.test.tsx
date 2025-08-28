import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the APIDocumentation component to avoid complex dependencies
jest.mock('@/components/documentation/APIDocumentation', () => ({
  APIDocumentation: ({ sections }: { sections: any[] }) => (
    <div data-testid="api-documentation">
      <h1>API Documentation</h1>
      <div data-testid="sections-count">{sections.length} sections</div>
      {sections.map((section, index) => (
        <div key={index} data-testid={`section-${section.id}`}>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <div data-testid={`endpoints-count-${section.id}`}>
            {section.endpoints.length} endpoints
          </div>
        </div>
      ))}
    </div>
  )
}))

// Mock the API documentation extractor
jest.mock('@/lib/api-documentation-extractor', () => ({
  apiDocExtractor: {
    extractAPIDocumentation: jest.fn().mockResolvedValue([])
  }
}))

// Mock the sample data
jest.mock('@/lib/sample-api-docs', () => ({
  sampleAPIDocumentation: [
    {
      id: 'test-section',
      title: 'Test Section',
      description: 'Test description',
      endpoints: [
        {
          path: '/api/test',
          method: 'GET',
          summary: 'Test endpoint',
          description: 'Test endpoint description',
          operationId: 'testEndpoint',
          tags: ['Test'],
          parameters: { path: [], query: [], header: [], cookie: [] },
          responses: {},
          security: []
        }
      ],
      schemas: {},
      examples: [],
      authentication: []
    }
  ]
}))

// Import the page component after mocking
import APIDocumentationPage from '../page'

describe('API Documentation Page', () => {
  it('renders API documentation page with sample data', async () => {
    const PageComponent = await APIDocumentationPage()
    render(PageComponent)
    
    expect(screen.getAllByText('API Documentation')).toHaveLength(2) // One in page header, one in mocked component
    expect(screen.getByText('Sample API Documentation')).toBeInTheDocument()
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('displays sample data notice', async () => {
    const PageComponent = await APIDocumentationPage()
    render(PageComponent)
    
    expect(screen.getByText('Sample API Documentation')).toBeInTheDocument()
    expect(screen.getByText(/This documentation is using sample data/)).toBeInTheDocument()
  })

  it('shows sections and endpoints count', async () => {
    const PageComponent = await APIDocumentationPage()
    render(PageComponent)
    
    expect(screen.getByTestId('sections-count')).toHaveTextContent('1 sections')
    expect(screen.getByTestId('endpoints-count-test-section')).toHaveTextContent('1 endpoints')
  })
})