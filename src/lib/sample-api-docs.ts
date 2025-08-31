// Sample API documentation data for testing and development

import { APIDocumentationSection } from '@/types/api-documentation'

export const sampleAPIDocumentation: APIDocumentationSection[] = [
  {
    id: 'users',
    title: 'User Management',
    description: 'Endpoints for managing user accounts, authentication, and profiles',
    endpoints: [
      {
        path: '/api/users',
        method: 'GET',
        summary: 'Get users',
        description: 'Retrieve a paginated list of users with optional filtering',
        operationId: 'getUsers',
        tags: ['Users'],
        parameters: {
          path: [],
          query: [
            {
              name: 'limit',
              type: 'integer',
              required: false,
              description: 'Number of users to return (max 100)',
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
              name: 'role',
              type: 'string',
              required: false,
              description: 'Filter by user role',
              example: 'stylist',
              enum: ['admin', 'manager', 'stylist', 'customer']
            },
            {
              name: 'rch',
              type: 'string',
              required: false,
              description: 'rch users by name or email',
              example: 'john'
            }
          ],
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
        },
        responses: {
          '200': {
            description: 'Successful response with user list',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Success Response',
                    value: {
                      users: [
                        {
                          id: '123',
                          name: 'John Doe',
                          email: 'john@example.com',
                          role: 'stylist',
                          isActive: true,
                          createdAt: '2024-01-15T10:30:00Z'
                        }
                      ],
                      total: 1,
                      page: 1,
                      totalPages: 1,
                      hasNext: false,
                      hasPrev: false
                    }
                  }
                ]
              }
            ],
            examples: []
          },
          '401': {
            description: 'Unauthorized - Invalid or missing authentication',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Unauthorized',
                    value: { error: 'Unauthorized' }
                  }
                ]
              }
            ],
            examples: []
          }
        },
        security: [
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        ]
      },
      {
        path: '/api/users',
        method: 'POST',
        summary: 'Create user',
        description: 'Create a new user account with specified role and details',
        operationId: 'createUser',
        tags: ['Users'],
        parameters: {
          path: [],
          query: [],
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
        },
        requestBody: {
          required: true,
          content: [
            {
              mediaType: 'application/json',
              examples: [
                {
                  name: 'Create User Request',
                  value: {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'stylist',
                    phone: '+1234567890',
                    password: 'securePassword123'
                  }
                }
              ]
            }
          ],
          examples: []
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Created Response',
                    value: {
                      user: {
                        id: '456',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        role: 'stylist',
                        isActive: true,
                        createdAt: '2024-01-15T11:00:00Z'
                      },
                      message: 'User created successfully'
                    }
                  }
                ]
              }
            ],
            examples: []
          },
          '400': {
            description: 'Bad request - Invalid input data',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Validation Error',
                    value: { error: 'Name, email, and role are required' }
                  }
                ]
              }
            ],
            examples: []
          },
          '409': {
            description: 'Conflict - User already exists',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Conflict Error',
                    value: { error: 'User with this email already exists' }
                  }
                ]
              }
            ],
            examples: []
          }
        },
        security: [
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        ]
      }
    ],
    articles: [], // Added to resolve TypeScript error
    schemas: {},
    examples: [],
    authentication: []
  },
  {
    id: 'employees',
    title: 'Employee Management',
    description: 'Endpoints for managing BarberShop employees, stylists, and their profiles',
    endpoints: [
      {
        path: '/api/employees',
        method: 'GET',
        summary: 'Get employees',
        description: 'Retrieve a list of BarberShop employees with their profiles and performance data',
        operationId: 'getEmployees',
        tags: ['Employees'],
        parameters: {
          path: [],
          query: [
            {
              name: 'limit',
              type: 'integer',
              required: false,
              description: 'Number of employees to return',
              example: 20
            },
            {
              name: 'isActive',
              type: 'boolean',
              required: false,
              description: 'Filter by active status',
              example: true
            },
            {
              name: 'specialization',
              type: 'string',
              required: false,
              description: 'Filter by specialization',
              example: 'Hair Cutting'
            }
          ],
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
        },
        responses: {
          '200': {
            description: 'Successful response with employee list',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Success Response',
                    value: {
                      employees: [
                        {
                          id: '789',
                          name: 'Mike Johnson',
                          bio: 'Experienced hair stylist specializing in modern cuts',
                          specializations: ['Hair Cutting', 'Styling'],
                          isActive: true,
                          performance: {
                            rating: 4.8,
                            reviewCount: 127,
                            totalAppointments: 450
                          },
                          recentAppointmentsCount: 15
                        }
                      ],
                      total: 1,
                      page: 1,
                      totalPages: 1
                    }
                  }
                ]
              }
            ],
            examples: []
          }
        },
        security: [
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        ]
      }
    ],
    articles: [], // Added to resolve TypeScript error
    schemas: {},
    examples: [],
    authentication: []
  },
  {
    id: 'appointments',
    title: 'Appointment Management',
    description: 'Endpoints for managing BarberShop appointments, bookings, and scheduling',
    endpoints: [
      {
        path: '/api/core/appointments',
        method: 'GET',
        summary: 'Get appointments',
        description: 'Retrieve appointments with filtering and pagination options',
        operationId: 'getAppointments',
        tags: ['Appointments'],
        parameters: {
          path: [],
          query: [
            {
              name: 'date',
              type: 'string',
              required: false,
              description: 'Filter by appointment date (YYYY-MM-DD)',
              example: '2024-01-15'
            },
            {
              name: 'stylistId',
              type: 'string',
              required: false,
              description: 'Filter by stylist ID',
              example: '789'
            },
            {
              name: 'status',
              type: 'string',
              required: false,
              description: 'Filter by appointment status',
              example: 'confirmed',
              enum: ['pending', 'confirmed', 'completed', 'cancelled']
            }
          ],
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
        },
        responses: {
          '200': {
            description: 'Successful response with appointment list',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Success Response',
                    value: {
                      appointments: [
                        {
                          id: 'apt_123',
                          customerId: 'cust_456',
                          stylistId: '789',
                          serviceId: 'svc_101',
                          appointmentDate: '2024-01-15T14:30:00Z',
                          duration: 60,
                          status: 'confirmed',
                          notes: 'Regular haircut and styling',
                          totalPrice: 45.00
                        }
                      ],
                      total: 1,
                      page: 1,
                      totalPages: 1
                    }
                  }
                ]
              }
            ],
            examples: []
          }
        },
        security: [
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        ]
      },
      {
        path: '/api/core/appointments',
        method: 'POST',
        summary: 'Create appointment',
        description: 'Book a new appointment for a customer with a specific stylist and service',
        operationId: 'createAppointment',
        tags: ['Appointments'],
        parameters: {
          path: [],
          query: [],
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
        },
        requestBody: {
          required: true,
          content: [
            {
              mediaType: 'application/json',
              examples: [
                {
                  name: 'Create Appointment Request',
                  value: {
                    customerId: 'cust_456',
                    stylistId: '789',
                    serviceId: 'svc_101',
                    appointmentDate: '2024-01-15T14:30:00Z',
                    notes: 'Regular haircut and styling'
                  }
                }
              ]
            }
          ],
          examples: []
        },
        responses: {
          '201': {
            description: 'Appointment created successfully',
            content: [
              {
                mediaType: 'application/json',
                examples: [
                  {
                    name: 'Created Response',
                    value: {
                      appointment: {
                        id: 'apt_124',
                        customerId: 'cust_456',
                        stylistId: '789',
                        serviceId: 'svc_101',
                        appointmentDate: '2024-01-15T14:30:00Z',
                        duration: 60,
                        status: 'pending',
                        totalPrice: 45.00,
                        createdAt: '2024-01-15T12:00:00Z'
                      },
                      message: 'Appointment created successfully'
                    }
                  }
                ]
              }
            ],
            examples: []
          }
        },
        security: [
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        ]
      }
    ],
    articles: [], // Added to resolve TypeScript error
    schemas: {},
    examples: [],
    authentication: []
  }
]
