import { Metadata } from 'next'
import { GuideRenderer } from '@/components/documentation/GuideRenderer'
import { InteractiveExample } from '@/components/documentation/InteractiveExample'
import { UserRole } from '@/types/documentation'

export const metadata: Metadata = {
  title: 'Booking Appointments Guide - Customer Help',
  description: 'Complete guide to booking, modifying, and managing your salon appointments',
}

const bookingGuide = {
  metadata: {
    id: 'customer-booking-guide',
    title: 'Booking Appointments Guide',
    description: 'Learn how to book, modify, and manage your salon appointments online',
    author: 'Customer Experience Team',
    lastUpdated: new Date('2024-01-15'),
    version: { major: 1, minor: 0, patch: 0 },
    targetAudience: ['salon_customer' as UserRole],
    difficulty: 'beginner' as const,
    estimatedTime: 15,
    tags: ['booking', 'appointments', 'scheduling'],
    locale: 'en',
    deprecated: false,
  },
  content: {
    introduction: `Booking your appointment at Modern Men Hair Salon is quick and easy with our online booking system. This guide will walk you through the entire process, from selecting services to confirming your appointment, plus how to manage your bookings after they're made.`,
    prerequisites: [
      {
        id: 'customer-account',
        title: 'Customer Account',
        description: 'You need an active customer account to book appointments online',
        required: true,
      },
      {
        id: 'internet-access',
        title: 'Internet Access',
        description: 'Stable internet connection for online booking',
        required: true,
      }
    ],
    steps: [
      {
        id: 'online-booking-process',
        title: 'Online Booking Process',
        description: 'Step-by-step guide to booking your appointment online',
        content: `**Getting Started with Online Booking**

**Step 1: Access the Booking System**
- Visit our website at modernmenhair.com
- Click "Book Appointment" in the top navigation
- Log in to your customer account
- If you don't have an account, click "Create Account" first

**Step 2: Select Your Services**
- Browse our service menu with descriptions and pricing
- Click on services you want to add to your appointment
- Review service duration and pricing information
- Add multiple services if desired (they'll be scheduled consecutively)

**Popular Service Categories:**
- **Classic Cuts**: Traditional men's haircuts and styling
- **Specialty Cuts**: Fades, undercuts, and modern styles  
- **Grooming**: Beard trims, mustache grooming, eyebrow trimming
- **Treatments**: Deep conditioning, scalp treatments, hot towel service
- **Packages**: Bundled services at discounted prices

**Step 3: Choose Your Stylist**
- View available stylists with their specialties and experience levels
- Read customer reviews and ratings for each stylist
- Select "Any Available" for the earliest appointment time
- Premium stylists may have additional fees

**Step 4: Select Date and Time**
- Use the calendar to choose your preferred date
- Available time slots will be highlighted in green
- Unavailable times are grayed out
- Consider booking during off-peak hours for more availability

**Step 5: Review and Confirm**
- Review all selected services, stylist, date, and time
- Check the total price including any applicable taxes
- Add any special requests or notes in the comments section
- Confirm your contact information is current`,
        codeSnippets: [
          {
            id: 'booking-interface',
            language: 'typescript',
            code: `// Example booking data structure
interface AppointmentBooking {
  customerId: string;
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
  }[];
  stylistId: string;
  dateTime: Date;
  totalPrice: number;
  specialRequests?: string;
  confirmationNumber: string;
}

// Booking confirmation example
const bookingConfirmation = {
  confirmationNumber: "MMH-2024-001234",
  customer: "John Smith",
  services: ["Classic Men's Cut", "Beard Trim"],
  stylist: "Mike Johnson",
  dateTime: new Date("2024-02-15T14:00:00"),
  totalPrice: 55.00,
  estimatedDuration: 45
};`,
            description: 'Appointment booking data structure',
            runnable: false
          }
        ],
        interactiveExamples: [
          {
            id: 'booking-simulator',
            title: 'Appointment Booking Simulator',
            description: 'Practice booking appointments with our interactive simulator',
            type: 'component-playground' as const,
            configuration: {
              component: 'BookingSimulator',
              props: { userRole: 'salon_customer' }
            }
          }
        ]
      },
      {
        id: 'service-selection-guide',
        title: 'Service Selection Guide',
        description: 'Understanding our services and choosing the right ones for you',
        content: `**Understanding Our Service Menu**

**Haircut Services**

**Classic Men's Cut ($35 - 30 minutes)**
- Traditional scissor cut with basic styling
- Includes consultation, cut, wash, and style
- Perfect for maintaining your current look
- Suitable for all hair types and lengths

**Premium Cut ($50 - 45 minutes)**
- Advanced cutting techniques with senior stylist
- Detailed consultation and personalized styling
- Includes scalp massage and premium products
- Ideal for new styles or complex cuts

**Specialty Cuts ($40 - 35 minutes)**
- Modern styles: fades, undercuts, textured cuts
- Requires specific expertise and techniques
- Includes detailed styling and finishing
- Popular with younger clientele

**Grooming Services**

**Beard Trim ($20 - 15 minutes)**
- Professional beard shaping and trimming
- Includes mustache grooming and cleanup
- Hot towel treatment included
- Maintains your beard's shape and health

**Full Grooming Package ($60 - 60 minutes)**
- Haircut, beard trim, and eyebrow grooming
- Hot towel treatment and scalp massage
- Premium styling products included
- Complete grooming experience

**Treatment Services**

**Deep Conditioning Treatment ($25 - 20 minutes)**
- Intensive hair and scalp treatment
- Repairs damage and improves hair health
- Includes relaxing scalp massage
- Recommended monthly for optimal hair health

**Hot Towel Service ($15 - 10 minutes)**
- Relaxing hot towel application
- Opens pores and softens facial hair
- Can be added to any service
- Perfect for stress relief

**Choosing the Right Services**

**For First-Time Customers:**
- Start with a Classic Cut to establish your baseline
- Add a consultation to discuss your hair goals
- Consider a beard trim if you have facial hair
- Ask about our new customer package deals

**For Regular Maintenance:**
- Book the same services you've had before
- Consider sonal treatments (deep conditioning in winter)
- Add grooming services as needed
- Take advantage of loyalty program discounts

**For Special Occasions:**
- Book a Premium Cut for important events
- Add styling services for formal occasions
- Consider the Full Grooming Package
- Schedule 1-2 days before your event`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'service-selector',
            title: 'Service Selection Tool',
            description: 'Interactive tool to help you choose the right services',
            type: 'component-playground' as const,
            configuration: {
              component: 'ServiceSelector',
              props: { userRole: 'salon_customer' }
            }
          }
        ]
      },
      {
        id: 'rescheduling-cancellations',
        title: 'Rescheduling and Cancellations',
        description: 'How to modify or cancel your appointments',
        content: `**Modifying Your Appointment**

**Rescheduling Process**
1. **Log into Your Account**: Access your customer portal online
2. **Find Your Appointment**: Go to "My Appointments" section
3. **Select Modify**: Click "Reschedule" next to your appointment
4. **Choose New Time**: Select from available time slots
5. **Confirm Changes**: Review and confirm your new appointment time

**Rescheduling Policies**
- **24+ Hours Notice**: Free rescheduling with no penalties
- **12-24 Hours Notice**: $10 rescheduling fee may apply
- **Less than 12 Hours**: Subject to availability and fees
- **Same Day**: Call the salon directly for assistance

**Cancellation Process**
1. **Online Cancellation**: Use your customer portal for cancellations
2. **Phone Cancellation**: Call (555) 123-4567 during business hours
3. **Confirmation**: You'll receive email confirmation of cancellation
4. **Refund Processing**: Refunds processed according to our policy

**Cancellation Policies**

**Free Cancellation**
- 24+ hours advance notice: Full refund or credit
- No penalties or fees applied
- Automatic email confirmation sent
- Credit can be used for future appointments

**Late Cancellation**
- 12-24 hours notice: 50% cancellation fee
- Less than 12 hours: 75% cancellation fee
- Same day cancellation: Full service charge
- Emergency exceptions considered case-by-case

**No-Show Policy**
- Failure to arrive: Full service charge
- No advance notice: Additional $25 no-show fee
- Repeated no-shows: May require prepayment for future bookings
- Account may be restricted after multiple no-shows

**Emergency Situations**
- Medical emergencies: Full refund with documentation
- Family emergencies: Case-by-case consideration
- Weather emergencies: Automatic rescheduling available
- Transportation issues: Call as soon as possible

**Tips for Successful Rescheduling**
- Book popular time slots as early as possible
- Consider off-peak hours for more flexibility
- Set calendar reminders for your appointments
- Update your contact information for appointment reminders`,
        codeSnippets: [],
        interactiveExamples: []
      },
      {
        id: 'appointment-reminders',
        title: 'Appointment Reminders and Notifications',
        description: 'Managing your appointment notifications and reminders',
        content: `**Automatic Reminder System**

**Reminder Schedule**
- **7 Days Before**: Email reminder with appointment details
- **24 Hours Before**: Text message and email reminder
- **2 Hours Before**: Final text message reminder
- **Custom Reminders**: Set additional reminders in your preferences

**Reminder Content**
- Appointment date, time, and duration
- Services booked and total estimated cost
- Stylist name and any special instructions
- Salon address and parking information
- Links to reschedule or cancel if needed

**Managing Your Notification Preferences**

**Email Notifications**
- Appointment confirmations and changes
- Promotional offers and special events
- Loyalty program updates and rewards
- sonal service recommendations

**Text Message Notifications**
- Appointment reminders and confirmations
- Last-minute availability notifications
- Emergency schedule changes
- Quick polls and feedback requests

**Push Notifications (Mobile App)**
- Real-time appointment updates
- Check-in reminders when you arrive
- Service completion notifications
- Special offers and flash sales

**Customizing Your Preferences**
1. **Log into Your Account**: Access your customer portal
2. **Go to Settings**: Find "Notification Preferences"
3. **Choose Channels**: Select email, text, push, or combinations
4. **Set Timing**: Customize when you receive reminders
5. **Save Changes**: Confirm your preference updates

**Opting Out**
- Unsubscribe links in all emails
- Reply STOP to text messages
- Disable push notifications in app settings
- Call salon to update preferences by phone

**Special Notifications**

**Weather Alerts**
- Severe weather appointment policies
- Automatic rescheduling options
- Safety recommendations for travel

**Schedule Changes**
- Stylist illness or emergency changes
- Salon closure notifications
- Alternative appointment options

**Promotional Notifications**
- Birthday month special offers
- Loyalty program milestone rewards
- sonal service promotions
- Referral program opportunities`,
        codeSnippets: [],
        interactiveExamples: [
          {
            id: 'notification-preferences',
            title: 'Notification Preferences Manager',
            description: 'Customize your appointment reminder preferences',
            type: 'component-playground' as const,
            configuration: {
              component: 'NotificationPreferences',
              props: { userRole: 'salon_customer' }
            }
          }
        ]
      },
      {
        id: 'booking-tips',
        title: 'Booking Tips and Best Practices',
        description: 'Expert tips for getting the best appointment experience',
        content: `**Optimal Booking Strategies**

**Best Times to Book**
- **Weekday Mornings**: Less crowded, more stylist availability
- **Tuesday-Thursday**: Generally less busy than Monday/Friday
- **Off-Peak Hours**: 10 AM - 2 PM typically has more availability
- **Advance Booking**: Book 2-3 weeks ahead for popular stylists

**sonal Considerations**
- **Spring/Summer**: Book early for wedding and event son
- **Back-to-School**: August/September are busy months
- **Holiday son**: November/December fill up quickly
- **New Year**: January is popular for fresh starts

**Getting Your Preferred Stylist**
- Book as far in advance as possible
- Be flexible with time slots
- Consider their less popular days/times
- Join their waiting list for cancellations

**Maximizing Your Appointment Value**

**Preparation Tips**
- Come with clean, dry hair unless specified otherwise
- Bring inspiration photos for new styles
- Arrive 10 minutes early for check-in
- Turn off your phone for better consultation

**Communication Best Practices**
- Be specific about what you want and don't want
- Mention any previous bad experiences or concerns
- Ask questions about maintenance and styling
- Provide feedback during the service

**Loyalty Program Benefits**
- Earn points with every appointment
- Get priority booking for popular times
- Receive exclusive member-only promotions
- Access to special events and new services

**Package and Bundle Deals**
- Monthly maintenance packages for regular customers
- Special occasion packages (wedding, graduation)
- sonal treatment bundles
- Referral rewards and family discounts

**Troubleshooting Common Issues**

**Can't Find Available Times**
- Try different stylists or service combinations
- Consider off-peak hours or days
- Join waiting lists for preferred times
- Call the salon for additional options

**Booking System Problems**
- Clear your browser cache and cookies
- Try a different browser or device
- Disable ad blockers that might interfere
- Call the salon for phone booking assistance

**Special Requests**
- Add detailed notes during booking
- Call after booking to discuss complex requests
- Arrive early to discuss modifications
- Be flexible if requests aren't feasible`,
        codeSnippets: [],
        interactiveExamples: []
      }
    ],
    troubleshooting: [
      {
        id: 'booking-system-error',
        problem: 'Online booking system showing errors or not loading',
        solution: 'Try refreshing the page, clearing your browser cache, or using a different browser. If problems persist, call us at (555) 123-4567 to book by phone.',
        category: 'technical',
        tags: ['booking-system', 'technical-issue', 'browser-error']
      },
      {
        id: 'no-available-times',
        problem: 'No available appointment times showing for preferred dates',
        solution: 'Try selecting different stylists, consider off-peak hours, or extend your date range. You can also join our waiting list for cancellations.',
        category: 'availability',
        tags: ['availability', 'scheduling', 'waiting-list']
      },
      {
        id: 'confirmation-not-received',
        problem: 'Did not receive appointment confirmation email or text',
        solution: 'Check your spam/junk folder, verify your contact information is correct in your account, and call us to confirm your appointment was properly booked.',
        category: 'communication',
        tags: ['email', 'confirmation', 'communication', 'spam-folder']
      }
    ],
    relatedContent: [
      {
        id: 'getting-started',
        title: 'Getting Started Guide',
        description: 'Create your account and set up your profile',
        url: '/documentation/business/customer/getting-started',
        type: 'guide',
        relevanceScore: 0.9
      },
      {
        id: 'account-management',
        title: 'Account Management',
        description: 'Manage your profile and preferences',
        url: '/documentation/business/customer/account-management',
        type: 'guide',
        relevanceScore: 0.8
      },
      {
        id: 'payments-billing',
        title: 'Payments & Billing',
        description: 'Payment options and billing information',
        url: '/documentation/business/customer/payments-billing',
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
    accuracy: 98,
    accessibilityCompliant: true,
    lastValidated: new Date('2024-01-15')
  },
  analytics: {
    viewCount: 0,
    completionRate: 0,
    averageRating: 0,
    feedbackCount: 0,
    rchRanking: 95
  },
  versioning: {
    changeHistory: [],
    previousVersions: [],
  }
}

export default function BookingAppointmentsPage() {
  return (
    <div className="max-w-4xl">
      <GuideRenderer
        guide={bookingGuide as any}
        interactive={true}
        stepByStep={true}
      />
    </div>
  )
}