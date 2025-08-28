import { Metadata } from 'next'
import { GuideRenderer } from '@/components/documentation/GuideRenderer'
import { InteractiveExample } from '@/components/documentation/InteractiveExample'
import { UserRole } from '@/types/documentation'

export const metadata: Metadata = {
  title: 'Customer Service Protocols - Employee Operations',
  description: 'Professional customer service standards and communication guidelines for salon employees',
}

const customerServiceGuide = {
  metadata: {
    id: 'customer-service-protocols',
    title: 'Customer Service Protocols',
    description: 'Professional standards and techniques for exceptional customer service',
    author: 'Customer Experience Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['salon_employee' as UserRole],
    difficulty: 'intermediate' as const,
    estimatedTime: 40,
    tags: ['customer-service', 'communication', 'protocols'],
    locale: 'en',
    deprecated: false,
  },
  content: {
    introduction: `Exceptional customer service is the foundation of our salon's success. This guide provides comprehensive protocols and techniques to ensure every customer receives professional, personalized, and memorable service that encourages loyalty and positive word-of-mouth referrals.`,
    prerequisites: [
      {
        id: 'communication-training',
        title: 'Communication Skills Training',
        description: 'Basic training in professional communication and active listening',
        required: true,
      },
      {
        id: 'product-knowledge',
        title: 'Product and Service Knowledge',
        description: 'Understanding of all salon services and retail products',
        required: true,
      },
      {
        id: 'conflict-resolution',
        title: 'Conflict Resolution Training',
        description: 'Training in handling difficult situations and complaints',
        required: false,
      }
    ],
    steps: [
      {
        id: 'customer-interaction-standards',
        title: 'Customer Interaction Standards',
        description: 'Professional standards for all customer interactions',
        content: `**The CARE Approach**

**C - Connect**
- Make genuine eye contact and smile warmly
- Use the customer's name throughout the interaction
- Show authentic interest in their needs and preferences
- Create a welcoming and comfortable atmosphere

**A - Assess**
- Listen actively to understand their requests and concerns
- Ask clarifying questions to ensure complete understanding
- Evaluate their hair condition, lifestyle, and maintenance preferences
- Consider their budget and time constraints

**R - Recommend**
- Provide professional recommendations based on assessment
- Explain the benefits of suggested services or products
- Offer alternatives that fit different budgets or time frames
- Be honest about realistic expectations and outcomes

**E - Execute**
- Deliver services with attention to detail and quality
- Maintain communication throughout the service process
- Ensure customer comfort and satisfaction at each step
- Follow up to confirm satisfaction with the results

**Communication Guidelines**

**Verbal Communication**
- Speak clearly and at an appropriate volume
- Use professional language while remaining friendly and approachable
- Avoid technical jargon unless explaining it in simple terms
- Match your communication style to the customer's preference

**Non-Verbal Communication**
- Maintain good posture and professional appearance
- Use open body language and avoid crossing arms
- Show active listening through nodding and appropriate responses
- Respect personal space while being attentive

**Phone Etiquette**
- Answer within 3 rings with a professional greeting
- Speak clearly and smile (it comes through in your voice)
- Take detailed messages and repeat back important information
- End calls professionally and ensure customer satisfaction`,
        codeSnippets: [
          {
            language: 'typescript',
            code: `// Customer interaction tracking
interface CustomerInteraction {
  customerId: string;
  interactionType: 'greeting' | 'consultation' | 'service' | 'checkout';
  timestamp: Date;
  employeeId: string;
  notes: string;
  satisfactionRating?: number;
  followUpRequired: boolean;
}

// Example interaction logging
const logInteraction = (interaction: CustomerInteraction) => {
  // Log customer interaction for quality tracking
  console.log(\`Interaction logged: \${interaction.interactionType} with customer \${interaction.customerId}\`);
};`,
            description: 'Customer interaction tracking system',
            runnable: false
          }
        ],
        interactiveExamples: [
          {
            id: 'communication-scenarios',
            title: 'Customer Communication Scenarios',
            description: 'Practice different customer interaction scenarios',
            type: 'component-playground' as const,
            configuration: {
              component: 'CommunicationScenarios',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      },
      {
        id: 'complaint-resolution',
        title: 'Complaint Resolution Process',
        description: 'Professional handling of customer complaints and concerns',
        content: `**The LAST Method for Complaint Resolution**

**L - Listen**
- Give the customer your full attention without interrupting
- Make eye contact and use body language that shows you're engaged
- Take notes if the complaint is complex or detailed
- Allow them to fully express their concerns before responding

**A - Apologize**
- Offer a sincere apology for their negative experience
- Acknowledge their feelings and frustration
- Take responsibility without making excuses or blaming others
- Show empathy and understanding for their situation

**S - Solve**
- Work with the customer to find an acceptable solution
- Offer multiple options when possible to give them choice
- Be creative and flexible within company policies
- Escalate to management when necessary for resolution

**T - Thank**
- Thank them for bringing the issue to your attention
- Express appreciation for their patience during resolution
- Confirm their satisfaction with the proposed solution
- Follow up to ensure the solution was implemented successfully

**Common Complaint Categories and Responses**

**Service Quality Issues**
- Acknowledge the concern and assess the situation
- Offer to correct the service immediately if possible
- Provide complimentary services or products as appropriate
- Schedule follow-up appointment with senior stylist if needed

**Scheduling and Wait Time Issues**
- Apologize for the inconvenience and explain the situation
- Offer realistic time estimates and regular updates
- Provide complimentary services (scalp massage, beverage)
- Consider rescheduling with priority booking for next visit

**Pricing and Billing Concerns**
- Review the services provided and pricing structure
- Explain any additional charges clearly and transparently
- Offer payment plans or discounts when appropriate
- Ensure customer understands pricing before future services

**Staff Behavior Concerns**
- Take the complaint seriously and document details
- Apologize on behalf of the salon and staff member
- Escalate to management immediately for investigation
- Follow up to ensure customer satisfaction with resolution`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'complaint-resolution-simulator',
            title: 'Complaint Resolution Simulator',
            description: 'Practice handling various customer complaints',
            type: 'component-playground' as const,
            configuration: {
              component: 'ComplaintResolutionSimulator',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      },
      {
        id: 'upselling-techniques',
        title: 'Professional Upselling Techniques',
        description: 'Ethical and effective techniques to increase service value',
        content: `**The Consultative Upselling Approach**

**Needs-Based Recommendations**
- Focus on genuine customer benefits rather than sales targets
- Identify opportunities during consultation and service
- Explain how additional services enhance the primary service
- Present options that fit within their budget and time constraints

**Timing Your Recommendations**
- **During Consultation**: Suggest complementary services that enhance results
- **During Service**: Recommend treatments that address observed needs
- **At Checkout**: Offer products that maintain the look at home
- **For Next Visit**: Suggest sonal treatments or maintenance services

**Effective Upselling Techniques**

**The Bundle Approach**
- Present services as packages that provide better value
- Explain how services work together for optimal results
- Offer package pricing that saves money compared to individual services
- Create sonal or special occasion packages

**The Maintenance Approach**
- Educate customers about proper hair care and maintenance
- Recommend products and services that extend service life
- Explain the long-term benefits of regular treatments
- Create maintenance schedules that fit their lifestyle

**The Enhancement Approach**
- Suggest services that take their look to the next level
- Offer premium versions of standard services
- Recommend treatments that address specific concerns
- Present options for special events or occasions

**Upselling Best Practices**
1. **Listen First**: Understand their needs before making recommendations
2. **Educate**: Explain the benefits and value of additional services
3. **Offer Choices**: Present multiple options at different price points
4. **Respect Budgets**: Accept "no" gracefully and don't pressure
5. **Follow Up**: Check satisfaction and offer future opportunities

**Common Upselling Opportunities**
- Deep conditioning treatments with haircuts
- Beard grooming services with haircuts
- Scalp treatments for hair health
- Styling products for home maintenance
- Premium service upgrades (senior stylist, extended time)`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'upselling-practice',
            title: 'Upselling Technique Practice',
            description: 'Practice ethical upselling techniques in various scenarios',
            type: 'component-playground' as const,
            configuration: {
              component: 'UpsellingPractice',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      },
      {
        id: 'special-situations',
        title: 'Handling Special Situations',
        description: 'Managing unique customer situations and special needs',
        content: `**VIP and High-Value Customers**

**Recognition and Treatment**
- Greet VIP customers by name and acknowledge their loyalty
- Offer priority scheduling and premium service options
- Remember their preferences and service history
- Provide complimentary amenities (beverages, magazines, Wi-Fi)

**Personalized Service**
- Maintain detailed notes about preferences and dislikes
- Anticipate their needs based on previous visits
- Offer exclusive services or early access to new treatments
- Ensure their favorite stylist is available when possible

**First-Time Customers**

**Creating Great First Impressions**
- Provide extra attention and explanation of services
- Offer a tour of the facility and introduction to staff
- Explain policies, procedures, and what to expect
- Follow up after their visit to ensure satisfaction

**Building Relationships**
- Collect detailed preference information for future visits
- Explain loyalty programs and membership benefits
- Schedule their next appointment before they leave
- Send welcome communications and special offers

**Customers with Special Needs**

**Accessibility Considerations**
- Ensure physical accessibility and comfortable accommodations
- Provide extra time and assistance as needed
- Communicate clearly and patiently
- Respect dignity and independence while offering help

**Language Barriers**
- Speak slowly and clearly, using simple language
- Use visual aids or demonstrations when helpful
- Be patient and allow extra time for communication
- Use translation apps or services when available

**Difficult or Demanding Customers**

**De-escalation Techniques**
- Remain calm and professional regardless of customer behavior
- Listen actively and acknowledge their concerns
- Set clear boundaries while remaining respectful
- Know when to escalate to management

**Managing Expectations**
- Be clear about what services can and cannot achieve
- Explain time requirements and realistic outcomes
- Document interactions for future reference
- Follow salon policies consistently and fairly`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'customer-retention',
        title: 'Customer Retention Strategies',
        description: 'Building long-term relationships and encouraging repeat visits',
        content: `**Building Customer Loyalty**

**Personal Connection**
- Remember personal details and preferences from previous visits
- Ask about their life events, work, and interests appropriately
- Celebrate special occasions (birthdays, promotions, etc.)
- Show genuine interest in their satisfaction and well-being

**Consistent Quality**
- Maintain high service standards for every visit
- Ensure consistency across different staff members
- Document service details for future reference
- Address any quality issues immediately and thoroughly

**Follow-Up Communication**

**Post-Service Follow-Up**
- Call or text within 24-48 hours to check satisfaction
- Address any concerns or questions that arise
- Provide additional styling tips or product usage advice
- Thank them for their business and invite feedback

**Appointment Reminders**
- Send appointment confirmations and reminders
- Offer rescheduling options for conflicts
- Suggest optimal timing for their next service
- Provide sonal service recommendations

**Loyalty Program Engagement**
- Explain loyalty program benefits and point accumulation
- Notify customers when they're close to earning rewards
- Suggest ways to maximize their loyalty benefits
- Celebrate loyalty milestones and anniversaries

**Referral Encouragement**
- Thank customers who refer friends and family
- Provide referral incentives and rewards
- Make it easy to refer others with referral cards or digital sharing
- Follow up with both referrer and new customer

**Retention Metrics to Track**
- Customer return rate and frequency
- Average time between visits
- Customer lifetime value
- Referral rates and success
- Satisfaction scores and feedback trends`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'retention-strategies',
            title: 'Customer Retention Strategy Builder',
            description: 'Learn and practice customer retention techniques',
            type: 'component-playground' as const,
            configuration: {
              component: 'RetentionStrategies',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      }
    ],
    troubleshooting: [
      {
        id: 'angry-customer',
        problem: 'Customer is very angry and raising their voice',
        solution: 'Stay calm, lower your voice, and listen without defending. Acknowledge their feelings, apologize sincerely, and focus on finding a solution. If they remain abusive, politely ask them to lower their voice or escalate to management.',
        category: 'difficult-customers'
      },
      {
        id: 'unrealistic-expectations',
        problem: 'Customer has unrealistic expectations for their service',
        solution: 'Use visual aids (photos, before/after examples) to show realistic outcomes. Explain limitations honestly and offer alternative solutions. Document the conversation to protect both customer and salon.',
        category: 'expectations'
      },
      {
        id: 'payment-disputes',
        problem: 'Customer disputes charges or refuses to pay',
        solution: 'Review the services provided and pricing clearly. Show them the service menu and explain any additional charges. If dispute continues, involve management immediately and document the situation.',
        category: 'billing'
      }
    ],
    relatedContent: [
      {
        id: 'daily-workflow',
        title: 'Daily Workflow Guide',
        description: 'Complete daily operations procedures',
        url: '/documentation/business/employee/daily-workflow',
        type: 'guide'
      },
      {
        id: 'system-usage',
        title: 'System Usage Guide',
        description: 'Using salon management software effectively',
        url: '/documentation/business/employee/system-usage',
        type: 'guide'
      },
      {
        id: 'professional-development',
        title: 'Professional Development',
        description: 'Career growth and skill development resources',
        url: '/documentation/business/employee/professional-development',
        type: 'guide'
      }
    ],
    interactiveExamples: [],
    codeSnippets: []
  },
  validation: {
    reviewed: true,
    reviewedBy: 'Customer Experience Team',
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
    rchRanking: 94
  },
  versioning: {
    changeHistory: [],
    previousVersions: [],
  }
}

export default function CustomerServicePage() {
  return (
    <div className="max-w-4xl">
      <GuideRenderer
        guide={customerServiceGuide}
        interactive={true}
        stepByStep={true}
      />
    </div>
  )
}