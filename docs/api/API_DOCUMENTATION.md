
# Modern Men Hair BarberShop - API Documentation

## Overview

The Modern Men Hair BarberShop API provides comprehensive endpoints for managing BarberShop operations including appointments, customers, services, and analytics.


## Base URL

```
Production: https://modernmen.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require authentication. Include your session token in the request headers:

```http
Authorization: Bearer <your-session-token>
```

## Endpoints

### Appointments

#### Get Appointment Availability

```http
GET /api/appointments/availability
```

**Query Parameters:**
- `date` (required): ISO date string (YYYY-MM-DD)
- `stylistId` (optional): Specific stylist ID

**Response:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "slots": [
    {
      "time": "09:00",
      "available": true
    },
    {
      "time": "09:30",
      "available": false
    }
  ],
  "totalSlots": 22,
  "availableSlots": 18
}
```

#### Create Appointment

```http
POST /api/appointments
```

**Request Body:**
```json
{
  "customer": "customer-id",
  "stylist": "stylist-id",
  "services": ["service-id-1", "service-id-2"],
  "dateTime": "2024-01-15T10:00:00Z",
  "customerNotes": "Special instructions",
  "reminders": {
    "emailReminder": true,
    "smsReminder": false,
    "reminderTime": 24
  }
}
```

**Response:**
```json
{
  "id": "appointment-id",
  "appointmentTitle": "John Doe - 1/15/2024",
  "customer": "customer-id",
  "stylist": "stylist-id",
  "services": ["service-id-1", "service-id-2"],
  "dateTime": "2024-01-15T10:00:00Z",
  "duration": 90,
  "endTime": "2024-01-15T11:30:00Z",
  "status": "confirmed",
  "pricing": {
    "subtotal": 6000,
    "tax": 480,
    "total": 6480
  }
}
```

#### Update Appointment

```http
PATCH /api/appointments/{id}
```

**Request Body:**
```json
{
  "status": "completed",
  "performance": {
    "actualStartTime": "2024-01-15T10:05:00Z",
    "actualEndTime": "2024-01-15T11:25:00Z"
  },
  "followUp": {
    "satisfaction": "very-satisfied",
    "feedback": "Excellent service!"
  }
}
```

### Customers

#### Get Customer Profile

```http
GET /api/customers/{id}
```

**Response:**
```json
{
  "id": "customer-id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-306-555-0123",
  "loyaltyPoints": 150,
  "totalSpent": 25000,
  "visitCount": 5,
  "lastVisit": "2024-01-10T15:30:00Z",
  "preferences": {
    "stylist": "stylist-id",
    "services": ["service-id-1"],
    "notes": "Prefers shorter cuts"
  }
}
```

#### Update Customer

```http
PATCH /api/customers/{id}
```

**Request Body:**
```json
{
  "phone": "+1-306-555-0124",
  "preferences": {
    "stylist": "new-stylist-id",
    "notes": "Updated preferences"
  }
}
```

### Services

#### Get All Services

```http
GET /api/services
```

**Query Parameters:**
- `category` (optional): Filter by service category
- `active` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "docs": [
    {
      "id": "service-id",
      "name": "Men's Haircut",
      "description": "Professional men's haircut with consultation",
      "price": 2500,
      "duration": 30,
      "bufferTime": 5,
      "category": "haircuts",
      "active": true
    }
  ],
  "totalDocs": 1,
  "totalPages": 1,
  "page": 1,
  "limit": 10
}
```

### Analytics

#### Get Appointment Analytics

```http
GET /api/analytics/appointments
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics period
- `endDate` (optional): End date for analytics period
- `stylistId` (optional): Filter by specific stylist

**Response:**
```json
{
  "totalAppointments": 150,
  "completedAppointments": 142,
  "cancelledAppointments": 8,
  "averageDuration": 45,
  "totalRevenue": 375000,
  "averageSatisfaction": 4.8,
  "topServices": [
    {
      "serviceId": "service-id-1",
      "name": "Men's Haircut",
      "count": 45,
      "revenue": 112500
    }
  ],
  "stylistPerformance": [
    {
      "stylistId": "stylist-id-1",
      "name": "John Smith",
      "appointments": 25,
      "averageRating": 4.9,
      "efficiency": 95
    }
  ]
}
```

#### Get Customer Analytics

```http
GET /api/analytics/customers
```

**Response:**
```json
{
  "totalCustomers": 250,
  "newCustomersThisMonth": 15,
  "repeatCustomers": 180,
  "averageLoyaltyPoints": 125,
  "topSpenders": [
    {
      "customerId": "customer-id-1",
      "name": "John Doe",
      "totalSpent": 50000,
      "visitCount": 10
    }
  ],
  "customerRetention": 0.85
}
```

### Performance Monitoring

#### Get Performance Metrics

```http
GET /api/monitoring/performance
```

**Response:**
```json
{
  "pageLoadTime": {
    "average": 1200,
    "min": 800,
    "max": 2500,
    "unit": "ms"
  },
  "apiResponseTime": {
    "average": 150,
    "min": 50,
    "max": 500,
    "unit": "ms"
  },
  "memoryUsage": {
    "current": 45000000,
    "peak": 60000000,
    "unit": "bytes"
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `CONFLICT`: Resource conflict (e.g., appointment time conflict)
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 100 requests per minute
- **Unauthenticated users**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events

- `appointment.created`
- `appointment.updated`
- `appointment.cancelled`
- `customer.created`
- `customer.updated`

### Webhook Configuration

```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["appointment.created", "appointment.updated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "appointment.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "appointment-id",
    "customer": "customer-id",
    "stylist": "stylist-id",
    "dateTime": "2024-01-15T10:00:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @modernmen/api-client
```

```typescript
import { ModernMenAPI } from '@modernmen/api-client'

const api = new ModernMenAPI({
  baseURL: 'https://modernmen.vercel.app/api',
  token: 'your-api-token'
})

// Get appointment availability
const availability = await api.appointments.getAvailability({
  date: '2024-01-15',
  stylistId: 'stylist-id'
})

// Create appointment
const appointment = await api.appointments.create({
  customer: 'customer-id',
  stylist: 'stylist-id',
  services: ['service-id'],
  dateTime: '2024-01-15T10:00:00Z'
})
```

## Support

For API support and questions:

- **Email**: api-support@modernmen.ca
- **Documentation**: https://docs.modernmen.ca/api
- **Status Page**: https://status.modernmen.ca

## Changelog

### v1.2.0 (2024-01-15)
- Added performance monitoring endpoints
- Enhanced appointment conflict detection
- Added recurring appointment support

### v1.1.0 (2024-01-01)
- Added customer loyalty program endpoints
- Enhanced analytics capabilities
- Improved error handling

### v1.0.0 (2024-01-01)
- Initial API release
- Core appointment management
- Customer and service management

