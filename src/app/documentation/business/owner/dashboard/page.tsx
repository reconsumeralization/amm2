import { Metadata } from 'next'
import { GuideRenderer } from '@/components/documentation/GuideRenderer'
import { InteractiveExample } from '@/components/documentation/InteractiveExample'
import { CodeSnippetRenderer } from '@/components/documentation/CodeSnippetRenderer'

export const metadata: Metadata = {
  title: 'Salon Owner Dashboard Guide - Modern Men Hair Salon',
  description: 'Complete guide to using the salon owner dashboard for business management',
}

const dashboardGuide = {
  metadata: {
    id: 'salon-owner-dashboard',
    title: 'Salon Owner Dashboard Guide',
    description: 'Learn how to effectively use your salon owner dashboard to manage your business',
    author: 'Documentation Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['salon_owner'],
    difficulty: 'beginner' as const,
    estimatedTime: 30,
    tags: ['dashboard', 'business-management', 'analytics'],
    locale: 'en',
    deprecated: false,
  },
  content: {
    introduction: `The salon owner dashboard is your central command center for managing all aspects of your hair salon business. This comprehensive guide will walk you through each section of the dashboard and show you how to leverage its features for optimal business performance.`,
    prerequisites: [
      {
        id: 'business-setup',
        title: 'Complete Business Setup',
        description: 'Your salon profile and initial configuration must be completed',
        required: true,
      },
      {
        id: 'staff-accounts',
        title: 'Staff Accounts Created',
        description: 'At least one staff member account should be set up',
        required: false,
      }
    ],
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Understanding the main dashboard layout and navigation',
        content: `Your dashboard is organized into key business areas:

**Top Navigation Bar**
- Quick access to notifications, settings, and your profile
- Real-time alerts for important business events
- rch functionality for customers, appointments, and staff

**Main Dashboard Sections**
1. **Today's Overview** - Current day's appointments, revenue, and alerts
2. **Revenue Analytics** - Financial performance metrics and trends
3. **Staff Performance** - Employee productivity and scheduling insights
4. **Customer Insights** - Client retention, satisfaction, and booking patterns
5. **Inventory Status** - Product levels and reorder notifications
6. **Quick Actions** - Common tasks like adding appointments or staff`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'dashboard-tour',
            title: 'Interactive Dashboard Tour',
            description: 'Take a guided tour of your dashboard',
            type: 'component-playground' as const,
            configuration: {
              component: 'DashboardTour',
              props: { userRole: 'salon_owner' }
            }
          }
        ]
      },
      {
        id: 'daily-operations',
        title: 'Daily Operations Management',
        description: 'Managing your salon\'s day-to-day operations from the dashboard',
        content: `**Today's Overview Section**

This section provides a real-time snapshot of your salon's current status:

**Appointment Summary**
- Total appointments scheduled for today
- Walk-in availability slots
- No-show and cancellation tracking
- Revenue projections for the day

**Staff Status**
- Who's working today and their schedules
- Break times and availability
- Performance alerts (running late, exceptional service)

**Revenue Tracking**
- Current day's earnings vs. target
- Payment method breakdown (cash, card, digital)
- Outstanding payments and follow-ups needed

**Alerts and Notifications**
- Equipment maintenance reminders
- Low inventory warnings
- Customer feedback requiring attention
- Staff schedule conflicts`,
        codeSnippets: [
          {
            language: 'typescript',
            code: `// Example: Accessing today's metrics
const todaysMetrics = {
  appointments: {
    scheduled: 24,
    completed: 18,
    noShows: 2,
    walkIns: 3
  },
  revenue: {
    current: 1850.00,
    target: 2000.00,
    percentage: 92.5
  },
  staff: {
    working: 4,
    onBreak: 1,
    available: 3
  }
}`,
            description: 'Daily metrics data structure',
            runnable: false
          }
        ],
        interactiveExamples: []
      },
      {
        id: 'revenue-analytics',
        title: 'Revenue Analytics and Reporting',
        description: 'Understanding and using financial analytics to grow your business',
        content: `**Revenue Dashboard Features**

**Performance Metrics**
- Daily, weekly, monthly, and yearly revenue trends
- Service category performance (cuts, styling, treatments)
- Peak hours and sonal patterns
- Average transaction value and customer lifetime value

**Financial Reports**
- Profit and loss statements
- Cash flow analysis
- Tax-ready reports with categorized expenses
- Commission calculations for staff

**Comparative Analysis**
- Year-over-year growth comparisons
- Performance against industry benchmarks
- Goal tracking and achievement metrics

**Actionable Insights**
- Revenue optimization recommendations
- Pricing strategy suggestions
- Service bundling opportunities
- Customer retention improvement areas`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'revenue-chart',
            title: 'Revenue Analytics Demo',
            description: 'Explore interactive revenue charts and reports',
            type: 'component-playground' as const,
            configuration: {
              component: 'RevenueAnalytics',
              props: { timeRange: '30d', userRole: 'salon_owner' }
            }
          }
        ]
      },
      {
        id: 'staff-management',
        title: 'Staff Performance and Scheduling',
        description: 'Managing your team effectively through dashboard insights',
        content: `**Staff Performance Tracking**

**Individual Performance Metrics**
- Revenue generated per stylist
- Customer satisfaction ratings
- Appointment completion rates
- Upselling success rates

**Schedule Management**
- Visual calendar with drag-and-drop scheduling
- Availability management and time-off requests
- Shift coverage and backup planning
- Overtime tracking and cost analysis

**Team Analytics**
- Productivity comparisons
- Training needs identification
- Performance improvement tracking
- Recognition and incentive program management

**Communication Tools**
- Internal messaging system
- Shift announcements and updates
- Performance feedback delivery
- Goal setting and progress tracking`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'customer-insights',
        title: 'Customer Relationship Management',
        description: 'Leveraging customer data to improve service and retention',
        content: `**Customer Analytics Dashboard**

**Client Database Management**
- Comprehensive customer profiles with service history
- Preference tracking and personalization notes
- Contact information and communication preferences
- Loyalty program status and rewards tracking

**Retention Analytics**
- Customer lifetime value calculations
- Churn risk identification and prevention
- Booking frequency patterns
- Satisfaction trend analysis

**Marketing Insights**
- Campaign effectiveness tracking
- Customer acquisition cost analysis
- Referral program performance
- Social media engagement metrics

**Service Optimization**
- Popular service combinations
- sonal demand patterns
- Price sensitivity analysis
- Upselling opportunity identification`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'customer-analytics',
            title: 'Customer Insights Dashboard',
            description: 'Explore customer analytics and retention metrics',
            type: 'component-playground' as const,
            configuration: {
              component: 'CustomerAnalytics',
              props: { timeRange: '90d', userRole: 'salon_owner' }
            }
          }
        ]
      }
    ],
    troubleshooting: [
      {
        id: 'dashboard-loading-slow',
        problem: 'Dashboard loading slowly or timing out',
        solution: 'Check your internet connection and try refreshing the page. If the issue persists, contact support as there may be a server issue.',
        category: 'technical'
      },
      {
        id: 'missing-data',
        problem: 'Revenue or appointment data not showing correctly',
        solution: 'Ensure all staff are properly logging appointments and payments. Check that your POS system integration is working correctly.',
        category: 'data'
      },
      {
        id: 'notification-issues',
        problem: 'Not receiving important business alerts',
        solution: 'Check your notification settings in the profile menu. Ensure your email and phone number are up to date.',
        category: 'notifications'
      }
    ],
    relatedContent: [
      {
        id: 'business-setup',
        title: 'Initial Business Setup Guide',
        description: 'Complete guide to setting up your salon profile',
        url: '/documentation/business/owner/setup',
        type: 'guide'
      },
      {
        id: 'staff-management',
        title: 'Staff Management Guide',
        description: 'Comprehensive staff management and scheduling guide',
        url: '/documentation/business/owner/staff',
        type: 'guide'
      },
      {
        id: 'analytics-training',
        title: 'Analytics Training Course',
        description: 'In-depth training on using business analytics',
        url: '/documentation/business/owner/analytics',
        type: 'course'
      }
    ],
    interactiveExamples: [],
    codeSnippets: []
  },
  validation: {
    reviewed: true,
    reviewedBy: 'Business Team',
    reviewDate: new Date('2024-01-15'),
    accuracy: 95,
    accessibilityCompliant: true,
    lastValidated: new Date('2024-01-15')
  },
  analytics: {
    viewCount: 0,
    completionRate: 0,
    averageRating: 0,
    feedbackCount: 0,
    rchRanking: 85
  },
  versioning: {
    changeHistory: [],
    previousVersions: [],
  }
}

export default function SalonOwnerDashboardPage() {
  return (
    <div className="max-w-4xl">
      <GuideRenderer 
        content={dashboardGuide}
        interactive={true}
        stepByStep={true}
        userRole="salon_owner"
      />
    </div>
  )
}