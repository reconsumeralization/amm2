import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Customer Help Center - Modern Men Hair Salon',
  description: 'Self-service guides for customers using the booking and account features',
}

export default function CustomerDocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Customer Help Center
        </h1>
        <p className="text-slate-300">
          Welcome to the Modern Men Hair Salon customer help center. Find answers to common questions, 
          learn how to book appointments, manage your account, and make the most of your salon experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/documentation/business/customer/getting-started" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Getting Started</h2>
          <p className="text-slate-400 text-sm mb-4">
            Create your account and book your first appointment
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Account Creation
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              First Appointment Booking
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Profile Setup
            </li>
          </ul>
        </Link>

        <Link href="/documentation/business/customer/booking-appointments" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Booking Appointments</h2>
          <p className="text-slate-400 text-sm mb-4">
            Complete guide to booking, modifying, and managing appointments
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Online Booking Process
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Rescheduling & Cancellations
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Service Selection Guide
            </li>
          </ul>
        </Link>

        <Link href="/documentation/business/customer/account-management" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Account Management</h2>
          <p className="text-slate-400 text-sm mb-4">
            Manage your profile, preferences, and service history
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Profile Updates
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Service History
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Preferences & Notifications
            </li>
          </ul>
        </Link>

        <Link href="/documentation/business/customer/payments-billing" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Payments & Billing</h2>
          <p className="text-slate-400 text-sm mb-4">
            Payment methods, receipts, and billing information
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Payment Options
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Digital Receipts
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Loyalty Rewards
            </li>
          </ul>
        </Link>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Troubleshooting</h2>
          <p className="text-slate-400 text-sm mb-4">
            Common issues and solutions for customer account problems
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Login Issues
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Booking Problems
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Payment Issues
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Contact & Support</h2>
          <p className="text-slate-400 text-sm mb-4">
            Get help when you need it most
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Phone: (555) 123-4567
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Email: support@modernmenhair.com
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Live Chat Available
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-800/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-slate-100">Quick Tips for New Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-cyan-400 mb-2">Before Your First Visit</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Create your online account in advance</li>
              <li>• Browse our service menu and pricing</li>
              <li>• Consider bringing inspiration photos</li>
              <li>• Arrive 10 minutes early for check-in</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-cyan-400 mb-2">Making the Most of Your Visit</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Communicate your preferences clearly</li>
              <li>• Ask about home care recommendations</li>
              <li>• Schedule your next appointment before leaving</li>
              <li>• Provide feedback to help us improve</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}