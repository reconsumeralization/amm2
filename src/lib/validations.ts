import { z } from 'zod'

// Base schemas for common fields
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits')
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const idSchema = z.string()
  .min(1, 'ID is required')
  .max(100, 'ID must be less than 100 characters')

// Authentication schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User management schemas
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  role: z.enum(['admin', 'manager', 'stylist', 'staff', 'customer'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  isActive: z.boolean().default(true),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: idSchema,
})

export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

// Employee/Stylist schemas
export const createEmployeeSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: z.enum(['stylist', 'manager'], {
    errorMap: () => ({ message: 'Role must be stylist or manager' }),
  }),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  experience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience seems too high'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters'),
  certifications: z.array(z.string()).optional(),
  profileImage: z.string().url('Invalid profile image URL').optional(),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative').max(500, 'Hourly rate seems too high'),
  availability: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional(),
    sunday: z.array(z.string()).optional(),
  }).optional(),
  // Legacy properties - kept for backward compatibility
  schedule: z.any().optional(), // Legacy schedule format
  pricing: z.any().optional(), // Legacy pricing format
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: idSchema,
  isActive: z.boolean().optional(),
})

// Service schemas
export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Service name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
  price: z.number().min(0, 'Price cannot be negative').max(100000, 'Price seems too high (max $1,000)'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  isActive: z.boolean().default(true),
  image: z.string().url('Invalid image URL').optional(),
  preparationTime: z.number().min(0, 'Preparation time cannot be negative').max(60, 'Preparation time cannot exceed 60 minutes').optional(),
  bufferTime: z.number().min(0, 'Buffer time cannot be negative').max(60, 'Buffer time cannot exceed 60 minutes').optional(),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: idSchema,
})

// Appointment schemas
export const createAppointmentSchema = z.object({
  customerId: idSchema,
  stylistId: idSchema,
  serviceId: idSchema,
  dateTime: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }, 'Date must be valid and in the future'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']).default('pending'),
}).refine((data) => {
  // Business logic: appointments must be scheduled during business hours (9 AM - 8 PM)
  const appointmentDate = new Date(data.dateTime)
  const hour = appointmentDate.getHours()
  return hour >= 9 && hour <= 20
}, {
  message: 'Appointments can only be scheduled between 9:00 AM and 8:00 PM',
  path: ['dateTime'],
})

export const updateAppointmentSchema = z.object({
  id: idSchema,
  customerId: idSchema.optional(),
  stylistId: idSchema.optional(),
  serviceId: idSchema.optional(),
  dateTime: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }, 'Date must be valid and in the future').optional(),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']).optional(),
}).refine((data) => {
  // Business logic: appointments must be scheduled during business hours (9 AM - 8 PM)
  if (data.dateTime) {
    const appointmentDate = new Date(data.dateTime)
    const hour = appointmentDate.getHours()
    return hour >= 9 && hour <= 20
  }
  return true
}, {
  message: 'Appointments can only be scheduled between 9:00 AM and 8:00 PM',
  path: ['dateTime'],
})

// Customer schemas
export const createCustomerSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const now = new Date()
    const age = now.getFullYear() - parsedDate.getFullYear()
    return !isNaN(parsedDate.getTime()) && age >= 13 && age <= 120
  }, 'Invalid date of birth or age must be between 13 and 120').optional(),
  address: z.object({
    street: z.string().max(200, 'Street address must be less than 200 characters'),
    city: z.string().max(100, 'City must be less than 100 characters'),
    state: z.string().max(50, 'State must be less than 50 characters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    country: z.string().max(50, 'Country must be less than 50 characters').default('USA'),
  }).optional(),
  preferences: z.object({
    preferredStylist: idSchema.optional(),
    preferredServices: z.array(idSchema).optional(),
    communicationMethod: z.enum(['email', 'sms', 'phone']).default('email'),
    marketingOptIn: z.boolean().default(false),
  }).optional(),
  emergencyContact: z.object({
    name: nameSchema,
    relationship: z.string().max(50, 'Relationship must be less than 50 characters'),
    phone: phoneSchema,
  }).optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: idSchema,
})

// Notification schemas
export const sendNotificationSchema = z.object({
  userId: idSchema,
  type: z.enum(['user_created', 'user_updated', 'employee_created', 'appointment_booked', 'system_alert', 'security_alert']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  data: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

// Analytics schemas
export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  type: z.enum(['revenue', 'appointments', 'customers', 'services', 'employees', 'all']).default('all'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date').optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'Start date must be before or equal to end date',
  path: ['startDate'],
})

// Testimonial schemas
export const createTestimonialSchema = z.object({
  customerId: idSchema,
  stylistId: idSchema.optional(),
  serviceId: idSchema.optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
  isVerified: z.boolean().default(false),
  isPublished: z.boolean().default(false),
})

export const updateTestimonialSchema = createTestimonialSchema.partial().extend({
  id: idSchema,
})

// Wait list schemas
export const joinWaitlistSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  preferredService: idSchema.optional(),
  preferredStylist: idSchema.optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  preferredDate: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }, 'Preferred date must be in the future').optional(),
})

export const updateWaitlistSchema = joinWaitlistSchema.partial().extend({
  id: idSchema,
})

// Health check response schema
export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  timestamp: z.string().datetime(),
  uptime: z.number().positive(),
  services: z.object({
    database: z.enum(['healthy', 'unhealthy']),
    payload: z.enum(['healthy', 'unhealthy']),
    redis: z.enum(['healthy', 'unhealthy']).optional(),
  }),
  counts: z.object({
    users: z.number().nonnegative(),
    appointments: z.number().nonnegative(),
    services: z.number().nonnegative(),
  }).optional(),
  errors: z.array(z.string()).optional(),
})

// Utility functions for validation
export function validateAndParse<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError['errors'] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}

export function formatValidationErrors(errors: z.ZodError['errors']): string[] {
  return errors.map(error => {
    const path = error.path.join('.')
    return path ? `${path}: ${error.message}` : error.message
  })
}

// Export all schemas for easy access
export const schemas = {
  auth: {
    signIn: signInSchema,
    signUp: signUpSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
  },
  users: {
    create: createUserSchema,
    update: updateUserSchema,
    updateProfile: updateProfileSchema,
  },
  employees: {
    create: createEmployeeSchema,
    update: updateEmployeeSchema,
  },
  services: {
    create: createServiceSchema,
    update: updateServiceSchema,
  },
  appointments: {
    create: createAppointmentSchema,
    update: updateAppointmentSchema,
  },
  customers: {
    create: createCustomerSchema,
    update: updateCustomerSchema,
  },
  notifications: {
    send: sendNotificationSchema,
  },
  analytics: {
    query: analyticsQuerySchema,
  },
  testimonials: {
    create: createTestimonialSchema,
    update: updateTestimonialSchema,
  },
  waitlist: {
    join: joinWaitlistSchema,
    update: updateWaitlistSchema,
  },
  health: {
    response: healthCheckResponseSchema,
  },
}
