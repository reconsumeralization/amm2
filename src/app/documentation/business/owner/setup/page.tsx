import { Metadata } from 'next'
import { GuideRenderer } from '@/components/documentation/GuideRenderer'
import { InteractiveExample } from '@/components/documentation/InteractiveExample'
import { UserRole } from '@/types/documentation'

export const metadata: Metadata = {
  title: 'Business Setup Guide - Modern Men Hair Salon',
  description: 'Complete guide to setting up your salon business profile and initial configuration',
}

const businessSetupGuide = {
  metadata: {
    id: 'business-setup-guide',
    title: 'Business Setup Guide',
    description: 'Step-by-step guide to configure your salon business profile and get started',
    author: 'Documentation Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['salon_owner' as UserRole],
    difficulty: 'beginner' as const,
    estimatedTime: 45,
    tags: ['setup', 'configuration', 'business-profile'],
    locale: 'en',
    deprecated: false,
  },
  content: {
    introduction: `Setting up your salon business profile is the foundation for using the Modern Men Hair Salon management system effectively. This guide will walk you through each step of the initial configuration process, from basic business information to advanced operational settings.`,
    prerequisites: [
      {
        id: 'admin-account',
        title: 'Administrator Account',
        description: 'You must have owner/administrator access to the system',
        required: true,
      },
      {
        id: 'business-info',
        title: 'Business Information',
        description: 'Have your business license, tax ID, and contact information ready',
        required: true,
      },
      {
        id: 'service-menu',
        title: 'Service Menu Planning',
        description: 'Prepare a list of services you offer with pricing',
        required: false,
      }
    ],
    steps: [
      {
        id: 'business-profile',
        title: 'Business Profile Configuration',
        description: 'Setting up your salon\'s basic business information',
        content: `**Business Information Setup**

**Basic Details**
1. **Salon Name**: Enter your official business name as it appears on legal documents
2. **Business Address**: Complete address including street, city, state, and ZIP code
3. **Contact Information**: Primary phone number, email, and website URL
4. **Business Hours**: Set your regular operating hours for each day of the week
5. **Time Zone**: Select your local time zone for accurate scheduling

**Legal and Tax Information**
1. **Business License Number**: Enter your state business license number
2. **Tax ID/EIN**: Federal Employer Identification Number for tax reporting
3. **Business Type**: Select from LLC, Corporation, Partnership, or Sole Proprietorship
4. **Sales Tax Rate**: Local sales tax percentage for service calculations

**Branding and Appearance**
1. **Logo Upload**: Upload your salon logo (recommended: 300x300px PNG)
2. **Brand Colors**: Set primary and secondary colors for your booking interface
3. **Business Description**: Write a brief description of your salon and services
4. **Social Media Links**: Add links to your Facebook, Instagram, and other profiles`,
        codeSnippets: [
          {
            language: 'typescript',
            code: `// Example business profile configuration
const businessProfile = {
  name: "Modern Men Hair Salon",
  address: {
    street: "123 Main Street",
    city: "Downtown",
    state: "CA",
    zipCode: "90210"
  },
  contact: {
    phone: "(555) 123-4567",
    email: "info@modernmenhair.com",
    website: "https://modernmenhair.com"
  },
  hours: {
    monday: { open: "09:00", close: "19:00" },
    tuesday: { open: "09:00", close: "19:00" },
    // ... other days
  },
  taxInfo: {
    businessLicense: "BL123456789",
    taxId: "12-3456789",
    salesTaxRate: 8.25
  }
}`,
            description: 'Business profile data structure',
            runnable: false
          }
        ],
        interactiveExamples: [
          {
            id: 'business-profile-form',
            title: 'Business Profile Setup Form',
            description: 'Interactive form to configure your business profile',
            type: 'component-playground' as const,
            configuration: {
              component: 'BusinessProfileForm',
              props: { mode: 'setup' }
            }
          }
        ]
      },
      {
        id: 'service-menu-setup',
        title: 'Service Menu and Pricing',
        description: 'Creating your service offerings and pricing structure',
        content: `**Service Categories**

**Haircut Services**
- Classic Men's Cut
- Beard Trim
- Mustache Grooming
- Eyebrow Trimming
- Specialty Cuts (Fade, Undercut, etc.)

**Styling Services**
- Hair Washing and Conditioning
- Blow Dry and Styling
- Special Event Styling
- Hair Texture Treatments

**Additional Services**
- Hot Towel Treatment
- Scalp Massage
- Hair Product Application
- Consultation Services

**Pricing Configuration**
1. **Base Pricing**: Set standard prices for each service
2. **Stylist-Specific Pricing**: Allow different rates for senior stylists
3. **Package Deals**: Create bundled service offerings
4. **sonal Promotions**: Set up promotional pricing periods
5. **Membership Discounts**: Configure loyalty program pricing

**Service Duration and Booking**
- Set realistic time estimates for each service
- Configure buffer time between appointments
- Set maximum advance booking period
- Enable or disable online booking for specific services`,
        codeSnippets: [
          {
            language: 'typescript',
            code: `// Example service menu configuration
const serviceMenu = {
  categories: [
    {
      name: "Haircuts",
      services: [
        {
          name: "Classic Men's Cut",
          duration: 30,
          basePrice: 35.00,
          description: "Traditional scissor cut with styling",
          onlineBooking: true
        },
        {
          name: "Beard Trim",
          duration: 15,
          basePrice: 20.00,
          description: "Professional beard shaping and trimming",
          onlineBooking: true
        }
      ]
    }
  ],
  packages: [
    {
      name: "The Full Service",
      services: ["Classic Men's Cut", "Beard Trim", "Hot Towel"],
      price: 60.00,
      savings: 15.00
    }
  ]
}`,
            description: 'Service menu data structure',
            runnable: false
          }
        ],
        interactiveExamples: []
      },
      {
        id: 'staff-setup',
        title: 'Staff Account Creation',
        description: 'Setting up your team members and their permissions',
        content: `**Staff Role Types**

**Owner/Manager**
- Full system access and administrative privileges
- Financial reporting and business analytics access
- Staff management and scheduling authority
- Customer data and marketing tools access

**Senior Stylist**
- Advanced booking and customer management
- Commission and performance tracking access
- Limited administrative functions
- Inventory management for assigned products

**Stylist**
- Basic appointment management
- Customer service and booking modifications
- Personal schedule and availability management
- Service completion and payment processing

**Receptionist**
- Front desk operations and customer check-in
- Appointment scheduling and modifications
- Payment processing and receipt generation
- Basic customer information updates

**Staff Account Setup Process**
1. **Personal Information**: Name, contact details, emergency contact
2. **Employment Details**: Start date, employment type, department
3. **System Access**: Username, temporary password, role assignment
4. **Schedule Preferences**: Availability, preferred working hours
5. **Commission Structure**: Pay rate, commission percentage, bonus eligibility
6. **Skills and Certifications**: Services they can perform, specializations`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'staff-setup-wizard',
            title: 'Staff Account Setup Wizard',
            description: 'Step-by-step staff account creation process',
            type: 'component-playground' as const,
            configuration: {
              component: 'StaffSetupWizard',
              props: { userRole: 'salon_owner' }
            }
          }
        ]
      },
      {
        id: 'payment-setup',
        title: 'Payment Processing Configuration',
        description: 'Setting up payment methods and financial integrations',
        content: `**Payment Method Configuration**

**Accepted Payment Types**
- Cash payments with change calculation
- Credit and debit card processing
- Digital payments (Apple Pay, Google Pay)
- Gift cards and store credit
- Loyalty points redemption

**Payment Processor Integration**
1. **Square Integration**: Connect your Square account for card processing
2. **Stripe Setup**: Configure Stripe for online payments and subscriptions
3. **PayPal Business**: Enable PayPal payments for customer convenience
4. **Bank Account**: Link business checking account for direct deposits

**Financial Settings**
- Automatic tip calculation options (15%, 18%, 20%, custom)
- Tax calculation and reporting setup
- Refund and cancellation policies
- Late payment fees and policies
- Commission calculation methods

**Security and Compliance**
- PCI DSS compliance verification
- Secure payment data handling
- Transaction logging and audit trails
- Fraud detection and prevention measures`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'operational-policies',
        title: 'Operational Policies and Procedures',
        description: 'Configuring business policies and customer service standards',
        content: `**Booking and Cancellation Policies**

**Appointment Policies**
- Advance booking requirements (minimum/maximum days)
- Same-day appointment availability
- Walk-in customer handling procedures
- Group booking and party services

**Cancellation and No-Show Policies**
- Cancellation notice requirements (24-hour, same-day)
- No-show fees and enforcement procedures
- Rescheduling policies and limitations
- Emergency cancellation exceptions

**Customer Service Standards**
- Greeting and check-in procedures
- Wait time management and communication
- Service quality standards and expectations
- Complaint handling and resolution processes
- Follow-up communication protocols

**Health and Safety Protocols**
- Sanitation and cleaning procedures
- Equipment sterilization requirements
- Health screening and safety measures
- Emergency procedures and contact information
- Insurance and liability coverage details`,
        codeSnippets: [],
        interactiveExamples: []
      }
    ],
    troubleshooting: [
      {
        id: 'setup-incomplete',
        problem: 'Cannot complete business setup - missing required fields',
        solution: 'Review each section of the setup process and ensure all required fields marked with * are completed. Check that your business license and tax ID are entered correctly.',
        category: 'setup'
      },
      {
        id: 'payment-integration-failed',
        problem: 'Payment processor integration not working',
        solution: 'Verify your payment processor credentials are correct. Ensure your business account is active and in good standing. Contact your payment processor support if issues persist.',
        category: 'payments'
      },
      {
        id: 'staff-access-issues',
        problem: 'Staff members cannot access their accounts',
        solution: 'Check that staff accounts are properly activated and roles are assigned correctly. Verify email addresses are correct for password reset functionality.',
        category: 'staff'
      }
    ],
    relatedContent: [
      {
        id: 'dashboard-guide',
        title: 'Salon Owner Dashboard Guide',
        description: 'Learn to use your business dashboard effectively',
        url: '/documentation/business/owner/dashboard',
        type: 'guide'
      },
      {
        id: 'staff-management',
        title: 'Staff Management Guide',
        description: 'Managing your team and schedules',
        url: '/documentation/business/owner/staff',
        type: 'guide'
      },
      {
        id: 'payment-processing',
        title: 'Payment Processing Guide',
        description: 'Advanced payment and billing features',
        url: '/documentation/business/owner/payments',
        type: 'guide'
      }
    ],
    interactiveExamples: [],
    codeSnippets: []
  },
  validation: {
    reviewed: true,
    reviewedBy: 'Business Team',
    reviewDate: new Date('2024-01-15'),
    accuracy: 98,
    accessibilityCompliant: true,
    lastValidated: new Date('2024-01-15')
  },
  analytics: {
    viewCount: 0,
    completionRate: 0,
    averageRating: 0,
    feedbackCount: 0,
    rchRanking: 90
  },
  versioning: {
    changeHistory: [],
    previousVersions: [],
  }
}

export default function BusinessSetupPage() {
  return (
    <div className="max-w-4xl">
      <GuideRenderer 
        content={businessSetupGuide}
        interactive={true}
        stepByStep={true}
        userRole="salon_owner"
      />
    </div>
  )
}