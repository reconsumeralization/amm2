import '@testing-library/jest-dom'
import { formatCurrency, formatDate, formatPhone, generateId, capitalize, truncate, isValidEmail } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      const result = formatCurrency(1234.56)
      expect(result).toBe('$1234.56')
    })

    it('handles zero values', () => {
      const result = formatCurrency(0)
      expect(result).toBe('$0.00')
    })

    it('handles negative values', () => {
      const result = formatCurrency(-50.25)
      expect(result).toBe('$-50.25')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const testDate = '2024-01-15'
      const result = formatDate(testDate)
      expect(result).toBe('1/15/2024') // Assuming US locale
    })

    it('handles invalid dates', () => {
      const invalidDate = 'invalid-date'
      expect(() => formatDate(invalidDate)).toThrow()
    })
  })

  describe('formatPhone', () => {
    it('formats US phone numbers correctly', () => {
      const phone = '1234567890'
      const result = formatPhone(phone)
      expect(result).toBe('(123) 456-7890')
    })

    it('handles phone numbers with country code', () => {
      const phone = '11234567890'
      const result = formatPhone(phone)
      expect(result).toBe('+1 (123) 456-7890')
    })

    it('handles phone numbers with formatting', () => {
      const phone = '(123) 456-7890'
      const result = formatPhone(phone)
      expect(result).toBe('(123) 456-7890')
    })

    it('returns original for invalid formats', () => {
      const phone = 'invalid'
      const result = formatPhone(phone)
      expect(result).toBe('invalid')
    })
  })

  describe('generateId', () => {
    it('generates a string ID', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
      expect(capitalize('hELLO wORLD')).toBe('Hello world')
    })

    it('handles empty strings', () => {
      expect(capitalize('')).toBe('')
    })

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('truncate', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncate(text, 20)
      expect(result).toBe('This is a very long...')
      expect(result.length).toBe(23) // 20 + '...'
    })

    it('does not truncate short text', () => {
      const text = 'Short text'
      const result = truncate(text, 20)
      expect(result).toBe('Short text')
    })

    it('handles exact length', () => {
      const text = 'Exactly 10 chars'
      const result = truncate(text, 15)
      expect(result).toBe('Exactly 10 chars')
    })
  })

  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('test123@test-domain.com')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test.domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
})
