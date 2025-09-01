import { differenceInMinutes, differenceInHours, addMinutes, isWithinInterval } from 'date-fns'

export interface TimeEntry {
  id: string
  employeeId: string
  date: string
  clockInTime: string
  clockOutTime?: string
  breakDuration?: number
  status: string
}

export interface TimeCalculation {
  totalHours: number
  regularHours: number
  overtimeHours: number
  breakDuration: number
  netHours: number
}

export interface PayrollPeriod {
  startDate: string
  endDate: string
  workDays: number
  totalHours: number
  regularHours: number
  overtimeHours: number
  grossPay: number
  deductions: number
  netPay: number
}

export class TimeTracking {
  /**
   * Calculate hours worked from clock in/out times
   */
  static calculateHoursWorked(
    clockInTime: string,
    clockOutTime: string,
    breakDuration: number = 0
  ): TimeCalculation {
    const clockIn = new Date(clockInTime)
    const clockOut = new Date(clockOutTime)

    // Calculate total minutes worked
    const totalMinutes = differenceInMinutes(clockOut, clockIn)

    // Convert to hours
    const totalHours = totalMinutes / 60

    // Subtract break time
    const netHours = Math.max(0, totalHours - (breakDuration / 60))

    // Calculate regular vs overtime hours (8 hours = regular, over 8 = overtime)
    const regularHours = Math.min(netHours, 8)
    const overtimeHours = Math.max(0, netHours - 8)

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      breakDuration,
      netHours: Math.round(netHours * 100) / 100,
    }
  }

  /**
   * Calculate payroll for a period
   */
  static calculatePayroll(
    timeEntries: TimeEntry[],
    hourlyRate: number,
    overtimeRate?: number,
    periodStart: string,
    periodEnd: string
  ): PayrollPeriod {
    const periodStartDate = new Date(periodStart)
    const periodEndDate = new Date(periodEnd)

    // Filter entries within the period
    const periodEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, {
        start: periodStartDate,
        end: periodEndDate,
      }) && entry.status === 'completed'
    })

    // Calculate total hours
    let totalRegularHours = 0
    let totalOvertimeHours = 0
    let totalHours = 0

    periodEntries.forEach(entry => {
      if (entry.clockInTime && entry.clockOutTime) {
        const calculation = this.calculateHoursWorked(
          entry.clockInTime,
          entry.clockOutTime,
          entry.breakDuration || 0
        )
        totalRegularHours += calculation.regularHours
        totalOvertimeHours += calculation.overtimeHours
        totalHours += calculation.netHours
      }
    })

    // Calculate pay
    const finalOvertimeRate = overtimeRate || (hourlyRate * 1.5)
    const regularPay = totalRegularHours * hourlyRate
    const overtimePay = totalOvertimeHours * finalOvertimeRate
    const grossPay = regularPay + overtimePay

    // Calculate deductions (simplified - in real app, this would be more complex)
    const federalTax = Math.round(grossPay * 0.12) // 12% federal
    const stateTax = Math.round(grossPay * 0.05)   // 5% state
    const socialSecurity = Math.round(grossPay * 0.062) // 6.2% SS
    const medicare = Math.round(grossPay * 0.0145) // 1.45% medicare

    const totalDeductions = federalTax + stateTax + socialSecurity + medicare
    const netPay = grossPay - totalDeductions

    // Calculate work days
    const workDays = new Set(periodEntries.map(entry => entry.date)).size

    return {
      startDate: periodStart,
      endDate: periodEnd,
      workDays,
      totalHours: Math.round(totalHours * 100) / 100,
      regularHours: Math.round(totalRegularHours * 100) / 100,
      overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
      grossPay,
      deductions: totalDeductions,
      netPay,
    }
  }

  /**
   * Check for schedule conflicts
   */
  static checkScheduleConflicts(
    newSchedule: {
      employeeId: string
      date: string
      startTime: string
      endTime: string
    },
    existingSchedules: Array<{
      id: string
      employeeId: string
      date: string
      startTime: string
      endTime: string
    }>
  ): boolean {
    const newStart = new Date(`${newSchedule.date}T${newSchedule.startTime}`)
    const newEnd = new Date(`${newSchedule.date}T${newSchedule.endTime}`)

    return existingSchedules.some(schedule => {
      // Skip if different employee or date
      if (schedule.employeeId !== newSchedule.employeeId || schedule.date !== newSchedule.date) {
        return false
      }

      const existingStart = new Date(`${schedule.date}T${schedule.startTime}`)
      const existingEnd = new Date(`${schedule.date}T${schedule.endTime}`)

      // Check for overlap
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      )
    })
  }

  /**
   * Format time duration for display
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins}m`
    } else if (mins === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${mins}m`
    }
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100) // Assuming amounts are stored in cents
  }

  /**
   * Calculate weekly overtime
   */
  static calculateWeeklyOvertime(dailyHours: number[]): number {
    const totalHours = dailyHours.reduce((sum, hours) => sum + hours, 0)
    const regularHours = Math.min(totalHours, 40) // 40 hours = regular week
    const overtimeHours = Math.max(0, totalHours - 40)

    return overtimeHours
  }

  /**
   * Validate time entry
   */
  static validateTimeEntry(entry: Partial<TimeEntry>): string[] {
    const errors: string[] = []

    if (!entry.employeeId) {
      errors.push('Employee ID is required')
    }

    if (!entry.date) {
      errors.push('Date is required')
    }

    if (!entry.clockInTime) {
      errors.push('Clock in time is required')
    }

    if (entry.clockInTime && entry.clockOutTime) {
      const clockIn = new Date(entry.clockInTime)
      const clockOut = new Date(entry.clockOutTime)

      if (clockOut <= clockIn) {
        errors.push('Clock out time must be after clock in time')
      }

      const hoursWorked = differenceInHours(clockOut, clockIn)
      if (hoursWorked > 24) {
        errors.push('Shift cannot be longer than 24 hours')
      }
    }

    return errors
  }
}

// Export utility functions
export const calculateHoursWorked = TimeTracking.calculateHoursWorked
export const calculatePayroll = TimeTracking.calculatePayroll
export const checkScheduleConflicts = TimeTracking.checkScheduleConflicts
export const formatDuration = TimeTracking.formatDuration
export const formatCurrency = TimeTracking.formatCurrency
export const calculateWeeklyOvertime = TimeTracking.calculateWeeklyOvertime
export const validateTimeEntry = TimeTracking.validateTimeEntry
