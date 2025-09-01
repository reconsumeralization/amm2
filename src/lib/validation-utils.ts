// src/lib/validation-utils.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Validate request body against a Zod schema
 * @param request - NextRequest object
 * @param schema - Zod schema to validate against
 * @returns Promise with validation result
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{
  success: boolean;
  data?: T;
  errors?: string[];
}> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      const errors = result.error.errors.map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      });

      return {
        success: false,
        errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid JSON in request body'],
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 * @param searchParams - URLSearchParams object
 * @param schema - Zod schema to validate against
 * @returns Validation result
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const result = schema.safeParse(params);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      const errors = result.error.errors.map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      });

      return {
        success: false,
        errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid query parameters'],
    };
  }
}

/**
 * Sanitize string input to prevent XSS and other attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate email format and domain
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

/**
 * Validate date string format
 * @param dateString - Date string to validate
 * @param format - Expected format ('ISO' or 'US')
 * @returns Boolean indicating if date is valid
 */
export function isValidDate(dateString: string, format: 'ISO' | 'US' = 'ISO'): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString.substring(0, 10));
  } catch {
    return false;
  }
}

/**
 * Validate business rules for appointments
 * @param appointmentData - Appointment data to validate
 * @returns Array of validation errors
 */
export function validateAppointmentBusinessRules(appointmentData: any): string[] {
  const errors: string[] = [];

  // Check if appointment is in the future
  const appointmentDate = new Date(appointmentData.date);
  const now = new Date();

  if (appointmentDate <= now) {
    errors.push('Appointment must be scheduled in the future');
  }

  // Check if appointment is within business hours (9 AM - 7 PM)
  const hour = appointmentDate.getHours();
  if (hour < 9 || hour > 19) {
    errors.push('Appointment must be within business hours (9 AM - 7 PM)');
  }

  // Check if appointment is not on weekends (optional business rule)
  const dayOfWeek = appointmentDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push('Appointments are not available on weekends');
  }

  // Check duration is reasonable
  if (appointmentData.duration < 15 || appointmentData.duration > 480) {
    errors.push('Appointment duration must be between 15 minutes and 8 hours');
  }

  return errors;
}