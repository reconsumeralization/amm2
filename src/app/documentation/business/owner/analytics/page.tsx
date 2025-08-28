import { Metadata } from 'next'
import { GuideRenderer } from '@/components/documentation/GuideRenderer'
import { InteractiveExample } from '@/components/documentation/InteractiveExample'

export const metadata: Metadata = {
  title: 'Analytics Training Guide - Modern Men Hair Salon',
  description: 'Comprehensive training on using business analytics to grow your salon',
}

const analyticsTrainingGuide = {
  metadata: {
    id: 'analytics-training-guide',
    title: 'Analytics Training Guide',
    description: 'Master business analytics to make data-driven decisions for your salon',
    author: 'Business Analytics Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['salon_owner'],
    difficulty: 'intermediate' as const,
    estimatedTime: 60,
    tags: ['analytics', 'business-intelligence', 'reporting', 'kpis'],
    locale: 'en',
    deprecated: false,
  },
  content: {
    introduction: `Business analytics are crucial for making informed decisions that drive salon growth and profitability. This comprehensive training guide will teach you how to interpret key metrics, identify trends, and use data insights to optimize your salon operations and increase revenue.`,
    prerequisites: [
      {
        id: 'business-setup-complete',
        title: 'Complete Business Setup',
        description: 'Your salon must be fully configured with services and staff',
        required: true,
      },
      {
        id: 'operational-data',
        title: 'Operational Data',
        description: 'At least 30 days of appointment and transaction data',
        required: true,
      },
      {
        id: 'dashboard-familiarity',
        title: 'Dashboard Familiarity',
        description: 'Basic understanding of the salon owner dashboard',
        required: false,
      }
    ],
    steps: [
      {
        id: 'key-performance-indicators',
        title: 'Understanding Key Performance Indicators (KPIs)',
        description: 'Learn the most important metrics for salon business success',
        content: `**Financial KPIs**

**Revenue Metrics**
- **Total Revenue**: Overall income from all services and products
- **Average Transaction Value (ATV)**: Revenue per customer visit
- **Revenue Per Available Hour**: Efficiency of salon capacity utilization
- **Monthly Recurring Revenue**: Predictable income from memberships/packages

**Profitability Indicators**
- **Gross Profit Margin**: Revenue minus cost of goods sold
- **Net Profit Margin**: Total profit after all expenses
- **Cost Per Acquisition**: Marketing spend to acquire new customers
- **Customer Lifetime Value (CLV)**: Total revenue expected from a customer

**Operational KPIs**

**Efficiency Metrics**
- **Utilization Rate**: Percentage of available appointment slots filled
- **No-Show Rate**: Percentage of appointments not honored by customers
- **Average Service Time**: Time spent per service type
- **Staff Productivity**: Revenue generated per stylist per hour

**Customer Experience KPIs**
- **Customer Satisfaction Score**: Average rating from customer feedback
- **Net Promoter Score (NPS)**: Likelihood of customer recommendations
- **Repeat Customer Rate**: Percentage of customers who return
- **Customer Retention Rate**: Percentage of customers retained over time

**Growth Indicators**
- **New Customer Acquisition Rate**: Rate of gaining new customers
- **Booking Conversion Rate**: Website visitors who book appointments
- **Upselling Success Rate**: Percentage of successful service upgrades
- **Referral Rate**: New customers from existing customer referrals`,
        codeSnippets: [
          {
            language: 'typescript',
            code: `// Example KPI calculation functions
const calculateKPIs = (data: BusinessData) => {
  const avgTransactionValue = data.totalRevenue / data.totalTransactions;
  const utilizationRate = (data.bookedSlots / data.availableSlots) * 100;
  const customerRetentionRate = (data.returningCustomers / data.totalCustomers) * 100;
  
  return {
    avgTransactionValue,
    utilizationRate,
    customerRetentionRate,
    profitMargin: ((data.revenue - data.expenses) / data.revenue) * 100
  };
};`,
            description: 'KPI calculation examples',
            runnable: false
          }
        ],
        interactiveExamples: [
          {
            id: 'kpi-calculator',
            title: 'KPI Calculator',
            description: 'Interactive tool to calculate and understand your salon KPIs',
            type: 'component-playground' as const,
            configuration: {
              component: 'KPICalculator',
              props: { userRole: 'salon_owner' }
            }
          }
        ]
      },
      {
        id: 'revenue-analysis',
        title: 'Revenue Analysis and Forecasting',
        description: 'Deep dive into revenue patterns and growth opportunities',
        content: `**Revenue Trend Analysis**

**Time-Based Analysis**
- **Daily Patterns**: Identify peak and slow days for staffing optimization
- **Weekly Trends**: Understand weekly booking patterns and adjust marketing
- **Monthly Cycles**: Recognize sonal fluctuations and plan accordingly
- **Yearly Growth**: Track long-term business growth and set realistic goals

**Service Performance Analysis**
- **Service Popularity**: Identify most and least requested services
- **Revenue by Service**: Determine which services generate the most income
- **Service Profitability**: Calculate profit margins for each service type
- **Cross-Selling Opportunities**: Analyze service combinations and bundles

**Customer Segmentation Analysis**
- **High-Value Customers**: Identify customers who spend the most
- **Frequency Segments**: Group customers by visit frequency
- **Service Preferences**: Understand customer service preferences
- **Demographic Analysis**: Analyze customer age, location, and preferences

**Forecasting Techniques**
- **Trend Projection**: Use historical data to predict future revenue
- **sonal Adjustments**: Account for sonal variations in forecasts
- **Scenario Planning**: Model different growth scenarios and their impacts
- **Goal Setting**: Set realistic revenue targets based on data insights`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'revenue-forecasting',
            title: 'Revenue Forecasting Tool',
            description: 'Interactive revenue forecasting and scenario planning',
            type: 'component-playground' as const,
            configuration: {
              component: 'RevenueForecastingTool',
              props: { timeRange: '12m', userRole: 'salon_owner' }
            }
          }
        ]
      },
      {
        id: 'customer-analytics',
        title: 'Customer Behavior and Retention Analysis',
        description: 'Understanding your customers to improve retention and satisfaction',
        content: `**Customer Lifecycle Analysis**

**Acquisition Analysis**
- **Customer Sources**: Track where new customers come from
- **Conversion Funnels**: Analyze the path from inquiry to first appointment
- **Acquisition Costs**: Calculate cost per customer by marketing channel
- **Onboarding Success**: Measure new customer experience and retention

**Engagement Patterns**
- **Visit Frequency**: Analyze how often customers return
- **Service Evolution**: Track how customer service preferences change
- **Spending Patterns**: Understand customer spending behavior over time
- **Communication Preferences**: Analyze response to different communication types

**Retention Strategies**
- **Churn Prediction**: Identify customers at risk of leaving
- **Win-Back Campaigns**: Analyze effectiveness of re-engagement efforts
- **Loyalty Program Performance**: Measure loyalty program impact on retention
- **Satisfaction Correlation**: Link satisfaction scores to retention rates

**Customer Value Optimization**
- **Lifetime Value Calculation**: Determine long-term customer worth
- **Upselling Opportunities**: Identify customers ready for premium services
- **Cross-Selling Analysis**: Find complementary service opportunities
- **Price Sensitivity**: Understand customer response to pricing changes`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'customer-segmentation',
            title: 'Customer Segmentation Analysis',
            description: 'Analyze and segment your customer base for targeted strategies',
            type: 'component-playground' as const,
            configuration: {
              component: 'CustomerSegmentationTool',
              props: { userRole: 'salon_owner' }
            }
          }
        ]
      },
      {
        id: 'staff-performance-analytics',
        title: 'Staff Performance and Productivity Analysis',
        description: 'Using data to optimize team performance and scheduling',
        content: `**Individual Performance Metrics**

**Productivity Indicators**
- **Revenue per Hour**: Individual stylist earning efficiency
- **Appointment Completion Rate**: Reliability and time management
- **Customer Satisfaction Scores**: Service quality measurements
- **Upselling Success**: Ability to increase transaction values

**Skill Development Tracking**
- **Service Specializations**: Track stylist expertise areas
- **Training Progress**: Monitor skill development over time
- **Certification Status**: Track professional development milestones
- **Customer Feedback Trends**: Identify areas for improvement

**Team Performance Analysis**
- **Comparative Performance**: Benchmark stylists against team averages
- **Collaboration Metrics**: Measure teamwork and support behaviors
- **Schedule Efficiency**: Analyze optimal staffing patterns
- **Cost per Employee**: Calculate total employment costs vs. revenue

**Optimization Strategies**
- **Schedule Optimization**: Use data to create efficient schedules
- **Training Needs Analysis**: Identify skill gaps and training opportunities
- **Incentive Program Design**: Create data-driven reward systems
- **Performance Improvement Plans**: Use metrics to guide development`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'actionable-insights',
        title: 'Converting Analytics into Business Actions',
        description: 'Learn how to turn data insights into profitable business decisions',
        content: `**Data-Driven Decision Making**

**Pricing Optimization**
- **Price Elasticity Analysis**: Understand customer response to price changes
- **Competitive Pricing**: Use market data to position your services
- **Dynamic Pricing**: Implement time-based or demand-based pricing
- **Package Optimization**: Create profitable service bundles

**Marketing Strategy Development**
- **Channel Performance**: Identify most effective marketing channels
- **Campaign ROI Analysis**: Measure return on marketing investments
- **Customer Acquisition Optimization**: Focus on highest-value customer sources
- **Retention Campaign Targeting**: Use data to identify re-engagement opportunities

**Operational Improvements**
- **Capacity Planning**: Use utilization data to optimize salon capacity
- **Inventory Management**: Analyze product usage patterns for better stocking
- **Service Menu Optimization**: Add or remove services based on performance data
- **Staff Scheduling**: Create data-driven schedules for maximum efficiency

**Growth Planning**
- **Expansion Decisions**: Use market analysis for location or service expansion
- **Investment Priorities**: Allocate resources based on ROI potential
- **Risk Assessment**: Identify and mitigate business risks using data
- **Goal Setting**: Create realistic, data-backed business objectives`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'action-plan-generator',
            title: 'Business Action Plan Generator',
            description: 'Generate actionable business strategies based on your analytics',
            type: 'component-playground' as const,
            configuration: {
              component: 'ActionPlanGenerator',
              props: { userRole: 'salon_owner' }
            }
          }
        ]
      }
    ],
    troubleshooting: [
      {
        id: 'insufficient-data',
        problem: 'Not enough data to generate meaningful analytics',
        solution: 'Ensure all appointments and transactions are being recorded properly. Wait for at least 30 days of consistent data collection before drawing conclusions from analytics.',
        category: 'data'
      },
      {
        id: 'conflicting-metrics',
        problem: 'Different reports showing conflicting information',
        solution: 'Check the date ranges and filters applied to each report. Ensure you\'re comparing like-for-like time periods and customer segments.',
        category: 'reporting'
      },
      {
        id: 'low-performance-metrics',
        problem: 'Analytics showing declining performance',
        solution: 'Don\'t panic - use the data to identify specific areas for improvement. Look for patterns in customer feedback, staff performance, and market conditions that might explain the decline.',
        category: 'performance'
      }
    ],
    relatedContent: [
      {
        id: 'dashboard-guide',
        title: 'Salon Owner Dashboard Guide',
        description: 'Learn to navigate your business dashboard',
        url: '/documentation/business/owner/dashboard',
        type: 'guide'
      },
      {
        id: 'staff-management',
        title: 'Staff Management Guide',
        description: 'Using analytics for team management',
        url: '/documentation/business/owner/staff',
        type: 'guide'
      },
      {
        id: 'customer-retention',
        title: 'Customer Retention Strategies',
        description: 'Advanced customer retention techniques',
        url: '/documentation/business/owner/retention',
        type: 'guide'
      }
    ],
    interactiveExamples: [],
    codeSnippets: []
  },
  validation: {
    reviewed: true,
    reviewedBy: 'Business Analytics Team',
    reviewDate: new Date('2024-01-15'),
    accuracy: 96,
    accessibilityCompliant: true,
    lastValidated: new Date('2024-01-15')
  },
  analytics: {
    viewCount: 0,
    completionRate: 0,
    averageRating: 0,
    feedbackCount: 0,
    rchRanking: 88
  },
  versioning: {
    changeHistory: [],
    previousVersions: [],
  }
}

export default function AnalyticsTrainingPage() {
  return (
    <div className="max-w-4xl">
      <GuideRenderer 
        content={analyticsTrainingGuide}
        interactive={true}
        stepByStep={true}
        userRole="salon_owner"
      />
    </div>
  )
}