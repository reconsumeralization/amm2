import type { CollectionConfig, AccessResult, Where } from 'payload'

export const Commissions: CollectionConfig = {
  slug: 'commissions',
  labels: {
    singular: 'Commission',
    plural: 'Commissions',
  },
  admin: {
    useAsTitle: 'stylist',
    defaultColumns: ['stylist', 'period.periodName', 'summary.totalSales', 'finalCalculation.finalAmount', 'payment.status', 'tenant'],
    group: 'Staff Management',
    description: 'Track and manage stylist commission calculations and payouts',
    listSearchableFields: ['stylist.name', 'stylist.email', 'period.periodName', 'notes'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
    preview: (doc: any) => `${doc.stylist?.name || 'Unknown Stylist'} - ${doc.period?.periodName || 'No Period'} - $${((doc.finalCalculation?.finalAmount || 0) / 100).toFixed(2)}`,
  },
  versions: {
    drafts: false,
    maxPerDoc: 10,
    
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } } as Where
      }
      // Stylists can only see their own commissions
      return { 
        and: [
          { stylist: { equals: req.user.id } },
          { tenant: { equals: (req.user as any)?.tenant?.id } }
        ]
      } as Where
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      if ((req.user as any)?.role === 'manager') {
        return { 
          and: [
            { tenant: { equals: (req.user as any)?.tenant?.id } },
            { 'payment.status': { not_equals: 'paid' } }
          ]
        } as Where
      }
      return false
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      return false
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Generate period name
        if (data.period?.startDate && data.period?.endDate) {
          const start = new Date(data.period.startDate)
          const end = new Date(data.period.endDate)
          data.period.periodName = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
        }

        // Initialize required fields if they don't exist
        if (!data.summary) {
          data.summary = {
            totalSales: 0,
            totalCommission: 0,
            appointmentCount: 0,
            serviceCount: 0,
          }
        }

        if (!data.finalCalculation) {
          data.finalCalculation = {
            baseCommission: 0,
            totalDeductions: 0,
            totalAdjustments: 0,
            finalAmount: 0,
          }
        }

        // Calculate appointment-level commissions
        if (data.appointments) {
          for (const appointment of data.appointments) {
            if (appointment.saleAmount && appointment.commissionRate) {
              appointment.commissionAmount = Math.round((appointment.saleAmount * appointment.commissionRate) / 100)
            }
          }
        }

        // Calculate summary totals
        if (data.appointments) {
          data.summary.totalSales = data.appointments.reduce((total: number, apt: any) => total + (apt.saleAmount || 0), 0)
          data.summary.totalCommission = data.appointments.reduce((total: number, apt: any) => total + (apt.commissionAmount || 0), 0)
          data.summary.appointmentCount = new Set(data.appointments.map((apt: any) => apt.appointment)).size
          data.summary.serviceCount = data.appointments.length
        }

        // Calculate final amounts
        const baseCommission = data.summary.totalCommission || 0
        const totalDeductions = data.deductions?.reduce((total: number, ded: any) => total + (ded.amount || 0), 0) || 0
        const totalAdjustments = data.adjustments?.reduce((total: number, adj: any) => total + (adj.amount || 0), 0) || 0

        data.finalCalculation = {
          baseCommission,
          totalDeductions,
          totalAdjustments,
          finalAmount: baseCommission - totalDeductions + totalAdjustments,
        }

        // Set calculated timestamp
        if (!data.calculatedAt) {
          data.calculatedAt = new Date()
        }

        // Set approval timestamp when status changes to approved
        if (data.payment?.status === 'approved' && !data.approvedAt) {
          data.approvedAt = new Date()
          if (req.user) {
            data.approvedBy = req.user.id
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Commission ${operation}d for ${doc.stylist?.name || 'Unknown Stylist'} - Period: ${doc.period?.periodName || 'No Period'}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Business location for this commission',
      },
      filterOptions: ({ user }) => {
        if (user?.role === 'admin') return true
        return { id: { equals: user?.tenant?.id } }
      },
    },
    {
      name: 'stylist',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Commission recipient',
      },
      filterOptions: ({ data }) => {
        const filters: any = { role: { equals: 'barber' } }
        if (data?.tenant) {
          filters.tenant = { equals: data.tenant }
        }
        return filters
      },
    },
    {
      name: 'period',
      type: 'group',
      admin: {
        description: 'Commission calculation period',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Period start date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Period end date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
          validate: (val, { data }) => {
            if (val && data && 'period' in data && data.period && typeof data.period === 'object' && 'startDate' in data.period && data.period.startDate && new Date(val) <= new Date(data.period.startDate as string)) {
              return 'End date must be after start date'
            }
            return true
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
          relationTo: 'appointments' as any as any,
          required: true,
          filterOptions: ({ data }) => {
            const filters: any = {}
            if (data?.stylist) {
              filters.barber = { equals: data.stylist }
            }
            if (data?.tenant) {
              filters.tenant = { equals: data.tenant }
            }
            if (data?.period?.startDate && data?.period?.endDate) {
              filters.date = {
                greater_than_equal: data.period.startDate,
                less_than_equal: data.period.endDate,
              }
            }
            return filters
          },
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services' as any as any,
          required: true,
          filterOptions: ({ data }) => {
            if (data?.tenant) {
              return { tenant: { equals: data.tenant } }
            }
            return {}
          },
        },
        {
          name: 'saleAmount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Sale amount for this service (in cents)',
            step: 1,
          },
        },
        {
          name: 'commissionRate',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          admin: {
            description: 'Commission rate for this service (%)',
            step: 0.01,
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
        description: 'Commission summary calculations',
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
            description: 'Number of unique appointments',
            readOnly: true,
          },
        },
        {
          name: 'serviceCount',
          type: 'number',
          admin: {
            description: 'Total number of services performed',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'deductions',
      type: 'array',
      admin: {
        description: 'Commission deductions and penalties',
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
            { label: 'No Show Penalty', value: 'no-show-penalty' },
            { label: 'Training Costs', value: 'training-costs' },
            { label: 'Uniform/Supplies', value: 'uniform-supplies' },
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
            step: 1,
          },
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
          admin: {
            description: 'Detailed reason for deduction',
          },
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'approvedBy',
          type: 'relationship',
          relationTo: 'users' as any as any,
          admin: {
            description: 'Manager who approved this deduction',
          },
          filterOptions: () => ({
            role: { in: ['admin', 'manager'] }
          }),
        },
      ],
    },
    {
      name: 'adjustments',
      type: 'array',
      admin: {
        description: 'Commission adjustments and bonuses',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Performance Bonus', value: 'performance-bonus' },
            { label: 'Retention Bonus', value: 'retention-bonus' },
            { label: 'Holiday Bonus', value: 'holiday-bonus' },
            { label: 'Referral Bonus', value: 'referral-bonus' },
            { label: 'Training Completion', value: 'training-completion' },
            { label: 'Customer Satisfaction', value: 'customer-satisfaction' },
            { label: 'Sales Target Achievement', value: 'sales-target' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Adjustment amount (in cents)',
            step: 1,
          },
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
          admin: {
            description: 'Detailed reason for adjustment',
          },
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'approvedBy',
          type: 'relationship',
          relationTo: 'users' as any as any,
          admin: {
            description: 'Manager who approved this adjustment',
          },
          filterOptions: () => ({
            role: { in: ['admin', 'manager'] }
          }),
        },
      ],
    },
    {
      name: 'finalCalculation',
      type: 'group',
      admin: {
        description: 'Final commission calculation breakdown',
      },
      fields: [
        {
          name: 'baseCommission',
          type: 'number',
          admin: {
            description: 'Base commission before adjustments (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'totalDeductions',
          type: 'number',
          admin: {
            description: 'Total deductions (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'totalAdjustments',
          type: 'number',
          admin: {
            description: 'Total adjustments/bonuses (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'finalAmount',
          type: 'number',
          admin: {
            description: 'Final commission amount (in cents)',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'payment',
      type: 'group',
      admin: {
        description: 'Payment processing information',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending Calculation', value: 'pending' },
            { label: 'Calculated', value: 'calculated' },
            { label: 'Under Review', value: 'review' },
            { label: 'Approved for Payment', value: 'approved' },
            { label: 'Processing Payment', value: 'processing' },
            { label: 'Paid', value: 'paid' },
            { label: 'On Hold', value: 'held' },
            { label: 'Disputed', value: 'disputed' },
          ],
          admin: {
            description: 'Current payment status',
          },
        },
        {
          name: 'paymentMethod',
          type: 'select',
          options: [
            { label: 'Direct Deposit', value: 'direct-deposit' },
            { label: 'Check', value: 'check' },
            { label: 'Cash', value: 'cash' },
            { label: 'Payroll Integration', value: 'payroll' },
            { label: 'Digital Wallet', value: 'digital-wallet' },
          ],
          admin: {
            condition: (data) => ['approved', 'processing', 'paid'].includes(data.payment?.status),
          },
        },
        {
          name: 'paymentDate',
          type: 'date',
          admin: {
            description: 'Date commission was paid',
            condition: (data) => data.payment?.status === 'paid',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'paymentReference',
          type: 'text',
          admin: {
            description: 'Check number, transaction ID, confirmation number, etc.',
            condition: (data) => ['processing', 'paid'].includes(data.payment?.status),
          },
        },
        {
          name: 'paidAmount',
          type: 'number',
          admin: {
            description: 'Actual amount paid (in cents)',
            condition: (data) => data.payment?.status === 'paid',
            step: 1,
          },
        },
        {
          name: 'holdReason',
          type: 'textarea',
          admin: {
            description: 'Reason for holding payment',
            condition: (data) => data.payment?.status === 'held',
          },
        },
        {
          name: 'disputeReason',
          type: 'textarea',
          admin: {
            description: 'Reason for dispute',
            condition: (data) => data.payment?.status === 'disputed',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Additional notes, comments, and documentation',
      },
    },
    {
      name: 'calculatedAt',
      type: 'date',
      admin: {
        description: 'When commission was calculated',
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'When commission was approved for payment',
        readOnly: true,
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'Manager who approved this commission',
        position: 'sidebar',
      },
      filterOptions: () => ({
        role: { in: ['admin', 'manager'] }
      }),
    },
  ],
  timestamps: true,
}
