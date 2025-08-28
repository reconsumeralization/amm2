import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Documentation - Modern Men Hair Salon',
  description: 'Business documentation for salon owners, employees, and customers',
}

export default function BusinessDocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
          Business Documentation
        </h1>
        <p className="text-slate-300">
          This is the placeholder for the business documentation.
        </p>
      </div>
    </div>
  )
}
