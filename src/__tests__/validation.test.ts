import { describe, it, expect } from '@jest/globals'
import { z } from 'zod'
import {
  validateAndParse,
  formatValidationErrors
} from '@/lib/validations'
import {
  formatCurrency,
  formatPhone,
  isValidEmail
} from '@/lib/utils'

// Mock Next.js request for testing
const createMockRequest = (body: any) => ({
  json: () => Promise.resolve(body)
})

describe('Validation System', () => {
  describe('Utility Functions', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(-50.25)).toBe('$-50.25')
    })

    it('formats phone numbers correctly', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890')
      expect(formatPhone('11234567890')).toBe('+1 (123) 456-7890')
      expect(formatPhone('(123) 456-7890')).toBe('(123) 456-7890')
      expect(formatPhone('invalid')).toBe('invalid')
    })

    it('validates email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
    })
  })

  describe('Schema Validation', () => {
    const userSchema = z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.enum(['admin', 'manager', 'stylist', 'staff']),
    })

    it('validates correct user data', () => {
      const validData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin' as const
      }

      const result = validateAndParse(userSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('rejects invalid user data', () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: '',
        lastName: 'Doe',
        role: 'invalid-role'
      }

      const result = validateAndParse(userSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })

    it('formats validation errors correctly', () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: '',
        lastName: 'Doe',
        role: 'invalid-role'
      }

      const result = validateAndParse(userSchema, invalidData)
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.errors)
        expect(formattedErrors).toContain('email:')
        expect(formattedErrors).toContain('firstName:')
        expect(formattedErrors).toContain('role:')
      }
    })
  })

  describe('Business Logic Validation', () => {
    const appointmentSchema = z.object({
      dateTime: z.string().refine((date) => {
        const parsedDate = new Date(date)
        return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
      }, 'Date must be valid and in the future'),
    }).refine((data) => {
      const appointmentDate = new Date(data.dateTime)
      const hour = appointmentDate.getHours()
      return hour >= 9 && hour <= 20
    }, {
      message: 'Appointments can only be scheduled between 9:00 AM and 8:00 PM',
      path: ['dateTime'],
    })

    it('validates future appointment dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      futureDate.setHours(14, 0, 0, 0) // 2:00 PM

      const validData = {
        dateTime: futureDate.toISOString()
      }

      const result = validateAndParse(appointmentSchema, validData)
      expect(result.success).toBe(true)
    })

    it('rejects past appointment dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const invalidData = {
        dateTime: pastDate.toISOString()
      }

      const result = validateAndParse(appointmentSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects appointments outside business hours', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      futureDate.setHours(22, 0, 0, 0) // 10:00 PM (outside business hours)

      const invalidData = {
        dateTime: futureDate.toISOString()
      }

      const result = validateAndParse(appointmentSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.errors)
        expect(formattedErrors.some(error =>
          error.includes('between 9:00 AM and 8:00 PM')
        )).toBe(true)
      }
    })
  })

  describe('Password Security', () => {
    const passwordSchema = z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

    it('accepts strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MySecurePass1',
        'TestPass2024'
      ]

      strongPasswords.forEach(password => {
        const result = validateAndParse(passwordSchema, password)
        expect(result.success).toBe(true)
      })
    })

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'password',      // No uppercase or numbers
        'PASSWORD',      // No lowercase or numbers
        'Password',      // No numbers
        '12345678',      // No letters
        'Pass1',         // Too short
      ]

      weakPasswords.forEach(password => {
        const result = validateAndParse(passwordSchema, password)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Data Sanitization', () => {
    const reviewSchema = z.object({
      content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
      rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    })

    it('validates review content', () => {
      const validReview = {
        content: 'This is a great service! Highly recommend.',
        rating: 5
      }

      const result = validateAndParse(reviewSchema, validReview)
      expect(result.success).toBe(true)
    })

    it('rejects empty reviews', () => {
      const invalidReview = {
        content: 'Short',
        rating: 5
      }

      const result = validateAndParse(reviewSchema, invalidReview)
      expect(result.success).toBe(false)
    })

    it('validates rating range', () => {
      const invalidRatings = [0, 6, -1, 5.5]

      invalidRatings.forEach(rating => {
        const review = {
          content: 'This is a valid review with proper length',
          rating
        }
        const result = validateAndParse(reviewSchema, review)
        expect(result.success).toBe(false)
      })
    })
  })
})
