import { Metadata } from 'next'
import { GuideRenderer } from '@/components/documentation/GuideRenderer'
import { InteractiveExample } from '@/components/documentation/InteractiveExample'
import { UserRole, GuideContent } from '@/types/documentation'

export const metadata: Metadata = {
  title: 'Daily Workflow Guide - Employee Operations',
  description: 'Complete daily workflow guide for salon employees from opening to closing',
}

const dailyWorkflowGuide: GuideContent = {
  metadata: {
    id: 'employee-daily-workflow',
    title: 'Daily Workflow Guide',
    description: 'Step-by-step guide for daily salon operations and employee responsibilities',
    author: 'Operations Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['salon_employee' as UserRole],
    difficulty: 'beginner' as const,
    estimatedTime: 25,
    tags: ['daily-operations', 'workflow', 'procedures'],
    locale: 'en',
    deprecated: false,
  },
  content: {
    introduction: `This guide provides a comprehensive overview of daily operations for salon employees. Following these procedures ensures consistent service quality, efficient operations, and excellent customer experiences throughout each workday.`,
    prerequisites: [
      {
        id: 'employee-account',
        title: 'Active Employee Account',
        description: 'You must have an active employee account with appropriate permissions',
        required: true,
      },
      {
        id: 'system-training',
        title: 'Basic System Training',
        description: 'Completion of basic salon management system training',
        required: true,
      },
      {
        id: 'safety-training',
        title: 'Safety and Sanitation Training',
        description: 'Current certification in salon safety and sanitation procedures',
        required: true,
      }
    ],
    steps: [
      {
        id: 'opening-procedures',
        title: 'Opening Procedures',
        description: 'Essential tasks to complete when opening the salon',
        content: `**Pre-Opening Checklist (30 minutes before first appointment)**

**Facility Preparation**
1. **Unlock and Disarm**: Safely unlock the salon and disarm security system
2. **Lighting and Climate**: Turn on all lights and adjust temperature to comfortable levels
3. **Music and Ambiance**: Start background music at appropriate volume
4. **Safety Check**: Quick visual inspection for any overnight issues or hazards

**Workstation Setup**
1. **Clean and Sanitize**: Wipe down all surfaces with approved disinfectant
2. **Tool Preparation**: Ensure all tools are clean, sharp, and properly organized
3. **Product Check**: Verify adequate supplies of shampoo, conditioner, styling products
4. **Equipment Test**: Check blow dryers, clippers, and other electrical equipment

**System Startup**
1. **POS System**: Boot up point-of-sale system and verify connectivity
2. **Appointment Calendar**: Review today's schedule and note any special requests
3. **Customer Alerts**: Check for VIP customers, allergies, or special instructions
4. **Staff Communication**: Review any overnight messages or schedule changes

**Reception Area**
1. **Cleanliness**: Ensure waiting area is clean and magazines are current
2. **Refreshments**: Check coffee, water, and light refreshments are available
3. **Retail Display**: Straighten product displays and check price tags
4. **Welcome Setup**: Prepare check-in area with necessary forms and materials`,
codeSnippets: [
          {
            id: 'opening-checklist',
            language: 'typescript',
            code: `// Daily opening checklist data structure
const openingChecklist = {
  facility: [
    { task: "Unlock and disarm security", completed: false, priority: "high" },
    { task: "Turn on lights and adjust climate", completed: false, priority: "medium" },
    { task: "Start background music", completed: false, priority: "low" }
  ],
  workstation: [
    { task: "Clean and sanitize surfaces", completed: false, priority: "high" },
    { task: "Organize tools and supplies", completed: false, priority: "high" },
    { task: "Test equipment functionality", completed: false, priority: "medium" }
  ],
  systems: [
    { task: "Boot POS system", completed: false, priority: "high" },
    { task: "Review appointment schedule", completed: false, priority: "high" },
    { task: "Check customer alerts", completed: false, priority: "medium" }
  ]
}`,
            description: 'Opening checklist structure for tracking completion',
            runnable: false
          }
        ],
        interactiveExamples: [
          {
            id: 'opening-checklist',
            title: 'Interactive Opening Checklist',
            description: 'Digital checklist to track opening procedures',
            type: 'component-playground' as const,
            configuration: {
              component: 'OpeningChecklist',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      },
      {
        id: 'customer-check-in',
        title: 'Customer Check-in Process',
        description: 'Professional customer greeting and check-in procedures',
        content: `**Customer Arrival Protocol**

**Initial Greeting (Within 30 seconds)**
1. **Warm Welcome**: Greet customer by name with a genuine smile
2. **Eye Contact**: Make appropriate eye contact to show attention and respect
3. **Professional Appearance**: Ensure you look professional and well-groomed
4. **Positive Energy**: Project enthusiasm and readiness to provide excellent service

**Check-in Procedure**
1. **Appointment Verification**: Confirm customer name, service, and stylist assignment
2. **Service Review**: Briefly review scheduled services and estimated time
3. **Special Requests**: Ask about any special requests or changes to the service
4. **Health Screening**: Inquire about any allergies, sensitivities, or health concerns

**Preparation Steps**
1. **Coat and Belongings**: Offer to take coat and provide secure storage for belongings
2. **Refreshments**: Offer water, coffee, or other available refreshments
3. **Waiting Area**: If stylist isn't ready, escort to comfortable waiting area
4. **Communication**: Inform stylist of customer arrival and any special notes

**System Updates**
1. **Check-in Status**: Mark customer as arrived in the appointment system
2. **Service Notes**: Add any new information or special requests to customer profile
3. **Time Tracking**: Note actual arrival time for scheduling accuracy
4. **Stylist Notification**: Alert assigned stylist that customer is ready

**Managing Wait Times**
- **Under 5 minutes**: Normal greeting and preparation
- **5-10 minutes**: Apologize for delay, offer refreshments, provide time estimate
- **Over 10 minutes**: Personally apologize, offer rescheduling option, consider service upgrade`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'check-in-simulator',
            title: 'Customer Check-in Simulator',
            description: 'Practice customer check-in scenarios and responses',
            type: 'component-playground' as const,
            configuration: {
              component: 'CheckInSimulator',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      },
      {
        id: 'appointment-management',
        title: 'Appointment Management',
        description: 'Managing appointments, scheduling, and customer flow',
        content: `**Appointment Coordination**

**Schedule Management**
1. **Real-time Updates**: Keep appointment system updated with actual service times
2. **Buffer Management**: Maintain appropriate time buffers between appointments
3. **Walk-in Integration**: Balance walk-in customers with scheduled appointments
4. **Emergency Slots**: Reserve emergency slots for urgent customer needs

**Customer Communication**
1. **Service Updates**: Keep customers informed of any delays or changes
2. **Next Steps**: Explain what happens next in their service journey
3. **Time Estimates**: Provide realistic time estimates for service completion
4. **Follow-up Scheduling**: Discuss and schedule next appointment before they leave

**Scheduling Changes**
1. **Cancellations**: Handle cancellations professionally and offer rescheduling
2. **No-shows**: Follow salon policy for no-show customers and fees
3. **Rescheduling**: Accommodate reasonable rescheduling requests when possible
4. **Overbooking**: Manage overbooking situations with grace and solutions

**Multi-tasking Priorities**
1. **Customer First**: Always prioritize current customer needs
2. **Phone Management**: Answer phones promptly while serving in-person customers
3. **Booking Requests**: Handle new booking requests efficiently
4. **Emergency Situations**: Know how to handle urgent situations or complaints

**Technology Integration**
- Use appointment software to track customer preferences
- Update customer profiles with service history and notes
- Sync schedules across all staff members
- Generate reports for management review`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'service-delivery',
        title: 'Service Delivery Excellence',
        description: 'Providing exceptional service throughout the customer experience',
        content: `**Service Standards**

**Consultation Process**
1. **Active Listening**: Listen carefully to customer requests and concerns
2. **Professional Assessment**: Evaluate hair condition, face shape, and lifestyle
3. **Recommendation**: Suggest appropriate services and products
4. **Expectation Setting**: Clearly communicate what can be achieved

**During Service**
1. **Comfort Monitoring**: Regularly check customer comfort (temperature, position)
2. **Communication**: Maintain appropriate conversation level based on customer preference
3. **Quality Focus**: Maintain high standards throughout the service
4. **Time Management**: Stay on schedule while not rushing the service

**Upselling Opportunities**
1. **Natural Integration**: Suggest additional services that genuinely benefit the customer
2. **Product Recommendations**: Recommend products that maintain the look at home
3. **Future Services**: Discuss maintenance schedules and sonal treatments
4. **Package Deals**: Present value-added service packages when appropriate

**Service Completion**
1. **Final Review**: Show customer the finished result and ensure satisfaction
2. **Home Care Instructions**: Provide styling tips and product usage guidance
3. **Next Appointment**: Schedule follow-up appointment before customer leaves
4. **Feedback Request**: Ask for feedback and address any concerns immediately`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'closing-procedures',
        title: 'Closing Procedures',
        description: 'End-of-day tasks to ensure salon is ready for the next day',
        content: `**End-of-Day Checklist**

**Workstation Cleanup**
1. **Tool Sanitization**: Clean and sanitize all tools according to health regulations
2. **Surface Cleaning**: Wipe down all surfaces with approved disinfectants
3. **Product Organization**: Return products to designated storage areas
4. **Equipment Shutdown**: Properly shut down and store electrical equipment

**Customer Area Maintenance**
1. **Reception Cleanup**: Organize reception area and remove any clutter
2. **Waiting Area**: Clean and straighten waiting area furniture and magazines
3. **Retail Display**: Straighten product displays and secure valuable items
4. **Restroom Check**: Ensure restrooms are clean and well-stocked

**Administrative Tasks**
1. **Daily Sales Report**: Complete daily sales and service reports
2. **Appointment Review**: Review tomorrow's schedule and note special requirements
3. **Inventory Check**: Note any low-stock items that need reordering
4. **Cash Reconciliation**: Balance cash drawer and prepare deposit

**Security and Safety**
1. **Equipment Check**: Ensure all electrical equipment is turned off
2. **Waste Disposal**: Empty trash and dispose of chemical waste properly
3. **Security System**: Arm security system and lock all entrances
4. **Final Walkthrough**: Complete final safety and security check

**Communication**
- Leave notes for opening staff about any issues or special situations
- Update management on any customer complaints or compliments
- Report any equipment problems or maintenance needs
- Confirm tomorrow's schedule and any special preparations needed`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'closing-checklist',
            title: 'Interactive Closing Checklist',
            description: 'Digital checklist to ensure all closing tasks are completed',
            type: 'component-playground' as const,
            configuration: {
              component: 'ClosingChecklist',
              props: { userRole: 'salon_employee' }
            }
          }
        ]
      }
    ],
    troubleshooting: [
      {
        id: 'system-down',
        problem: 'POS system or appointment software not working',
        solution: 'Use backup paper forms to track appointments and sales. Contact IT support immediately. Inform customers of potential delays and offer rescheduling if necessary.',
        tags: []
      },
      {
        id: 'customer-complaint',
        problem: 'Customer unhappy with service or result',
        solution: 'Listen actively, apologize sincerely, and offer immediate solutions. If unable to resolve, escalate to manager immediately. Document the issue for follow‑up.',
        tags: []
      },
      {
        id: 'scheduling-conflict',
        problem: 'Double‑booked appointments or scheduling errors',
        solution: 'Apologize to affected customers, offer immediate alternatives or rescheduling. Consider offering service upgrades or discounts for the inconvenience.',
        tags: []
      }
    ],
    relatedContent: [
      {
        id: 'customer-service-protocols',
        title: 'Customer Service Protocols',
        url: '/documentation/business/employee/customer-service',
        type: 'guide' as const,
        relevanceScore: 0
      },
      {
        id: 'system-usage-guide',
        title: 'System Usage Guide',
        url: '/documentation/business/employee/system-usage',
        type: 'guide' as const,
        relevanceScore: 0
      },
      {
        id: 'emergency-procedures',
        title: 'Emergency Procedures',
        url: '/documentation/business/employee/emergency',
        type: 'reference' as const,
        relevanceScore: 0
      }
    ],
    interactiveExamples: [],
    codeSnippets: []
  },
  validation: {
    reviewed: true,
    reviewedBy: 'Operations Team',
    reviewDate: new Date('2024-01-15'),
    accuracy: 97,
    accessibilityCompliant: true,
    lastValidated: new Date('2024-01-15')
  },
  analytics: {
    viewCount: 0,
    completionRate: 0,
    averageRating: 0,
    feedbackCount: 0,
    rchRanking: 92
  },
  versioning: {
    changeHistory: [],
    previousVersions: [],
  }
}

export default function DailyWorkflowPage() {
  return (
    <div className="max-w-4xl">
  <GuideRenderer
    guide={dailyWorkflowGuide}
    interactive={true}
    stepByStep={true}
  />
    </div>
  )
}
