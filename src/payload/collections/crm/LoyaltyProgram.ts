import type { CollectionConfig, FieldHook } from 'payload'
import { yoloMonitoring } from '../../lib/monitoring'

export const LoyaltyProgram: CollectionConfig = {
  slug: 'loyalty-program',
  labels: {
    singular: 'Loyalty Program',
    plural: 'Loyalty Programs',
  },
  admin: {
    useAsTitle: 'customerName',
    description: 'Manage customer loyalty points and rewards program',
    group: 'Customers',
    defaultColumns: ['customerName', 'points', 'tier', 'status', 'lastActivity', 'updatedAt'],
    listSearchableFields: ['customerName', 'notes'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      const userRole = req.user.role
      if (userRole === 'admin' || userRole === 'manager') return true
      if (userRole === 'barber') return true // Barbers need to view loyalty info
      return false
    },
    create: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin' || req.user.role === 'manager'
    },
    update: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin' || req.user.role === 'manager'
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-calculate tier based on points
        if (data.points !== undefined) {
          const previousTier = data.tier
          if (data.points >= 10000) {
            data.tier = 'platinum'
          } else if (data.points >= 5000) {
            data.tier = 'gold'
          } else if (data.points >= 1000) {
            data.tier = 'silver'
          } else {
            data.tier = 'bronze'
          }

          // Track tier changes
          if (previousTier && previousTier !== data.tier) {
            data.tierChangeDate = new Date()
          }
        }

        // Update last activity when points change
        if (operation === 'update' && data.points !== undefined) {
          data.lastActivity = new Date()
        }

        // Auto-set point expiration date (1 year from now)
        if (operation === 'create' && !data.pointsExpireAt) {
          const expirationDate = new Date()
          expirationDate.setFullYear(expirationDate.getFullYear() + 1)
          data.pointsExpireAt = expirationDate
        }

        // Handle referral bonuses
        if (operation === 'create' && data.referredBy && req?.payload) {
          // Award bonus points to referrer
          const bonusPoints = 500 // 500 points for successful referral
          const referralBonus = {
            customer: data.referredBy,
            points: bonusPoints,
            reason: 'Referral bonus',
            type: 'earned',
            source: 'referral',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          }

          // Note: In a real implementation, you'd want to update the referrer's points
          // This is a simplified example - you'd typically have a separate points transaction system
          data.referralBonus = bonusPoints
        }

        // Validate redemption amounts
        if (data.redemptions && Array.isArray(data.redemptions)) {
          const totalRedeemed = data.redemptions.reduce((sum: number, redemption: any) => {
            return sum + (redemption.pointsUsed || 0)
          }, 0)

          if (totalRedeemed > (data.points || 0)) {
            throw new Error('Total redemption points cannot exceed available points')
          }

          // Validate redemption limits based on tier
          const maxRedemptionPerMonth = {
            bronze: 1000,
            silver: 2500,
            gold: 5000,
            platinum: 10000
          }

          const tierLimit = maxRedemptionPerMonth[data.tier as keyof typeof maxRedemptionPerMonth] || 1000

          const monthlyRedemptions = data.redemptions.filter((redemption: any) => {
            const redemptionDate = new Date(redemption.createdAt)
            const now = new Date()
            return redemptionDate.getMonth() === now.getMonth() &&
                   redemptionDate.getFullYear() === now.getFullYear()
          }).reduce((sum: number, redemption: any) => sum + (redemption.pointsUsed || 0), 0)

          if (monthlyRedemptions > tierLimit) {
            throw new Error(`Monthly redemption limit of ${tierLimit} points exceeded for ${data.tier} tier`)
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, previousDoc }) => {
        // Track loyalty program operations
        yoloMonitoring.trackCollectionOperation('loyalty-program', operation, doc.id)
        
        if (operation === 'create') {
          yoloMonitoring.trackOperation('loyalty_program_created', { 
            customerId: doc.customer,
            initialPoints: doc.points || 0,
            tier: doc.tier 
          })
        }
        
        if (operation === 'update' && previousDoc) {
          // Track tier changes
          if (previousDoc.tier !== doc.tier) {
            yoloMonitoring.trackOperation('loyalty_tier_changed', {
              customerId: doc.customer,
              previousTier: previousDoc.tier,
              newTier: doc.tier,
              points: doc.points
            })
          }
          
          // Track point changes
          if (previousDoc.points !== doc.points) {
            const pointsDifference = (doc.points || 0) - (previousDoc.points || 0)
            yoloMonitoring.trackOperation('loyalty_points_changed', {
              customerId: doc.customer,
              pointsChange: pointsDifference,
              totalPoints: doc.points,
              tier: doc.tier
            })
          }
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        yoloMonitoring.trackCollectionOperation('loyalty-program', 'delete', doc.id)
        yoloMonitoring.trackOperation('loyalty_program_deleted', { 
          customerId: doc.customer,
          finalPoints: doc.points,
          tier: doc.tier 
        })
      }
    ],
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Link to customer account',
      },
      validate: async (value: any, { req }: { req: any }) => {
        if (!value) return 'Customer is required'
        
        // Check if customer already has a loyalty program
        if (req.payload) {
          try {
            const existing = await req.payload.find({
              collection: 'loyalty-program',
              where: {
                customer: { equals: value as string },
              },
              limit: 1,
            })
            
            if (existing.docs.length > 0) {
              return 'Customer already has a loyalty program'
            }
          } catch (error) {
            // Allow creation if check fails
          }
        }
        
        return true
      },
    },
    {
      name: 'customerName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Customer name for display purposes',
      },
      hooks: {
        beforeChange: [
          async ({ siblingData, req }) => {
            if (siblingData.customer && req.payload) {
              try {
                const customer = await req.payload.findByID({
                  collection: 'customers',
                  id: siblingData.customer as string,
                })
                return `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Unknown Customer'
              } catch (error) {
                return 'Unknown Customer'
              }
            }
            return siblingData.customerName
          },
        ],
      },
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        description: 'Total loyalty points accumulated',
        step: 1,
      },
      validate: (value: number | null | undefined) => {
        if (value !== null && value !== undefined && value < 0) {
          return 'Points cannot be negative'
        }
        return true
      },
    },
    {
      name: 'tier',
      type: 'select',
      defaultValue: 'bronze',
      index: true,
      options: [
        {
          label: 'Bronze (0-999 points)',
          value: 'bronze',
        },
        {
          label: 'Silver (1,000-4,999 points)',
          value: 'silver',
        },
        {
          label: 'Gold (5,000-9,999 points)',
          value: 'gold',
        },
        {
          label: 'Platinum (10,000+ points)',
          value: 'platinum',
        },
      ],
      admin: {
        description: 'Loyalty tier based on points (auto-calculated)',
        readOnly: true,
      },
    },
    {
      name: 'tierChangeDate',
      type: 'date',
      admin: {
        description: 'Date of last tier change',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      index: true,
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Suspended',
          value: 'suspended',
        },
      ],
      admin: {
        description: 'Current status of the loyalty program membership',
      },
    },
    {
      name: 'joinDate',
      type: 'date',
      defaultValue: () => new Date(),
      index: true,
      admin: {
        description: 'Date when customer joined the loyalty program',
      },
    },
    {
      name: 'lastActivity',
      type: 'date',
      index: true,
      admin: {
        description: 'Date of last point earning activity',
      },
    },
    {
      name: 'lifetimePoints',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Total points earned throughout membership (including redeemed)',
        readOnly: true,
      },
    },
    {
      name: 'totalRedeemed',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Total points redeemed for rewards',
        readOnly: true,
      },
    },
    {
      name: 'referralCode',
      type: 'text',
      unique: true,
      admin: {
        description: 'Unique referral code for this customer',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          (({ siblingData, value }) => {
            if (!value && siblingData.customer) {
              // Generate referral code based on customer ID
              return `REF${siblingData.customer?.toString().slice(-6).toUpperCase()}`
            }
            return value
          }) as FieldHook,
        ],
      },
    },
    {
      name: 'referredBy',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        description: 'Customer who referred this member',
        position: 'sidebar',
      },
    },
    {
      name: 'history',
      type: 'array',
      admin: {
        description: 'Complete history of point transactions',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          admin: {
            description: 'Date of the transaction',
          },
        },
        {
          name: 'activity',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Purchase',
              value: 'purchase',
            },
            {
              label: 'Referral',
              value: 'referral',
            },
            {
              label: 'Bonus',
              value: 'bonus',
            },
            {
              label: 'Redemption',
              value: 'redemption',
            },
            {
              label: 'Adjustment',
              value: 'adjustment',
            },
            {
              label: 'Expiration',
              value: 'expiration',
            },
            {
              label: 'Welcome Bonus',
              value: 'welcome_bonus',
            },
            {
              label: 'Birthday Bonus',
              value: 'birthday_bonus',
            },
          ],
          admin: {
            description: 'Type of activity that generated points',
          },
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          admin: {
            description: 'Additional details about the transaction',
            placeholder: 'e.g., "Haircut service - $50"',
          },
        },
        {
          name: 'points',
          type: 'number',
          required: true,
          admin: {
            description: 'Points earned or deducted (use negative for deductions)',
          },
        },
        {
          name: 'runningTotal',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Total points after this transaction',
          },
        },
        {
          name: 'reference',
          type: 'text',
          admin: {
            description: 'Reference ID (order number, appointment ID, etc.)',
            placeholder: 'ORDER-123 or APPT-456',
          },
        },
        {
          name: 'processedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Staff member who processed this transaction',
          },
        },
      ],
    },
    {
      name: 'rewards',
      type: 'array',
      admin: {
        description: 'Rewards earned and redeemed',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'rewardType',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Free Service',
              value: 'free_service',
            },
            {
              label: 'Discount Percentage',
              value: 'discount_percentage',
            },
            {
              label: 'Discount Amount',
              value: 'discount_amount',
            },
            {
              label: 'Product',
              value: 'product',
            },
            {
              label: 'Gift Card',
              value: 'gift_card',
            },
            {
              label: 'Priority Booking',
              value: 'priority_booking',
            },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Reward title',
            placeholder: 'e.g., "Free Haircut" or "20% Off Next Service"',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Detailed description of the reward',
          },
        },
        {
          name: 'value',
          type: 'number',
          admin: {
            description: 'Monetary value or percentage (for discounts)',
          },
        },
        {
          name: 'pointsCost',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Points required to redeem this reward',
          },
        },
        {
          name: 'earnedDate',
          type: 'date',
          defaultValue: () => new Date(),
          admin: {
            description: 'Date when reward was earned',
          },
        },
        {
          name: 'redeemedDate',
          type: 'date',
          admin: {
            description: 'Date when reward was redeemed (if applicable)',
          },
        },
        {
          name: 'expiryDate',
          type: 'date',
          admin: {
            description: 'Expiration date for the reward',
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'available',
          options: [
            {
              label: 'Available',
              value: 'available',
            },
            {
              label: 'Redeemed',
              value: 'redeemed',
            },
            {
              label: 'Expired',
              value: 'expired',
            },
            {
              label: 'Cancelled',
              value: 'cancelled',
            },
          ],
        },
        {
          name: 'redeemedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Staff member who processed the redemption',
          },
        },
        {
          name: 'appointmentReference',
          type: 'text',
          admin: {
            description: 'Appointment ID where reward was used',
          },
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        description: 'Customer loyalty program preferences',
      },
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive email notifications for points and rewards',
          },
        },
        {
          name: 'smsNotifications',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Receive SMS notifications for points and rewards',
          },
        },
        {
          name: 'birthdayRewards',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive birthday bonus points',
          },
        },
        {
          name: 'referralRewards',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Earn points for successful referrals',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this loyalty program member',
        placeholder: 'Add any special notes or preferences...',
      },
    },
  ],
}
