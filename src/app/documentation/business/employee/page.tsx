import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Employee Operations Guide - Modern Men Hair Salon',
  description: 'Operational guides for salon employees including daily workflows and customer service',
}

export default function EmployeeDocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Employee Operations Guide
        </h1>
        <p className="text-slate-300">
          Comprehensive operational guides for salon employees to excel in daily tasks, 
          customer service, and professional development within the Modern Men Hair Salon system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/documentation/business/employee/daily-workflow" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Daily Workflow Guide</h2>
          <p className="text-slate-400 text-sm mb-4">
            Step-by-step guide for daily operations from opening to closing
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Opening and Closing Procedures
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Appointment Management
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Customer Check-in Process
            </li>
          </ul>
        </Link>

        <Link href="/documentation/business/employee/customer-service" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Customer Service Protocols</h2>
          <p className="text-slate-400 text-sm mb-4">
            Professional customer service standards and communication guidelines
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Customer Interaction Standards
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Complaint Resolution
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Upselling Techniques
            </li>
          </ul>
        </Link>

        <Link href="/documentation/business/employee/system-usage" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">System Usage Guide</h2>
          <p className="text-slate-400 text-sm mb-4">
            Complete guide to using the salon management system effectively
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              POS System Operations
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Appointment Booking
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Customer Profile Management
            </li>
          </ul>
        </Link>

        <Link href="/documentation/business/employee/professional-development" 
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors block">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Professional Development</h2>
          <p className="text-slate-400 text-sm mb-4">
            Career growth, training resources, and skill development opportunities
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Skill Assessment Tools
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Training Programs
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Performance Tracking
            </li>
          </ul>
        </Link>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Quick Reference</h2>
          <p className="text-slate-400 text-sm mb-4">
            Essential information and emergency procedures
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Emergency Contacts
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Safety Procedures
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Common Issues & Solutions
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Performance Metrics</h2>
          <p className="text-slate-400 text-sm mb-4">
            Understanding your performance indicators and goals
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Customer Satisfaction Scores
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Revenue Targets
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Professional Development Goals
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}