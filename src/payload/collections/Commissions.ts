import { CollectionConfig, AccessArgs } from 'payload'

export const Commissions: CollectionConfig = {
  slug: 'commissions',
  admin: {
    useAsTitle: 'period',
    description: 'Stylist commission tracking and payouts',
    group: 'Business',
    defaultColumns: ['stylist', 'period', 'totalSales', 'commissionAmount', 'status'],
  },
  fields: [
    {
      name: 'stylist',
      type: 'relationship',
      relationTo: 'stylists',
      required: true,
      index: true,
      admin: {
        description: 'Commission recipient',
      },
    },
    {
      name: 'period',
      type: 'group',
      admin: {
        description: 'Commission period',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Period start date',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Period end date',
          },
        },
        {
          name: 'periodName',
          type: 'text',
          admin: {
            description: 'Period name (auto-generated)',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'appointments',
      type: 'array',
      admin: {
        description: 'Appointments included in this commission period',
      },
      fields: [
        {
          name: 'appointment',
          type: 'relationship',
          relationTo: 'appointments',
          required: true,
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
        },
        {
          name: 'saleAmount',
          type: 'number',
          required: true,
          admin: {
            description: 'Sale amount for this service (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'commissionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Commission rate for this service (%)',
          },
        },
        {
          name: 'commissionAmount',
          type: 'number',
          admin: {
            description: 'Commission amount (auto-calculated)',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'summary',
      type: 'group',
      admin: {
        description: 'Commission summary',
      },
      fields: [
        {
          name: 'totalSales',
          type: 'number',
          admin: {
            description: 'Total sales amount (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'totalCommission',
          type: 'number',
          admin: {
            description: 'Total commission amount (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'appointmentCount',
          type: 'number',
          admin: {
            description: 'Number of appointments',
            readOnly: true,
          },
        },
        {
          name: 'serviceCount',
          type: 'number',
          admin: {
            description: 'Number of services performed',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'deductions',
      type: 'array',
      admin: {
        description: 'Commission deductions',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Product Usage', value: 'product-usage' },
            { label: 'Damaged Equipment', value: 'damaged-equipment' },
            { label: 'Late Cancellations', value: 'late-cancellations' },
            { label: 'Client Complaints', value: 'client-complaints' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Deduction amount (in cents)',
          },
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'adjustments',
      type: 'array',
      admin: {
        description: 'Commission adjustments',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Bonus', value: 'bonus' },
            { label: 'Performance Bonus', value: 'performance-bonus' },
            { label: 'Retention Bonus', value: 'retention-bonus' },
            { label: 'Holiday Bonus', value: 'holiday-bonus' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          admin: {
            description: 'Adjustment amount (in cents)',
          },
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'finalCalculation',
      type: 'group',
      admin: {
        description: 'Final commission calculation',
      },
      fields: [
        {
          name: 'baseCommission',
          type: 'number',
          admin: {
            description: 'Base commission before adjustments',
            readOnly: true,
          },
        },
        {
          name: 'totalDeductions',
          type: 'number',
          admin: {
            description: 'Total deductions',
            readOnly: true,
          },
        },
        {
          name: 'totalAdjustments',
          type: 'number',
          admin: {
            description: 'Total adjustments/bonuses',
            readOnly: true,
          },
        },
        {
          name: 'finalAmount',
          type: 'number',
          admin: {
            description: 'Final commission amount',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'payment',
      type: 'group',
      admin: {
        description: 'Payment information',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Calculated', value: 'calculated' },
            { label: 'Approved', value: 'approved' },
            { label: 'Paid', value: 'paid' },
            { label: 'Held', value: 'held' },
          ],
        },
        {
          name: 'paymentMethod',
          type: 'select',
          options: [
            { label: 'Direct Deposit', value: 'direct-deposit' },
            { label: 'Check', value: 'check' },
            { label: 'Cash', value: 'cash' },
            { label: 'Payroll', value: 'payroll' },
          ],
        },
        {
          name: 'paymentDate',
          type: 'date',
          admin: {
            description: 'Date commission was paid',
            condition: (data) => data.status === 'paid',
          },
        },
        {
          name: 'paymentReference',
          type: 'text',
          admin: {
            description: 'Check number, transaction ID, etc.',
            condition: (data) => data.status === 'paid',
          },
        },
        {
          name: 'paidAmount',
          type: 'number',
          admin: {
            description: 'Actual amount paid',
            condition: (data: { payment?: { status?: string } }) => data.payment?.status === 'paid',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Additional notes and comments',
      },
    },
    {
      name: 'calculatedAt',
      type: 'date',
      admin: {
        description: 'When commission was calculated',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'When commission was approved',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Who approved this commission',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }: { data?: Partial<CommissionData> }): Promise<Partial<CommissionData>> => {
        // Type assertion to handle partial data
        const commissionData = data as CommissionData

        // Initialize required fields if they don't exist
        if (!commissionData.summary) {
          commissionData.summary = {
            totalSales: 0,
            totalCommission: 0,
            appointmentCount: 0,
            serviceCount: 0,
          }
        }

        if (!commissionData.finalCalculation) {
          commissionData.finalCalculation = {
            baseCommission: 0,
            totalDeductions: 0,
            totalAdjustments: 0,
            finalAmount: 0,
          }
        }

        // Generate period name
        if (commissionData.period?.startDate && commissionData.period?.endDate) {
          const start = new Date(commissionData.period.startDate)
          const end = new Date(commissionData.period.endDate)
          commissionData.period.periodName = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
        }

        // Calculate appointment-level commissions
        if (commissionData.appointments) {
          for (const appointment of commissionData.appointments) {
            if (appointment.saleAmount && appointment.commissionRate) {
              appointment.commissionAmount = Math.round((appointment.saleAmount * appointment.commissionRate) / 100)
            }
          }
        }

        // Calculate summary totals
        if (commissionData.appointments) {
          commissionData.summary.totalSales = commissionData.appointments.reduce((total: number, apt: AppointmentData) => total + (apt.saleAmount || 0), 0)
          commissionData.summary.totalCommission = commissionData.appointments.reduce((total: number, apt: AppointmentData) => total + (apt.commissionAmount || 0), 0)
          commissionData.summary.appointmentCount = new Set(commissionData.appointments.map((apt: AppointmentData) => apt.appointment)).size
          commissionData.summary.serviceCount = commissionData.appointments.length
        }

        // Calculate final amounts
        const baseCommission = commissionData.summary.totalCommission || 0
        const totalDeductions = commissionData.deductions?.reduce((total: number, ded: DeductionData) => total + ded.amount, 0) || 0
        const totalAdjustments = commissionData.adjustments?.reduce((total: number, adj: AdjustmentData) => total + adj.amount, 0) || 0

        commissionData.finalCalculation = {
          baseCommission,
          totalDeductions,
          totalAdjustments,
          finalAmount: baseCommission - totalDeductions + totalAdjustments,
        }

        // Set calculated timestamp
        if (!commissionData.calculatedAt) {
          commissionData.calculatedAt = new Date()
        }

        return commissionData
      },
    ],
    afterChange: [
      ({ doc, operation }: { doc: CommissionData; operation: string }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Commission calculated for period: ${doc.period?.periodName}`)
        }
      },
    ],
  },
  access: {
    read: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      const userData = user as unknown as UserData
      if (userData.role === 'admin' || userData.role === 'manager') return true
      // Stylists can only see their own commissions
      return { stylist: { equals: userData.id } }
    },
    create: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      const userData = user as unknown as UserData
      return userData.role === 'admin' || userData.role === 'manager'
    },
    update: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      const userData = user as unknown as UserData
      return userData.role === 'admin' || userData.role === 'manager'
    },
    delete: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      const userData = user as unknown as UserData
      return userData.role === 'admin'
    },
  },
  timestamps: true,
}

// Type definitions for better type safety
interface UserData {
  id: string
  role: 'admin' | 'manager' | 'staff' | 'stylist'
}

interface AppointmentData {
  appointment: string
  service: string
  saleAmount?: number
  commissionRate?: number
  commissionAmount?: number
}

interface DeductionData {
  amount: number
}

interface AdjustmentData {
  amount: number
}

interface CommissionData {
  period?: {
    startDate?: string | Date
    endDate?: string | Date
    periodName?: string
  }
  appointments?: AppointmentData[]
  summary: {
    totalSales: number
    totalCommission: number
    appointmentCount: number
    serviceCount: number
  }
  deductions?: DeductionData[]
  adjustments?: AdjustmentData[]
  finalCalculation: {
    baseCommission: number
    totalDeductions: number
    totalAdjustments: number
    finalAmount: number
  }
  calculatedAt?: Date
}
