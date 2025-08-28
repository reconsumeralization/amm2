import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, APIErrorBoundary } from '@/components/ui/error-boundary'
import { GlobalErrorBoundary } from '@/components/ui/global-error-boundary'

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}))

// Component that throws an error
const ErrorComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that throws an async error
const AsyncErrorComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Async test error')
  }
  return <div>Async no error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders fallback UI when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary showErrorDetails={true}>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true
    })
    consoleSpy.mockRestore()
  })

  it('handles retry functionality', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true

    const TestComponent = () => {
      shouldThrow = false
      return <ErrorComponent shouldThrow={shouldThrow} />
    }

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Initially shows error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click retry
    fireEvent.click(screen.getByText('Try Again'))

    // Should recover and show the component
    expect(screen.getByText('No error')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})

describe('APIErrorBoundary', () => {
  it('renders API-specific error message', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <APIErrorBoundary>
        <AsyncErrorComponent />
      </APIErrorBoundary>
    )

    expect(screen.getByText('API Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load data. Please check your connection and try again.')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})

describe('GlobalErrorBoundary', () => {
  it('wraps children with global error handling', () => {
    render(
      <GlobalErrorBoundary>
        <div>Global test content</div>
      </GlobalErrorBoundary>
    )

    expect(screen.getByText('Global test content')).toBeInTheDocument()
  })

  it('handles global errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <GlobalErrorBoundary>
        <ErrorComponent />
      </GlobalErrorBoundary>
    )

    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong with the application')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
