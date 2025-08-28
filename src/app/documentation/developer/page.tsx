import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Developer Documentation - Modern Men Hair Salon',
  description: 'Developer documentation for building and extending the salon management system',
}

export default function DeveloperDocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Developer Documentation
        </h1>
        <p className="text-slate-300">
          This is the placeholder for the developer documentation.
        </p>
      </div>
    </div>
  )
}
