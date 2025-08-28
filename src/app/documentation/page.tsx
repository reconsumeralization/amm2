'use client'

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Code, Users, Cog, HelpCircle, Book, Zap } from '@/lib/icon-mapping'
import { getUserRoleFromSession, hasDocumentationPermission } from "@/lib/documentation-permissions"
import { UserRole } from "@/types/documentation"

export default function DocumentationPage() {
  const { data: session } = useSession()
  const userRole: UserRole = getUserRoleFromSession(session)

  // Define documentation sections with their metadata
  const documentationSections = [
    {
      id: 'developer',
      title: 'Developer Documentation',
      description: 'Comprehensive guides for developers building and extending the salon management system',
      icon: <Code className="h-8 w-8 text-cyan-500" />,
      href: '/documentation/developer',
      features: [
        'Project Setup & Architecture',
        'API Reference & Examples',
        'Component Library & UI',
        'Testing & Quality Assurance'
      ],
      permission: 'developer'
    },
    {
      id: 'business',
      title: 'Business Documentation',
      description: 'Operational guides for salon owners, employees, and customers',
      icon: <Users className="h-8 w-8 text-green-500" />,
      href: '/documentation/business',
      features: [
        'Salon Owner Management',
        'Employee Operations',
        'Customer Self-Service',
        'Business Analytics'
      ],
      permission: 'business'
    },
    {
      id: 'admin',
      title: 'System Administration',
      description: 'Technical administration guides for deployment and maintenance',
      icon: <Settings className="h-8 w-8 text-orange-500" />,
      href: '/documentation/admin',
      features: [
        'Deployment & Configuration',
        'Monitoring & Performance',
        'Backup & Recovery',
        'Troubleshooting'
      ],
      permission: 'admin'
    },
    {
      id: 'shared',
      title: 'Shared Resources',
      description: 'Common resources including glossary, troubleshooting, and updates',
      icon: <HelpCircle className="h-8 w-8 text-purple-500" />,
      href: '/documentation/shared',
      features: [
        'Terminology Glossary',
        'Common Troubleshooting',
        'System Changelog',
        'Frequently Asked Questions'
      ],
      permission: 'shared'
    }
  ]

  // Filter sections based on user permissions
  const accessibleSections = documentationSections.filter(section =>
    hasDocumentationPermission(userRole, section.permission, 'read')
  )

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-cyan-500" />
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Documentation Portal
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Welcome to the Modern Men Hair Salon management system documentation. 
          Find comprehensive guides, API references, and operational procedures tailored to your role.
        </p>
        
        {/* User Role Info */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-slate-400">Viewing as:</span>
          <span className="px-2 py-1 bg-slate-700 rounded text-sm text-cyan-400 font-medium">
            {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="mb-12 p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-semibold text-slate-100">Quick Start</h2>
        </div>
        <p className="text-slate-300 mb-4">
          New to the system? Start with these essential guides based on your role.
        </p>
        <div className="flex flex-wrap gap-2">
          {userRole === 'developer' && (
            <Link 
              href="/documentation/developer/setup" 
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors"
            >
              Development Setup
            </Link>
          )}
          {(userRole === 'salon_owner' || userRole === 'salon_employee') && (
            <Link 
              href="/documentation/business/owner" 
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Business Setup
            </Link>
          )}
          {userRole === 'salon_customer' && (
            <Link 
              href="/documentation/business/customer" 
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Customer Guide
            </Link>
          )}
          <Link 
            href="/documentation/shared/troubleshooting" 
            className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
          >
            Troubleshooting
          </Link>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accessibleSections.map((section) => (
          <div 
            key={section.id} 
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-start gap-4 mb-4">
              {section.icon}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 text-slate-100">
                  <Link href={section.href} className="hover:text-cyan-400 transition-colors">
                    {section.title}
                  </Link>
                </h2>
                <p className="text-slate-400 text-sm">{section.description}</p>
              </div>
            </div>
            
            <ul className="space-y-2 mb-4">
              {section.features.map((feature, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-center">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-3"></span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              href={section.href}
              className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Explore {section.title.split(' ')[0]} Docs
              <span className="ml-1">→</span>
            </Link>
          </div>
        ))}
      </div>

      {/* No Access Message */}
      {accessibleSections.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Documentation Available</h3>
            <p>You don't have access to any documentation sections with your current role.</p>
            <p className="text-sm mt-2">Contact your administrator if you need access to specific documentation.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-slate-700">
        <div className="text-center text-slate-400 text-sm">
          <p>Need help? Check our <Link href="/documentation/shared/troubleshooting" className="text-cyan-400 hover:text-cyan-300">troubleshooting guide</Link> or contact support.</p>
        </div>
      </div>
    </div>
  )
} 