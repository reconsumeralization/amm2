import { z } from 'zod'

// Base schemas for common fields
export const baseSchemas = {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
}

// Customer validation schemas
export const customerSchemas = {
  create: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    dateOfBirth: z.date().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    preferences: z.object({
      communicationMethod: z.enum(['email', 'sms', 'phone']).optional(),
      marketingConsent: z.boolean().optional(),
      appointmentReminders: z.boolean().optional(),
    }).optional(),
  }),

  update: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    dateOfBirth: z.date().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    preferences: z.object({
      communicationMethod: z.enum(['email', 'sms', 'phone']).optional(),
      marketingConsent: z.boolean().optional(),
      appointmentReminders: z.boolean().optional(),
    }).optional(),
  }),
}

// Appointment validation schemas
export const appointmentSchemas = {
  create: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    stylistId: z.string().uuid('Invalid stylist ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    date: z.date('Invalid date'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
    notes: z.string().max(500, 'Notes too long').optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  }),

  update: z.object({
    customerId: z.string().uuid().optional(),
    stylistId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    date: z.date().optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    duration: z.number().min(15).max(480).optional(),
    notes: z.string().max(500).optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  }),
}

// Service validation schemas
export const serviceSchemas = {
  create: z.object({
    name: z.string().min(1, 'Service name is required').max(100, 'Service name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    price: z.number().min(0, 'Price must be positive'),
    duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    isActive: z.boolean().optional(),
    requiresConsultation: z.boolean().optional(),
    maxConcurrentBookings: z.number().min(1).optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    price: z.number().min(0).optional(),
    duration: z.number().min(15).max(480).optional(),
    category: z.string().min(1).max(50).optional(),
    isActive: z.boolean().optional(),
    requiresConsultation: z.boolean().optional(),
    maxConcurrentBookings: z.number().min(1).optional(),
  }),
}

// Stylist validation schemas
export const stylistSchemas = {
  create: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    bio: z.string().max(1000, 'Bio too long').optional(),
    specialties: z.array(z.string()).optional(),
    experience: z.number().min(0, 'Experience must be positive').optional(),
    hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
    isActive: z.boolean().optional(),
    schedule: z.object({
      monday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      tuesday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      wednesday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      thursday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      friday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      saturday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      sunday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }),

  update: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    bio: z.string().max(1000).optional(),
    specialties: z.array(z.string()).optional(),
    experience: z.number().min(0).optional(),
    hourlyRate: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    schedule: z.object({
      monday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      tuesday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      wednesday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      thursday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      friday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      saturday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
      sunday: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }),
}

// User validation schemas
export const userSchemas = {
  create: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    role: z.enum(['admin', 'manager', 'stylist', 'customer'], 'Invalid role'),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),

  update: z.object({
    email: z.string().email().optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    role: z.enum(['admin', 'manager', 'stylist', 'customer']).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
}

// API request validation schemas
export const apiSchemas = {
  pagination: z.object({
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  search: z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    filters: z.record(z.any()).optional(),
    ...apiSchemas.pagination.shape,
  }),

  dateRange: z.object({
    startDate: z.date('Invalid start date'),
    endDate: z.date('Invalid end date'),
  }).refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }),
}

// Validation helper functions
export const validateRequest = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> => {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`)
    }
    throw error
  }
}

export const validatePartial = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<Partial<T>> => {
  try {
    return await schema.partial().parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`)
    }
    throw error
  }
}

// Collection-specific validation schemas
export const validationSchemas = {
  customers: customerSchemas,
  appointments: appointmentSchemas,
  services: serviceSchemas,
  stylists: stylistSchemas,
  users: userSchemas,
  api: apiSchemas,
}

// Type exports for use in other files
export type CustomerCreateInput = z.infer<typeof customerSchemas.create>
export type CustomerUpdateInput = z.infer<typeof customerSchemas.update>
export type AppointmentCreateInput = z.infer<typeof appointmentSchemas.create>
export type AppointmentUpdateInput = z.infer<typeof appointmentSchemas.update>
export type ServiceCreateInput = z.infer<typeof serviceSchemas.create>
export type ServiceUpdateInput = z.infer<typeof serviceSchemas.update>
export type StylistCreateInput = z.infer<typeof stylistSchemas.create>
export type StylistUpdateInput = z.infer<typeof stylistSchemas.update>
export type UserCreateInput = z.infer<typeof userSchemas.create>
export type UserUpdateInput = z.infer<typeof userSchemas.update>
