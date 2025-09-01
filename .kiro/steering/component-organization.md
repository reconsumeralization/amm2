---
inclusion: fileMatch
fileMatchPattern: ['src/components/**/*.tsx', 'src/components/**/*.ts']
---

# Component Organization

This project uses a structured component architecture with clear naming conventions:

## 📁 Component Structure

### **Main Directories:**
```
src/components/
├── ui/           # Reusable UI components (shadcn/ui based)
├── features/     # Feature-specific components
├── crm/          # CRM-related components
├── layout/       # Layout components
├── payload/      # PayloadCMS admin components
├── search/       # Search-related components
├── telemetry/    # Analytics components
└── image-editor/ # Image editing components
```

## 🏷️ Naming Conventions

### **Component Names:**
```typescript
// PascalCase for component files
Button.tsx
UserProfile.tsx
ProductCard.tsx

// kebab-case for directories
user-profile/
product-card/
```

### **File Patterns:**
```typescript
// Main component
ComponentName.tsx

// Component with sub-components
ComponentName/
├── index.tsx
├── ComponentName.tsx
├── SubComponent.tsx
└── types.ts
```

### **Hook Patterns:**
```typescript
// Custom hooks
useComponentName.ts
useApiCall.ts

// Hook directories
hooks/
├── useMonitoring.ts
├── useAuth.ts
└── useApi.ts
```

## 🎨 UI Components

### **shadcn/ui Integration:**
```typescript
// Import from ui directory
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// Usage
<Button variant="primary" size="lg">
  Click me
</Button>
```

### **Component Variants:**
```typescript
// Size variants
<Button size="sm|md|lg" />

// Style variants
<Button variant="primary|secondary|outline|ghost" />

// State variants
<Button disabled loading />
```

## 🔧 Feature Components

### **Feature Organization:**
```typescript
// Feature-specific components
src/components/features/
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── SocialLogin.tsx
├── products/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── ProductFilters.tsx
└── dashboard/
    ├── StatsWidget.tsx
    ├── RecentActivity.tsx
    └── QuickActions.tsx
```

### **Component Composition:**
```typescript
// Parent component
function ProductPage() {
  return (
    <div>
      <ProductFilters />
      <ProductGrid />
      <ProductPagination />
    </div>
  )
}

// Composed component
function ProductCard({ product }) {
  return (
    <Card>
      <ProductImage product={product} />
      <ProductInfo product={product} />
      <ProductActions product={product} />
    </Card>
  )
}
```

## 🎯 Component Patterns

### **Props Interface:**
```typescript
interface ComponentProps {
  // Required props
  title: string
  onClick: () => void

  // Optional props
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  className?: string
}

function Component({ title, onClick, variant = 'primary', ...props }: ComponentProps) {
  // Implementation
}
```

### **Forward Refs:**
```typescript
const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  }
)

Component.displayName = 'Component'
```

### **Custom Hooks:**
```typescript
// Hook for component logic
function useComponentLogic(initialValue: string) {
  const [value, setValue] = useState(initialValue)

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue)
  }, [])

  return { value, handleChange }
}

// Usage in component
function Component() {
  const { value, handleChange } = useComponentLogic('')

  return (
    <Input
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    />
  )
}
```

## 🚀 Best Practices

### **Component Structure:**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Types
interface Props {
  id: string
  title: string
}

// 3. Component
export function Component({ id, title }: Props) {
  // 4. Hooks
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, [])

  // 6. Handlers
  const handleClick = () => {
    // Event handlers
  }

  // 7. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click</button>
    </div>
  )
}
```

### **Error Boundaries:**
```typescript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}
```

## 🔍 Testing Patterns

### **Component Testing:**
```typescript
// __tests__/Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Component } from '../Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Component title="Test" onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## 🎯 Quick Reference

### **Common Imports:**
```typescript
// React hooks
import { useState, useEffect, useCallback, useMemo } from 'react'

// Next.js
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// UI components
import { Button, Input, Card } from '@/components/ui'

// Custom hooks
import { useAuth, useApi } from '@/hooks'

// Utilities
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
```

### **Styling Patterns:**
```typescript
// Tailwind classes
className="flex items-center justify-between p-4 bg-white rounded-lg shadow"

// Conditional classes
className={cn(
  "base-classes",
  variant === 'primary' && "primary-classes",
  disabled && "disabled-classes"
)}

// Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```