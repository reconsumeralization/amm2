// src/payload/collections/Invoices.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Invoices: CollectionConfig = withDefaultHooks({
  slug: 'invoices',
  admin: {
    useAsTitle: 'invoiceId',
    group: 'Billing',
    description: 'Manage invoices and payment records',
    defaultColumns: ['invoiceId', 'customer', 'order', 'amount', 'status', 'createdAt'],
    listSearchableFields: ['invoiceId', '(customer as any)?.email', 'customer.name'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }: any): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true; // Managers need to view invoices
      // Customers can only view their own invoices
      return { customer: { equals: req.user.id } };
    },
    create: ({ req }: any): any => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes((req.user as any)?.role);
    },
    update: ({ req }: any): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true; // Managers can update invoices
      return false;
    },
    delete: ({ req }: any): any => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin';
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Auto-generate invoice ID if not provided
        if (operation === 'create' && !data.invoiceId) {
          const timestamp = Date.now().toString().slice(-8)
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.invoiceId = `INV-${timestamp}-${random}`
        }

        // Auto-set createdBy
        if (operation === 'create' && !data.createdBy && req.user) {
          data.createdBy = req.user.id
        }

        // Auto-set due date if not provided
        if (operation === 'create' && !data.dueDate) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 30) // 30 days payment terms
          data.dueDate = dueDate
        }

        // Auto-set status for new invoices
        if (operation === 'create' && !data.status) {
          data.status = 'draft'
        }

        // Validate amounts
        if (data.amount && data.amount < 0) {
          throw new Error('Invoice amount cannot be negative')
        }

        if (data.tax && data.tax < 0) {
          throw new Error('Tax amount cannot be negative')
        }

        if (data.discount && data.discount < 0) {
          throw new Error('Discount amount cannot be negative')
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req, previousDoc }: any) => {
        if (operation === 'create') {
          console.log(`New invoice created: ${doc.invoiceId} for $${doc.amount / 100}`)
        }

        if (operation === 'update' && previousDoc) {
          // Handle status changes
          if (doc.status !== previousDoc.status) {
            console.log(`Invoice ${doc.invoiceId} status changed: ${previousDoc.status} → ${doc.status}`)

            if (doc.status === 'paid' && previousDoc.status !== 'paid') {
              console.log(`Invoice ${doc.invoiceId} marked as paid`)
              // TODO: Send payment confirmation email
            }

            if (doc.status === 'overdue' && previousDoc.status !== 'overdue') {
              console.log(`Invoice ${doc.invoiceId} is now overdue`)
              // TODO: Send overdue notice
            }

            if (doc.status === 'sent' && previousDoc.status === 'draft') {
              console.log(`Invoice ${doc.invoiceId} sent to customer`)
              // TODO: Send invoice email to customer
            }
          }

          // Handle amount changes
          if (doc.amount !== previousDoc.amount) {
            console.log(`Invoice ${doc.invoiceId} amount changed: $${previousDoc.amount / 100} → $${doc.amount / 100}`)
          }
        }

        // Update customer invoice count/statistics
        if (doc.customer && req.payload) {
          try {
            // This would update customer invoice statistics
            console.log(`Updating invoice statistics for customer: ${doc.customer}`)
          } catch (error) {
            console.error('Error updating customer invoice statistics:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'invoiceId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique invoice identifier',
        placeholder: 'INV-12345678-ABCD',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Customer this invoice is for',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders' as any as any,
      index: true,
      admin: {
        description: 'Order this invoice is for (if applicable)',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments' as any as any,
      admin: {
        description: 'Appointment this invoice is for (if applicable)',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Invoice amount in cents (e.g., 2999 for $29.99)',
        step: 1,
      },
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'USD', value: 'usd' },
        { label: 'EUR', value: 'eur' },
        { label: 'GBP', value: 'gbp' },
        { label: 'CAD', value: 'cad' },
      ],
      defaultValue: 'usd',
      required: true,
      admin: {
        description: 'Currency for this invoice',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partially Paid', value: 'partially_paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Void', value: 'void' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'Current status of the invoice',
      },
    },
    {
      name: 'invoiceDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        description: 'Date the invoice was created',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Date payment is due',
      },
    },
    {
      name: 'paidDate',
      type: 'date',
      admin: {
        description: 'Date payment was received',
        condition: (data: any) => data?.status === 'paid',
      },
    },
    {
      name: 'tax',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Tax amount in cents',
        step: 1,
      },
    },
    {
      name: 'discount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Discount amount in cents',
        step: 1,
      },
    },
    {
      name: 'shipping',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Shipping amount in cents',
        step: 1,
      },
    },
    {
      name: 'subtotal',
      type: 'number',
      min: 0,
      admin: {
        description: 'Subtotal before tax/discount/shipping',
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Tenant this invoice belongs to',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
    },
    {
      name: 'paymentMethod',
      type: 'text',
      admin: {
        description: 'Payment method used',
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      admin: {
        description: 'Payment processor transaction ID',
      },
    },
    {
      name: 'lineItems',
      type: 'array',
      admin: {
        description: 'Detailed line items for this invoice',
      },
      fields: [
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'taxRate',
          type: 'number',
          min: 0,
          max: 100,
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes for this invoice',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who created this invoice',
        readOnly: true,
      },
    },
    {
      name: 'pdfUrl',
      type: 'text',
      admin: {
        description: 'URL to generated PDF invoice',
        readOnly: true,
      },
    },
    {
      name: 'emailHistory',
      type: 'array',
      admin: {
        description: 'History of emails sent for this invoice',
        readOnly: true,
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Invoice Sent', value: 'sent' },
            { label: 'Payment Reminder', value: 'reminder' },
            { label: 'Overdue Notice', value: 'overdue' },
            { label: 'Payment Confirmation', value: 'confirmation' },
          ],
          required: true,
        },
        {
          name: 'sentAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
        },
        {
          name: 'recipient',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['invoiceId'] },
    { fields: ['customer', 'status'] },
    { fields: ['status', 'dueDate'] },
    { fields: ['tenant', 'status'] },
    { fields: ['order'] },
  ],
})
