import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Development Setup - Modern Men Hair Salon',
  description: 'Complete guide to setting up the development environment',
}

export default function DeveloperSetupPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Development Setup
        </h1>
        <p className="text-slate-300">
          Complete guide to setting up your development environment for the Modern Men Hair Salon management system.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Prerequisites</h2>
          <ul className="space-y-2 text-slate-300">
            <li>Node.js 18+ and npm/yarn</li>
            <li>Git for version control</li>
            <li>PostgreSQL database</li>
            <li>Code editor (VS Code recommended)</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Installation Steps</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-200">1. Clone the Repository</h3>
              <pre className="bg-slate-900 p-3 rounded text-sm text-slate-300 overflow-x-auto">
                <code>git clone https://github.com/your-org/modern-men-salon.git
cd modern-men-salon</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-200">2. Install Dependencies</h3>
              <pre className="bg-slate-900 p-3 rounded text-sm text-slate-300 overflow-x-auto">
                <code>npm install</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-200">3. Environment Configuration</h3>
              <pre className="bg-slate-900 p-3 rounded text-sm text-slate-300 overflow-x-auto">
                <code>cp .env.example .env.local
# Edit .env.local with your configuration</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-200">4. Database Setup</h3>
              <pre className="bg-slate-900 p-3 rounded text-sm text-slate-300 overflow-x-auto">
                <code>npm run db:migrate
npm run db:seed</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-slate-200">5. Start Development Server</h3>
              <pre className="bg-slate-900 p-3 rounded text-sm text-slate-300 overflow-x-auto">
                <code>npm run dev</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Next Steps</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• Review the <a href="/documentation/developer/api" className="text-cyan-400 hover:text-cyan-300">API documentation</a></li>
            <li>• Explore the <a href="/documentation/developer/components" className="text-cyan-400 hover:text-cyan-300">component library</a></li>
            <li>• Set up your <a href="/documentation/developer/testing" className="text-cyan-400 hover:text-cyan-300">testing environment</a></li>
            <li>• Read the <a href="/documentation/developer/contributing" className="text-cyan-400 hover:text-cyan-300">contribution guidelines</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}