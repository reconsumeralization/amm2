import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
// Icons temporarily disabled due to package compatibility issues
// Using text alternatives for now

export const metadata: Metadata = {
  title: 'Salon Owner Guide - Modern Men barber shop',
  description: 'Complete business management guide for salon owners',
}

const guideCategories = [
  {
    id: 'setup',
    title: 'Initial Setup',
    description: 'Get your salon up and running with proper configuration',
    icon: '🏢',
    href: '/documentation/business/owner/setup',
    difficulty: 'Beginner',
    estimatedTime: '45 min',
    topics: [
      'Business profile configuration',
      'Service menu setup',
      'Pricing structure',
      'Staff account creation',
      'Operating hours configuration'
    ],
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'staff',
    title: 'Staff Management',
    description: 'Effectively manage your team and optimize operations',
    icon: '👥',
    href: '/documentation/business/owner/staff',
    difficulty: 'Intermediate',
    estimatedTime: '35 min',
    topics: [
      'Employee onboarding',
      'Schedule management',
      'Performance tracking',
      'Commission settings',
      'Role permissions'
    ],
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'payments',
    title: 'Financial Management',
    description: 'Master payment processing and financial tracking',
    icon: '💰',
    href: '/documentation/business/owner/payments',
    difficulty: 'Intermediate',
    estimatedTime: '40 min',
    topics: [
      'Revenue tracking',
      'Expense management',
      'Payment processing',
      'Tax reporting',
      'Profit analysis'
    ],
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'customers',
    title: 'Customer Relations',
    description: 'Build lasting relationships and grow your client base',
    icon: '❤️',
    href: '/documentation/business/owner/customers',
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    topics: [
      'Customer database',
      'Loyalty programs',
      'Marketing campaigns',
      'Feedback management',
      'Retention strategies'
    ],
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    description: 'Make data-driven decisions to grow your business',
    icon: '📊',
    href: '/documentation/business/owner/analytics',
    difficulty: 'Advanced',
    estimatedTime: '60 min',
    topics: [
      'Key performance indicators',
      'Revenue analysis',
      'Customer insights',
      'Staff performance metrics',
      'Growth forecasting'
    ],
    color: 'from-purple-400 to-violet-500'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Guide',
    description: 'Navigate and utilize your business dashboard effectively',
    icon: '⚙️',
    href: '/documentation/business/owner/dashboard',
    difficulty: 'Beginner',
    estimatedTime: '25 min',
    topics: [
      'Dashboard overview',
      'Quick actions',
      'Real-time monitoring',
      'Customization options',
      'Mobile access'
    ],
    color: 'from-slate-400 to-gray-500'
  }
]

const quickStartSteps = [
  {
    step: 1,
    title: 'Complete Business Setup',
    description: 'Configure your salon profile and basic settings',
    href: '/documentation/business/owner/setup'
  },
  {
    step: 2,
    title: 'Add Your Team',
    description: 'Create staff accounts and set up schedules',
    href: '/documentation/business/owner/staff'
  },
  {
    step: 3,
    title: 'Configure Payments',
    description: 'Set up payment processing and pricing',
    href: '/documentation/business/owner/payments'
  },
  {
    step: 4,
    title: 'Launch & Monitor',
    description: 'Go live and track your business performance',
    href: '/documentation/business/owner/dashboard'
  }
]

export default function SalonOwnerPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg">
            <span className="text-white text-lg">📚</span>
          </div>
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Salon Owner Guide
          </h1>
        </div>
        <p className="text-lg text-slate-300 max-w-3xl">
          Master every aspect of salon management with our comprehensive business guide. From initial setup to advanced analytics, 
          learn how to operate and grow your barber shop business effectively.
        </p>
      </div>

      {/* Quick Start Section */}
      <Card className="mb-12 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <span className="text-yellow-400 text-lg">⭐</span>
            Quick Start Guide
          </CardTitle>
          <CardDescription className="text-slate-300">
            Follow these steps to get your salon operational quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStartSteps.map((step, index) => (
              <Link key={step.step} href={step.href}>
                <div className="group p-4 rounded-lg border border-slate-600 hover:border-cyan-400 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">→</span>
                  </div>
                  <h3 className="font-semibold text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guide Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guideCategories.map((category) => {
          return (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 bg-slate-800/50 border-slate-700 hover:border-slate-600">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <span className="text-2xl text-white">{category.icon}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {category.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span className="text-sm">🕐</span>
                      {category.estimatedTime}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl text-slate-100 group-hover:text-white transition-colors">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {category.topics.map((topic, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      {topic}
                    </li>
                  ))}
                </ul>
                <Link href={category.href}>
                  <Button className="w-full group-hover:bg-slate-700 transition-colors">
                    Start Guide
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Resources */}
      <Card className="mt-12 bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Need Help?</CardTitle>
          <CardDescription className="text-slate-300">
            Additional resources and support options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <span className="text-cyan-400 text-2xl">📚</span>
              <h3 className="font-semibold text-slate-100 mb-1">Documentation</h3>
              <p className="text-sm text-slate-400">Comprehensive guides and tutorials</p>
            </div>
            <div className="text-center p-4">
              <span className="text-green-400 text-2xl">👥</span>
              <h3 className="font-semibold text-slate-100 mb-1">Community</h3>
              <p className="text-sm text-slate-400">Connect with other salon owners</p>
            </div>
            <div className="text-center p-4">
              <span className="text-pink-400 text-2xl">❤️</span>
              <h3 className="font-semibold text-slate-100 mb-1">Support</h3>
              <p className="text-sm text-slate-400">Get help from our support team</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}