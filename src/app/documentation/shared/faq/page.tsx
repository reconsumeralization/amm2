import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, ChevronDown, ChevronRight } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Documentation',
  description: 'Find answers to common questions about the Modern Men Hair Salon management system.',
}

export default function FAQPage() {
  const faqCategories = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is the Modern Men Hair Salon management system?',
          answer: 'It is a comprehensive salon management platform that handles appointments, customer management, staff scheduling, inventory, and business analytics.',
          tags: ['overview', 'features']
        },
        {
          question: 'Who can use this system?',
          answer: 'The system is designed for salon owners, employees (stylists, receptionists), customers, and system administrators. Each role has specific features and permissions.',
          tags: ['roles', 'access']
        },
        {
          question: 'Is the system mobile-friendly?',
          answer: 'Yes, the system is fully responsive and works on desktop, tablet, and mobile devices. There are also dedicated mobile apps for customers and staff.',
          tags: ['mobile', 'responsive']
        }
      ]
    },
    {
      category: 'Account & Access',
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email.',
          tags: ['password', 'login', 'security']
        },
        {
          question: 'Why can\'t I access certain features?',
          answer: 'Access to features depends on your user role. Contact your salon administrator if you need additional permissions.',
          tags: ['permissions', 'roles', 'access']
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Go to your profile settings (usually accessible from the user menu) and update your information. Some changes may require administrator approval.',
          tags: ['profile', 'settings', 'account']
        }
      ]
    },
    {
      category: 'Appointments & Booking',
      questions: [
        {
          question: 'How do I book an appointment?',
          answer: 'Customers can book appointments through the online booking system, mobile app, or by calling the salon. Staff can book appointments through the admin interface.',
          tags: ['booking', 'appointments', 'customers']
        },
        {
          question: 'Can I modify or cancel my appointment?',
          answer: 'Yes, appointments can be modified or cancelled up to 24 hours before the scheduled time through your account or by contacting the salon.',
          tags: ['appointments', 'cancellation', 'modification']
        },
        {
          question: 'How do I set my availability as a stylist?',
          answer: 'Staff members can set their availability through the staff portal in the schedule management section.',
          tags: ['staff', 'availability', 'scheduling']
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          question: 'The system is running slowly. What should I do?',
          answer: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. If the issue persists, contact technical support.',
          tags: ['performance', 'troubleshooting', 'browser']
        },
        {
          question: 'I\'m getting an error message. How do I report it?',
          answer: 'Take a screenshot of the error, note what you were doing when it occurred, and contact support with these details.',
          tags: ['errors', 'support', 'reporting']
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your data. All sensitive information is encrypted and stored securely.',
          tags: ['security', 'privacy', 'data']
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            Frequently Asked Questions
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Find quick answers to common questions about using the salon management system.
        </p>
      </div>

      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-purple-400" />
              {category.category}
            </h2>
            
            <div className="space-y-4">
              {category.questions.map((faq, faqIndex) => (
                <Card key={faqIndex} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-100 flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-300 mb-3 ml-8">
                      {faq.answer}
                    </p>
                    <div className="flex flex-wrap gap-2 ml-8">
                      {faq.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Still need help?
        </h3>
        <p className="text-slate-300 mb-4">
          If you can't find the answer you're looking for, don't hesitate to reach out for support.
        </p>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/documentation/shared/troubleshooting"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
          >
            Troubleshooting Guide
          </a>
          <a 
            href="/documentation/shared/support"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}