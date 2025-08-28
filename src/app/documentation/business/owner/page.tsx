import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salon Owner Guide - Modern Men Hair Salon',
  description: 'Complete business management guide for salon owners',
}

export default function SalonOwnerPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Salon Owner Guide
        </h1>
        <p className="text-slate-300">
          Comprehensive business management guide for salon owners to effectively operate and grow their hair salon business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Initial Setup</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• Business profile configuration</li>
            <li>• Service menu setup</li>
            <li>• Pricing structure</li>
            <li>• Staff account creation</li>
            <li>• Operating hours configuration</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Staff Management</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• Employee onboarding</li>
            <li>• Schedule management</li>
            <li>• Performance tracking</li>
            <li>• Commission settings</li>
            <li>• Role permissions</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibent mb-4 text-slate-100">Financial Management</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• Revenue tracking</li>
            <li>• Expense management</li>
            <li>• Payment processing</li>
            <li>• Tax reporting</li>
            <li>• Profit analysis</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Customer Relations</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• Customer database</li>
            <li>• Loyalty programs</li>
            <li>• Marketing campaigns</li>
            <li>• Feedback management</li>
            <li>• Retention strategies</li>
          </ul>
        </div>
      </div>
    </div>
  )
}