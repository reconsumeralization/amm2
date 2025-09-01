# 🤖 MCP (Model Context Protocol) - Comprehensive App Controller

A comprehensive MCP (Model Context Protocol) implementation that provides LLM chatbots with complete control over the Modern Men Hair BarberShop application through WebSocket-based communication.

## 🎯 Overview

The MCP system enables LLM chatbots to:
- **Control all application features** with proper RBAC (Role-Based Access Control)
- **Perform CRUD operations** on all entities (users, customers, appointments, services, etc.)
- **Access real-time data** and analytics
- **Execute business logic** operations
- **Generate AI-powered insights** and recommendations
- **Manage content and marketing** materials
- **Handle customer interactions** and support

## 🏗️ Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLM Chatbot   │◄──►│   MCP Server    │◄──►│  App Controller │
│                 │    │  (WebSocket)    │    │   (Business     │
│ • Natural Lang  │    │                 │    │    Logic)      │
│ • Intent Parsing │    │ • Request/Resp  │    │                 │
│ • Response Gen  │    │ • Authentication │    │ • CRUD Ops     │
└─────────────────┘    │ • Rate Limiting  │    │ • Analytics     │
                       │ • Real-time      │    │ • AI Features   │
                       └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Payload CMS   │    │    Supabase     │
                       │  (Admin/CMS)    │    │  (Database/Auth)│
                       │                 │    │                 │
                       │ • Content Mgmt  │    │ • PostgreSQL    │
                       │ • Admin UI      │    │ • Real-time     │
                       │ • Media Library │    │ • Auth          │
                       └─────────────────┘    └─────────────────┘
```

### Key Features

- **🔐 Role-Based Access Control**: Complete RBAC system with permissions for each operation
- **⚡ Real-time Updates**: WebSocket-based real-time data synchronization
- **📊 Analytics Integration**: Comprehensive analytics and reporting
- **🤖 AI/ML Features**: Style consultations, customer analysis, scheduling optimization
- **💼 Business Logic**: Appointment booking, payment processing, loyalty programs
- **🔍 Advanced Search**: Full-text search across all entities
- **📝 Content Management**: CMS operations for pages, blog posts, media
- **📧 Notification System**: Real-time notifications and reminders
- **🛡️ Security**: Rate limiting, request validation, audit logging

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file with the required variables:

```env
# MCP Server Configuration
MCP_PORT=3001
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payload CMS Configuration
PAYLOAD_SECRET=your-payload-secret

# Rate Limiting
MCP_RATE_LIMIT_WINDOW=60000
MCP_RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Start the MCP Server

```bash
# Using the startup script
npm run mcp:start

# Or directly with tsx
npx tsx scripts/start-mcp-server.ts
```

### 3. Connect from LLM Chatbot

```javascript
// WebSocket connection
const ws = new WebSocket('ws://localhost:3001');

// Send authentication request
ws.send(JSON.stringify({
  id: 'auth_1',
  method: 'authenticate',
  params: {
    email: 'admin@example.com',
    password: 'password'
  },
  timestamp: Date.now()
}));

// Handle responses
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('MCP Response:', response);
};
```

## 📋 Available Methods

### 🔐 Authentication & Authorization

#### `authenticate`
Authenticate a user and establish session context.

```javascript
{
  "id": "auth_1",
  "method": "authenticate",
  "params": {
    "email": "user@example.com",
    "password": "password"
  }
}
```

**Response:**
```javascript
{
  "id": "auth_1",
  "result": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "permissions": ["*"],
    "tenantId": "tenant_id"
  }
}
```

#### `logout`
End the current user session.

```javascript
{
  "id": "logout_1",
  "method": "logout",
  "params": {}
}
```

### 👥 User Management

#### `getUsers`
Retrieve list of users with optional filtering.

```javascript
{
  "id": "users_1",
  "method": "getUsers",
  "params": {
    "filters": {
      "role": "customer",
      "isActive": true
    },
    "limit": 50,
    "offset": 0
  }
}
```

#### `createUser`
Create a new user account.

```javascript
{
  "id": "create_user_1",
  "method": "createUser",
  "params": {
    "userData": {
      "email": "newuser@example.com",
      "name": "New User",
      "role": "customer",
      "isActive": true
    }
  }
}
```

#### `updateUser`
Update an existing user.

```javascript
{
  "id": "update_user_1",
  "method": "updateUser",
  "params": {
    "id": "user_id",
    "userData": {
      "name": "Updated Name",
      "phone": "+1234567890"
    }
  }
}
```

#### `changeUserRole`
Change a user's role (admin/manager only).

```javascript
{
  "id": "change_role_1",
  "method": "changeUserRole",
  "params": {
    "id": "user_id",
    "role": "manager"
  }
}
```

### 👨‍💼 Customer Management

#### `getCustomers`
Retrieve customer list with filtering.

```javascript
{
  "id": "customers_1",
  "method": "getCustomers",
  "params": {
    "filters": {
      "loyaltyTier": "gold",
      "lastVisit": { "$gte": "2024-01-01" }
    }
  }
}
```

#### `createCustomer`
Create a new customer profile.

```javascript
{
  "id": "create_customer_1",
  "method": "createCustomer",
  "params": {
    "customerData": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "preferences": {
        "hairType": "straight",
        "services": ["haircut", "shave"]
      }
    }
  }
}
```

### 📅 Appointment Management

#### `bookAppointment`
Book a new appointment with availability checking.

```javascript
{
  "id": "book_apt_1",
  "method": "bookAppointment",
  "params": {
    "appointmentData": {
      "service": "service_id",
      "date": "2024-01-15",
      "time": "10:00",
      "stylist": "stylist_id",
      "customer": "customer_id",
      "notes": "Regular haircut"
    }
  }
}
```

#### `getAppointmentAvailability`
Check available time slots.

```javascript
{
  "id": "availability_1",
  "method": "getAppointmentAvailability",
  "params": {
    "date": "2024-01-15",
    "serviceId": "service_id"
  }
}
```

#### `cancelAppointment`
Cancel an existing appointment.

```javascript
{
  "id": "cancel_apt_1",
  "method": "cancelAppointment",
  "params": {
    "id": "appointment_id",
    "reason": "Customer requested cancellation"
  }
}
```

### 💇‍♂️ Services & Products

#### `getServices`
Retrieve available services.

```javascript
{
  "id": "services_1",
  "method": "getServices",
  "params": {
    "filters": {
      "category": "haircut",
      "isActive": true
    }
  }
}
```

#### `createService`
Create a new service offering.

```javascript
{
  "id": "create_service_1",
  "method": "createService",
  "params": {
    "serviceData": {
      "name": "Premium Haircut",
      "description": "Professional haircut with styling",
      "price": 4500, // in cents
      "duration": 60, // minutes
      "category": "haircut"
    }
  }
}
```

### 📊 Analytics & Reporting

#### `getDashboardStats`
Get comprehensive dashboard statistics.

```javascript
{
  "id": "dashboard_1",
  "method": "getDashboardStats",
  "params": {}
}
```

#### `getAnalytics`
Get specific analytics data.

```javascript
{
  "id": "analytics_1",
  "method": "getAnalytics",
  "params": {
    "type": "appointments",
    "filters": {
      "dateFrom": "2024-01-01",
      "dateTo": "2024-01-31"
    }
  }
}
```

#### `generateReport`
Generate custom reports.

```javascript
{
  "id": "report_1",
  "method": "generateReport",
  "params": {
    "type": "revenue",
    "filters": {
      "period": "monthly",
      "year": 2024
    }
  }
}
```

### 🔍 Search & Filtering

#### `search`
Full-text search across all entities.

```javascript
{
  "id": "search_1",
  "method": "search",
  "params": {
    "query": "john doe",
    "type": "customers", // optional: users, customers, appointments, services, products
    "filters": {
      "isActive": true
    }
  }
}
```

### 💼 Business Logic

#### `processPayment`
Process payment for services/appointments.

```javascript
{
  "id": "payment_1",
  "method": "processPayment",
  "params": {
    "paymentData": {
      "amount": 4500,
      "currency": "USD",
      "customerId": "customer_id",
      "appointmentId": "appointment_id",
      "paymentMethod": "card"
    }
  }
}
```

#### `addLoyaltyPoints`
Add loyalty points to customer account.

```javascript
{
  "id": "loyalty_1",
  "method": "addLoyaltyPoints",
  "params": {
    "customerId": "customer_id",
    "points": 100,
    "reason": "Completed appointment"
  }
}
```

#### `sendNotification`
Send notification to user.

```javascript
{
  "id": "notify_1",
  "method": "sendNotification",
  "params": {
    "userId": "user_id",
    "notification": {
      "title": "Appointment Reminder",
      "message": "Your appointment is tomorrow at 10:00 AM",
      "type": "reminder"
    }
  }
}
```

### 🤖 AI/ML Features

#### `generateConsultation`
Generate AI-powered style consultation.

```javascript
{
  "id": "consultation_1",
  "method": "generateConsultation",
  "params": {
    "customerId": "customer_id",
    "preferences": {
      "hairType": "curly",
      "faceShape": "oval",
      "lifestyle": "professional"
    }
  }
}
```

#### `analyzeCustomerPreferences`
Analyze customer preferences and patterns.

```javascript
{
  "id": "analyze_1",
  "method": "analyzeCustomerPreferences",
  "params": {
    "customerId": "customer_id",
    "analysisType": "behavior" // behavior, preferences, trends
  }
}
```

#### `predictAppointmentNoShow`
Predict likelihood of no-show.

```javascript
{
  "id": "predict_1",
  "method": "predictAppointmentNoShow",
  "params": {
    "appointmentId": "appointment_id"
  }
}
```

#### `optimizeSchedule`
Optimize stylist schedule for efficiency.

```javascript
{
  "id": "optimize_1",
  "method": "optimizeSchedule",
  "params": {
    "stylistId": "stylist_id",
    "date": "2024-01-15",
    "constraints": {
      "maxHours": 8,
      "breakDuration": 30
    }
  }
}
```

#### `generateMarketingContent`
Generate marketing content and campaigns.

```javascript
{
  "id": "marketing_1",
  "method": "generateMarketingContent",
  "params": {
    "type": "email_campaign",
    "targetAudience": "loyal_customers",
    "theme": "new_services"
  }
}
```

## 🎮 LLM Chatbot Integration

### Natural Language Processing

The MCP system supports natural language commands that LLMs can parse and execute:

```javascript
// Example natural language commands
const commands = [
  "Book an appointment for John Doe tomorrow at 2 PM for a haircut",
  "Show me all customers who haven't visited in the last month",
  "Generate a report of revenue for this month",
  "Send a reminder to all customers with appointments today",
  "Create a new service called 'Deluxe Shave' for $35",
  "Find the best available time for a haircut tomorrow",
  "Analyze customer preferences for premium services",
  "Optimize the schedule for stylist Sarah for next week"
];
```

### React Hook Integration

Use the provided React hooks for seamless integration:

```tsx
import { useMCPController } from '@/hooks/useMCPController';

function ChatbotInterface() {
  const mcp = useMCPController();

  const handleCommand = async (command: string) => {
    // Parse natural language command
    const parsedCommand = parseNaturalLanguage(command);

    // Execute via MCP
    const result = await mcp[parsedCommand.method](parsedCommand.params);

    // Handle response
    console.log('Command result:', result);
  };

  return (
    <div>
      {/* Your chatbot UI */}
    </div>
  );
}
```

### Real-time Updates

Subscribe to real-time updates for live data:

```javascript
// Real-time appointment updates
useEffect(() => {
  const handleAppointmentUpdate = (event) => {
    const { new: newAppointment } = event.detail;
    // Update UI with new appointment
  };

  window.addEventListener('realtime:appointments', handleAppointmentUpdate);

  return () => {
    window.removeEventListener('realtime:appointments', handleAppointmentUpdate);
  };
}, []);
```

## 🔐 Security & Permissions

### Role-Based Access Control

The system implements comprehensive RBAC:

```javascript
const permissions = {
  admin: {
    users: ['read', 'create', 'update', 'delete'],
    customers: ['read', 'create', 'update', 'delete'],
    appointments: ['read', 'create', 'update', 'cancel'],
    analytics: ['read'],
    reports: ['read', 'generate']
  },
  manager: {
    // Similar to admin but with some restrictions
  },
  barber: {
    appointments: ['read', 'update'], // Only own appointments
    customers: ['read'], // Only customers with appointments
    schedule: ['read', 'update'] // Only own schedule
  },
  customer: {
    appointments: ['read', 'create', 'cancel'], // Only own appointments
    profile: ['read', 'update'], // Only own profile
    services: ['read'] // Public services
  }
};
```

### Request Validation

All requests are validated for:
- **Authentication**: User must be logged in
- **Authorization**: User must have required permissions
- **Input Validation**: Request parameters are validated
- **Rate Limiting**: Prevents abuse and ensures fair usage

## 📊 Monitoring & Analytics

### Request Metrics

The system tracks:
- Request count and response times
- Success/failure rates
- User activity patterns
- Performance bottlenecks

### Health Monitoring

- Server uptime and resource usage
- Connection counts and status
- Database connection health
- External service availability

## 🚀 Deployment

### Production Configuration

```env
# Production settings
MCP_PORT=3001
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true

# Security
MCP_RATE_LIMIT_WINDOW=60000
MCP_RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
ENABLE_HEALTH_CHECKS=true
METRICS_RETENTION_DAYS=30
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "run", "mcp:start"]
```

### Scaling Considerations

- **Horizontal Scaling**: Multiple MCP server instances behind a load balancer
- **Database Connection Pooling**: Efficient database connection management
- **Redis Caching**: Cache frequently accessed data
- **Message Queues**: Async processing for heavy operations

## 🧪 Testing

### Unit Tests

```bash
npm run test:mcp:unit
```

### Integration Tests

```bash
npm run test:mcp:integration
```

### Load Testing

```bash
npm run test:mcp:load
```

## 📚 API Reference

### Error Codes

- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

### Response Format

```javascript
{
  "id": "request_id",
  "result": { /* response data */ },
  "timestamp": 1234567890
}
```

### Error Response Format

```javascript
{
  "id": "request_id",
  "error": {
    "code": 500,
    "message": "Error description",
    "data": { /* additional error data */ }
  },
  "timestamp": 1234567890
}
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run mcp:dev`
5. Run tests: `npm run test:mcp`

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Document all public methods

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@modernmen.com
- 💬 Discord: [Modern Men Community](https://discord.gg/modernmen)
- 📖 Documentation: [MCP Documentation](https://docs.modernmen.com/mcp)
- 🐛 Issues: [GitHub Issues](https://github.com/modernmen/mcp/issues)

---

**🎉 Ready to build the most powerful barber shop management system with AI!**
