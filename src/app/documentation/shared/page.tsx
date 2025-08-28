import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Resources - Modern Men Hair Salon',
  description: 'Shared resources including glossary, troubleshooting, and updates',
}

export default function SharedDocumentationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Shared Resources
        </h1>
        <p className="text-slate-300">
          This is the placeholder for the shared documentation.
        </p>
      </div>
    </div>
  )
}
