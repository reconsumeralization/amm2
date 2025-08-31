import React from 'react'
import Link from 'next/link'

export function SocialMediaLinks() {
  return (
    <div className="flex gap-4 text-sm">
      <Link className="hover:text-red-600" href="#">Instagram</Link>
      <Link className="hover:text-red-600" href="#">Facebook</Link>
      <Link className="hover:text-red-600" href="#">TikTok</Link>
    </div>
  )
}
