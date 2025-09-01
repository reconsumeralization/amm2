import { NextRequest, NextResponse } from 'next/server'
import payload from '@/lib/payload'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current-month'

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    // Get payroll records for the period
    const payrollRecords = await payload.find({
      collection: 'payroll',
      where: {
        periodStart: {
          greater_than_equal: startDate.toISOString(),
        },
        periodEnd: {
          less_than_equal: endDate.toISOString(),
        },
      },
      sort: '-createdAt',
      limit: 1000,
    })

    // Calculate stats
    const stats = {
      totalEmployees: new Set(payrollRecords.docs.map(p => p.employee)).size,
      totalGrossPay: payrollRecords.docs.reduce((sum, p) => sum + (p.grossPay || 0), 0),
      totalNetPay: payrollRecords.docs.reduce((sum, p) => sum + (p.netPay || 0), 0),
      pendingPayrolls: payrollRecords.docs.filter(p => p.status === 'pending').length,
      approvedPayrolls: payrollRecords.docs.filter(p => p.status === 'approved').length,
    }

    return NextResponse.json({
      success: true,
      payrollRecords: payrollRecords.docs,
      stats,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Payroll fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { periodStart, periodEnd } = body

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get all active employees
    const employees = await payload.find({
      collection: 'employees',
      where: {
        isActive: { equals: true },
      },
    })

    const payrollRecords = []

    // Generate payroll for each employee
    for (const employee of employees.docs) {
      // Get time entries for the period
      const timeEntries = await payload.find({
        collection: 'time-clock',
        where: {
          employee: { equals: employee.id },
          date: {
            greater_than_equal: periodStart,
            less_than_equal: periodEnd,
          },
          status: { equals: 'completed' },
        },
      })

      // Calculate hours
      const regularHours = timeEntries.docs.reduce((sum, entry) => sum + (entry.regularHours || 0), 0)
      const overtimeHours = timeEntries.docs.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0)

      // Get compensation details
      const hourlyRate = employee.compensation?.hourlyRate || 0
      const overtimeRate = employee.compensation?.overtimeRate || (hourlyRate * 1.5)

      // Calculate earnings
      const regularPay = regularHours * hourlyRate
      const overtimePay = overtimeHours * overtimeRate
      const commission = employee.compensation?.commission || 0
      const bonuses = 0 // Could be calculated from other sources

      const grossPay = regularPay + overtimePay + commission + bonuses

      // Calculate deductions (simplified)
      const federalTax = Math.round(grossPay * 0.12) // 12% federal tax
      const stateTax = Math.round(grossPay * 0.05) // 5% state tax
      const socialSecurity = Math.round(grossPay * 0.062) // 6.2% social security
      const medicare = Math.round(grossPay * 0.0145) // 1.45% medicare

      const totalDeductions = federalTax + stateTax + socialSecurity + medicare
      const netPay = grossPay - totalDeductions

      // Create payroll record
      const payrollRecord = await payload.create({
        collection: 'payroll',
        data: {
          employee: employee.id,
          periodStart,
          periodEnd,
          payDate: new Date(periodEnd),
          earnings: {
            regularHours,
            overtimeHours,
            regularRate: hourlyRate,
            overtimeRate: overtimeRate,
            regularPay,
            overtimePay,
            commission,
            bonuses,
          },
          deductions: {
            federalIncomeTax: federalTax,
            stateIncomeTax: stateTax,
            socialSecurity,
            medicare,
          },
          grossPay,
          totalDeductions,
          netPay,
          status: 'pending',
          timeEntries: timeEntries.docs.map(entry => entry.id),
        },
      })

      payrollRecords.push(payrollRecord)
    }

    return NextResponse.json({
      success: true,
      message: `Generated payroll for ${payrollRecords.length} employees`,
      payrollRecords,
    })
  } catch (error) {
    console.error('Payroll generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
