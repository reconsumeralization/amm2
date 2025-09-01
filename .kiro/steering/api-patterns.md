---
inclusion: fileMatch
fileMatchPattern: ['src/app/api/**/*.ts']
---

# API Route Patterns

This project follows consistent API patterns across all endpoints:

## 📁 API Structure

### **Route Organization:**
```
src/app/api/{domain}/{resource}/route.ts
```

### **Domains:**
- `content/` - Content management (pages, blog, media)
- `crm/` - Customer relationship (customers, reviews)
- `commerce/` - E-commerce (products, orders, payments)
- `auth/` - Authentication routes
- `admin/` - Admin-specific operations

## 🔧 Standard Patterns

### **Error Handling:**
```typescript
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET() {
  try {
    // Your logic here
    return createSuccessResponse(data, 'Success message')
  } catch (error) {
    return createErrorResponse('Error message', 'ERROR_CODE', 500)
  }
}
```

### **Authentication:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session?.user) {
  return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
}
```

### **Authorization:**
```typescript
const allowedRoles = ['admin', 'manager', 'editor']
if (!allowedRoles.includes(session.user.role)) {
  return createErrorResponse('Forbidden', 'FORBIDDEN', 403)
}
```

## 📋 Response Formats

### **Success Response:**
```typescript
{
  success: true,
  message: "Operation completed",
  data: { /* your data */ },
  timestamp: "2024-01-01T00:00:00Z",
  requestId: "req-123"
}
```

### **Error Response:**
```typescript
{
  error: "Error message",
  code: "ERROR_CODE",
  details: { /* optional details */ },
  timestamp: "2024-01-01T00:00:00Z"
}
```

## 🎯 Common Endpoints

### **CRUD Operations:**
- `GET /api/{resource}` - List with pagination
- `POST /api/{resource}` - Create new item
- `GET /api/{resource}/[id]` - Get single item
- `PUT /api/{resource}/[id]` - Update item
- `DELETE /api/{resource}/[id]` - Delete item

### **Special Operations:**
- `POST /api/{resource}/bulk` - Bulk operations
- `GET /api/{resource}/search` - Search functionality
- `GET /api/{resource}/analytics` - Analytics data
- `POST /api/{resource}/export` - Data export

## 🚀 Best Practices

1. **Always use error handling** with try/catch blocks
2. **Validate input data** before processing
3. **Include proper HTTP status codes**
4. **Use consistent response formats**
5. **Add rate limiting** for public endpoints
6. **Include request IDs** for debugging
7. **Handle authentication/authorization** at the start