import React from 'react'
import Link from 'next/link'

type BlogPostCardProps = {
  title: string
  excerpt: string
  href: string
}

export function BlogPostCard({ title, excerpt, href }: BlogPostCardProps) {
  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{excerpt}</p>
      <Link href={href} className="text-red-600 font-medium">Read more →</Link>
    </div>
  )
}
