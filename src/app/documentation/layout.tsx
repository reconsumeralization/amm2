import React from "react"
import { Metadata } from 'next'
import { DocumentationLayoutClient } from "./DocumentationLayoutClient"

export const metadata: Metadata = {
  title: 'Documentation - Modern Men Hair BarberShop',
  description: 'Comprehensive documentation for developers, business users, and administrators',
  keywords: ['documentation', 'API', 'guides', 'BarberShop management', 'developer tools'],
  openGraph: {
    title: 'Modern Men Hair BarberShop - Documentation',
    description: 'Comprehensive documentation for developers, business users, and administrators',
    type: 'website',
  },
}

export default function DocumentationLayout({ children }: { children: React.ReactNode }) {
  return <DocumentationLayoutClient>{children}</DocumentationLayoutClient>
} 
