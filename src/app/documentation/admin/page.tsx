import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Administration - Modern Men Hair Salon',
  description: 'System administration documentation for deployment, monitoring, and maintenance',
}

export default function AdminDocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          System Administration
        </h1>
        <p className="text-slate-300">
          Comprehensive system administration documentation for deploying, monitoring, 
          and maintaining the Modern Men Hair Salon management system in production environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Deployment & Configuration</h2>
          <p className="text-slate-400 text-sm mb-4">
            Production deployment guides and environment configuration
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Production Deployment
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Environment Variables
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              SSL & Security Setup
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Monitoring & Maintenance</h2>
          <p className="text-slate-400 text-sm mb-4">
            System monitoring, performance optimization, and maintenance procedures
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Health Monitoring
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Performance Tuning
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Log Management
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Backup & Recovery</h2>
          <p className="text-slate-400 text-sm mb-4">
            Data backup strategies and disaster recovery procedures
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Backup Procedures
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Disaster Recovery
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Data Migration
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-600 transition-colors">
          <h2 className="text-xl font-semibold mb-2 text-slate-100">Troubleshooting</h2>
          <p className="text-slate-400 text-sm mb-4">
            Common issues, diagnostic tools, and resolution procedures
          </p>
          <ul className="space-y-1">
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Common Issues
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Diagnostic Tools
            </li>
            <li className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>
              Support Escalation
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}