import { test, expect } from '@playwright/test'

test.describe('Appointment Booking Flow', () => {
  test('should allow users to book an appointment successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Click on "Book Appointment" or similar CTA
    await page.click('text=Book Appointment')

    // Wait for the booking page to load
    await page.waitForURL('**/book**')

    // Select a service
    await page.click('text=Haircut & Styling')
    await page.click('button:has-text("Continue")')

    // Select a date and time
    await page.click('[data-testid="date-picker"]')
    await page.click('text=Tomorrow')

    // Select a time slot
    await page.click('[data-testid="time-slot-10-00"]')

    // Fill in customer details
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john.doe@example.com')
    await page.fill('[name="phone"]', '+1-555-0123')

    // Submit the booking
    await page.click('button:has-text("Book Appointment")')

    // Wait for success message
    await expect(page.locator('text=Appointment booked successfully')).toBeVisible()

    // Verify booking details are displayed
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Haircut & Styling')).toBeVisible()
  })

  test('should show available time slots correctly', async ({ page }) => {
    await page.goto('/book')

    // Select a service and date
    await page.click('text=Haircut & Styling')
    await page.click('[data-testid="date-picker"]')
    await page.click('text=Next Monday')

    // Verify time slots are displayed
    await expect(page.locator('[data-testid^="time-slot-"]')).toHaveCount(8)

    // Verify unavailable slots are disabled
    const disabledSlots = page.locator('[data-testid^="time-slot-"][disabled]')
    await expect(disabledSlots).toHaveCount(2)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/book')

    // Try to submit without filling required fields
    await page.click('button:has-text("Book Appointment")')

    // Verify validation messages appear
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Phone number is required')).toBeVisible()
  })

  test('should handle server errors gracefully', async ({ page }) => {
    // This test would require mocking API responses
    await page.goto('/book')

    // Fill in all required fields
    await page.fill('[name="firstName"]', 'Jane')
    await page.fill('[name="lastName"]', 'Smith')
    await page.fill('[name="email"]', 'jane.smith@example.com')
    await page.fill('[name="phone"]', '+1-555-0456')

    // Simulate a network error or server error
    await page.route('**/api/appointments', route => route.abort())

    await page.click('button:has-text("Book Appointment")')

    // Verify error message is displayed
    await expect(page.locator('text=Something went wrong')).toBeVisible()
  })
})
