---
inclusion: fileMatch
fileMatchPattern: ['src/**/*.css', 'src/**/*.tsx', 'src/**/*.ts']
---

# Styling & Theming Patterns

This project uses a comprehensive styling system with Tailwind CSS and custom design tokens:

## 🎨 Design System

### **Color Palette:**
```css
/* Primary Colors */
--primary: theme('colors.blue.600')
--primary-hover: theme('colors.blue.700')
--primary-light: theme('colors.blue.100')

/* Neutral Colors */
--background: theme('colors.white')
--foreground: theme('colors.gray.900')
--muted: theme('colors.gray.100')
--muted-foreground: theme('colors.gray.600')

/* Status Colors */
--success: theme('colors.green.600')
--warning: theme('colors.yellow.600')
--error: theme('colors.red.600')
--info: theme('colors.blue.600')
```

### **Typography Scale:**
```css
/* Font Sizes */
--text-xs: theme('fontSize.xs')    /* 0.75rem */
--text-sm: theme('fontSize.sm')    /* 0.875rem */
--text-base: theme('fontSize.base') /* 1rem */
--text-lg: theme('fontSize.lg')    /* 1.125rem */
--text-xl: theme('fontSize.xl')    /* 1.25rem */
--text-2xl: theme('fontSize.2xl')  /* 1.5rem */
--text-3xl: theme('fontSize.3xl')  /* 1.875rem */
--text-4xl: theme('fontSize.4xl')  /* 2.25rem */
```

## 🎯 Tailwind Patterns

### **Layout Patterns:**
```tsx
// Flexbox layouts
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

// Container patterns
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### **Component Styling:**
```tsx
// Button variants
<button className={cn(
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
  "transition-colors focus-visible:outline-none focus-visible:ring-2",
  "disabled:pointer-events-none disabled:opacity-50",
  variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700",
  variant === 'secondary' && "bg-gray-100 text-gray-900 hover:bg-gray-200",
  size === 'sm' && "px-3 py-1.5 text-xs",
  size === 'lg' && "px-6 py-3 text-base"
)}>
  {children}
</button>
```

### **Responsive Design:**
```tsx
// Mobile-first approach
<div className="block sm:hidden md:flex lg:grid xl:inline">
  {/* Responsive content */}
</div>

// Container queries (if supported)
<div className="container max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
  {/* Responsive containers */}
</div>
```

## 🔧 Utility Classes

### **Spacing System:**
```tsx
// Margin utilities
<div className="m-4 mt-2 mb-4 ml-2 mr-2"> {/* All margins */}</div>
<div className="mx-auto"> {/* Center horizontally */}</div>

// Padding utilities
<div className="p-4 px-2 py-1"> {/* All padding */}</div>
<div className="px-4 py-2"> {/* Horizontal/vertical padding */}</div>
```

### **Color Utilities:**
```tsx
// Text colors
<p className="text-gray-900 text-blue-600 text-red-500">Text</p>

// Background colors
<div className="bg-white bg-gray-50 bg-blue-500">Background</div>

// Border colors
<div className="border border-gray-200 border-blue-500">Border</div>
```

### **Typography Utilities:**
```tsx
// Font sizes
<p className="text-xs text-sm text-base text-lg text-xl">Size</p>

// Font weights
<p className="font-light font-normal font-medium font-semibold font-bold">Weight</p>

// Text alignment
<p className="text-left text-center text-right">Alignment</p>
```

## 🎪 Advanced Patterns

### **Gradient Backgrounds:**
```tsx
<div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
  Gradient background
</div>

<div className="bg-gradient-to-br from-green-400 to-blue-600">
  Diagonal gradient
</div>
```

### **Animation Classes:**
```tsx
// Transition utilities
<button className="transition-all duration-200 ease-in-out hover:scale-105">
  Hover effect
</button>

// Transform utilities
<div className="transform rotate-45 scale-110 translate-x-4">
  Transformed element
</div>
```

### **Shadow System:**
```tsx
<div className="shadow-sm shadow shadow-md shadow-lg shadow-xl">
  Different shadow depths
</div>

<div className="shadow-2xl shadow-blue-500/50">
  Colored shadow
</div>
```

## 🎨 Theme Integration

### **CSS Custom Properties:**
```css
/* In globals.css */
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --background: #ffffff;
  --foreground: #0f172a;
}

.dark {
  --primary: #60a5fa;
  --secondary: #94a3b8;
  --background: #0f172a;
  --foreground: #f8fafc;
}
```

### **Theme Hook Usage:**
```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 bg-gray-200 dark:bg-gray-800"
    >
      Toggle Theme
    </button>
  )
}
```

## 🚀 Performance Optimizations

### **Critical CSS:**
```css
/* Load critical styles first */
.header { /* Critical styles */ }
.hero { /* Above-the-fold styles */ }

/* Load non-critical styles later */
.sidebar { /* Deferred styles */ }
.footer { /* Deferred styles */ }
```

### **Tailwind Optimization:**
```tsx
// Use @apply for repeated patterns
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium;
  @apply bg-blue-600 text-white rounded-md transition-colors;
  @apply hover:bg-blue-700 focus:ring-2 focus:ring-blue-500;
}

// Avoid arbitrary values when possible
<div className="w-[500px]"> {/* Use predefined classes instead */}</div>
<div className="w-custom"> {/* Better: define in tailwind.config.js */}</div>
```

## 🔧 Configuration

### **Tailwind Config:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3b82f6',
          secondary: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ]
}
```

### **PostCSS Config:**
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

## 🎯 Best Practices

### **Class Organization:**
```tsx
// 1. Layout classes first
// 2. Spacing classes
// 3. Colors and backgrounds
// 4. Typography
// 5. Effects and animations
// 6. Responsive classes (mobile-first)

<div className="
  flex items-center justify-center
  p-4 m-2
  bg-blue-500 text-white
  font-semibold text-lg
  rounded-lg shadow-md
  hover:shadow-lg transition-shadow
  md:p-6 lg:m-4
">
  Content
</div>
```

### **Conditional Classes:**
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === 'primary' && "primary-variant",
  size === 'large' && "large-size"
)}>
  Content
</div>
```

### **Dark Mode Support:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content that supports both themes
</div>
```

## 🔍 Debugging Styles

### **Common Issues:**
```tsx
// Check if Tailwind is purging classes
<div className="bg-blue-500 hover:bg-blue-600"> {/* Works */}</div>

// Verify responsive breakpoints
<div className="bg-red-500 md:bg-green-500 lg:bg-blue-500">
  {/* Check different screen sizes */}
</div>

// Inspect computed styles
<div className="p-4" style={{ border: '1px solid red' }}>
  {/* Add debugging borders */}
</div>
```

### **Development Tools:**
```javascript
// In browser console
document.querySelector('.element').classList
// See applied classes

// Check Tailwind compilation
npx tailwindcss -i input.css -o output.css --watch
// Monitor compilation
```