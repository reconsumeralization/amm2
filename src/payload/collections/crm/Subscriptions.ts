// src/payload/collections/Subscriptions.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'stripeSubscriptionId',
    group: 'Billing',
    description: 'Manage customer subscriptions and recurring payments',
    defaultColumns: ['stripeSubscriptionId', 'customer', 'status', 'plan', 'currentPeriodEnd', 'updatedAt'],
    listSearchableFields: ['stripeSubscriptionId', 'customer.email', 'customer.name'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      if (req.user.role === 'manager') return true // Managers need to view subscriptions
      // Customers can only view their own subscriptions
      return { customer: { equals: req.user.id } }
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes(req.user.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      if (req.user.role === 'manager') return true // Managers can update subscriptions
      return false
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }

        // Auto-set createdBy
        if (operation === 'create' && !data.createdBy && req.user) {
          data.createdBy = req.user.id
        }

        // Validate subscription dates
        if (data.currentPeriodStart && data.currentPeriodEnd) {
          const start = new Date(data.currentPeriodStart)
          const end = new Date(data.currentPeriodEnd)
          if (start >= end) {
            throw new Error('Current period end must be after start date')
          }
        }

        // Auto-calculate next billing date
        if (data.currentPeriodEnd && !data.nextBillingDate) {
          data.nextBillingDate = data.currentPeriodEnd
        }

        // Auto-set trial end if not provided
        if (operation === 'create' && data.status === 'trialing' && !data.trialEnd) {
          const trialEnd = new Date()
          trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial default
          data.trialEnd = trialEnd
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New subscription created: ${doc.stripeSubscriptionId} for customer ${doc.customer}`)
        }

        if (operation === 'update' && previousDoc) {
          // Handle status changes
          if (doc.status !== previousDoc.status) {
            console.log(`Subscription ${doc.stripeSubscriptionId} status changed: ${previousDoc.status} → ${doc.status}`)

            if (doc.status === 'canceled' && previousDoc.status !== 'canceled') {
              console.log(`Subscription cancelled: ${doc.stripeSubscriptionId}`)
              // TODO: Send cancellation email
            }

            if (doc.status === 'past_due' && previousDoc.status !== 'past_due') {
              console.log(`Subscription payment failed: ${doc.stripeSubscriptionId}`)
              // TODO: Send payment failure notification
            }
          }

          // Handle plan changes
          if (doc.plan !== previousDoc.plan) {
            console.log(`Subscription plan changed: ${previousDoc.plan} → ${doc.plan}`)
            // TODO: Send plan change confirmation
          }
        }

        // Update customer subscription status
        if (doc.customer && req.payload) {
          try {
            // This would update the customer's subscription status
            console.log(`Updating customer subscription status for: ${doc.customer}`)
          } catch (error) {
            console.error('Error updating customer subscription status:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      admin: {
        description: 'Customer who owns this subscription',
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stripe subscription ID',
        placeholder: 'sub_1234567890',
      },
      validate: (value: any) => {
        if (!value) return 'Stripe subscription ID is required'
        if (!value.startsWith('sub_')) return 'Invalid Stripe subscription ID format'
        return true
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        description: 'Stripe customer ID',
        placeholder: 'cus_1234567890',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        description: 'Stripe price ID for this subscription',
        placeholder: 'price_1234567890',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Incomplete Expired', value: 'incomplete_expired' },
        { label: 'Trialing', value: 'trialing' },
        { label: 'Active', value: 'active' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paused', value: 'paused' },
      ],
      defaultValue: 'incomplete',
      admin: {
        description: 'Current subscription status',
      },
    },
    {
      name: 'plan',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Subscription plan name',
        placeholder: 'Pro Plan, Basic Plan, etc.',
      },
    },
    {
      name: 'planId',
      type: 'text',
      admin: {
        description: 'Internal plan identifier',
      },
    },
    {
      name: 'interval',
      type: 'select',
      options: [
        { label: 'Monthly', value: 'month' },
        { label: 'Yearly', value: 'year' },
        { label: 'Weekly', value: 'week' },
      ],
      defaultValue: 'month',
      admin: {
        description: 'Billing interval',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Subscription amount in cents',
        step: 1,
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'usd',
      admin: {
        description: 'Currency code',
      },
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
      required: true,
      admin: {
        description: 'Start date of current billing period',
      },
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'End date of current billing period',
      },
    },
    {
      name: 'nextBillingDate',
      type: 'date',
      admin: {
        description: 'Next billing date',
      },
    },
    {
      name: 'trialStart',
      type: 'date',
      admin: {
        description: 'Trial period start date',
      },
    },
    {
      name: 'trialEnd',
      type: 'date',
      admin: {
        description: 'Trial period end date',
      },
    },
    {
      name: 'canceledAt',
      type: 'date',
      admin: {
        description: 'Date when subscription was canceled',
      },
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Cancel subscription at period end',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Tenant this subscription belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata from Stripe',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this subscription record',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this subscription',
      },
    },
    {
      name: 'webhooks',
      type: 'array',
      admin: {
        description: 'Webhook events received for this subscription',
      },
      fields: [
        {
          name: 'eventType',
          type: 'text',
          required: true,
        },
        {
          name: 'eventId',
          type: 'text',
          required: true,
        },
        {
          name: 'receivedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
        },
        {
          name: 'data',
          type: 'json',
        },
      ],
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['stripeSubscriptionId'] },
    { fields: ['customer', 'status'] },
    { fields: ['status', 'currentPeriodEnd'] },
    { fields: ['tenant', 'status'] },
  ],
}
