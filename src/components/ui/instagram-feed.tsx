'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

interface InstagramPost {
  id: string
  image: string
  caption: string
  likes: number
  comments: number
  timestamp: string
  link: string
}

interface InstagramFeedProps {
  stylistName: string
  username?: string
  posts?: InstagramPost[]
  className?: string
}

export function InstagramFeed({ stylistName, username, posts = [], className = '' }: InstagramFeedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>(posts)

  useEffect(() => {
    if (posts.length > 0) {
      setInstagramPosts(posts)
      setIsLoading(false)
      return
    }

    // Simulate loading Instagram posts (in real implementation, this would fetch from Instagram API)
    setTimeout(() => {
      const mockPosts: InstagramPost[] = [
        {
          id: '1',
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          caption: `✂ Fresh cut for our client! #barber #haircut #modernmen`,
          likes: 127,
          comments: 12,
          timestamp: '2h ago',
          link: '#'
        },
        {
          id: '2',
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          caption: `Classic fade with a modern twist ✨ #fadedhair #barberlife`,
          likes: 89,
          comments: 8,
          timestamp: '5h ago',
          link: '#'
        },
        {
          id: '3',
          image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          caption: `Before and after transformation! 💀➡️✨ #hairtransformation #barbershop`,
          likes: 156,
          comments: 21,
          timestamp: '1d ago',
          link: '#'
        }
      ]
      setInstagramPosts(mockPosts)
      setIsLoading(false)
    }, 1500)
  }, [posts])

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
              <Icons.phone className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">Instagram</span>
          </div>
          <div className="text-sm text-gray-500">@{username || 'modernmenbarbers'}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 rounded-full flex items-center justify-center">
            <Icons.phone className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800">Instagram</span>
        </div>
        <div className="text-sm text-gray-500">@{username || 'modernmenbarbers'}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {instagramPosts.slice(0, 6).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            onClick={() => window.open(post.link, '_blank')}
          >
            <img
              src={post.image}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <div className="flex items-center space-x-1">
                    <Icons.info className="h-4 w-4" />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icons.phone className="h-4 w-4" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </div>
                </div>
                <p className="text-xs px-2 line-clamp-2">{post.caption}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {instagramPosts.length > 6 && (
        <div className="text-center">
          <button
            onClick={() => window.open(`https://instagram.com/${username || 'modernmenbarbers'}`, '_blank')}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            View all {instagramPosts.length} posts →
          </button>
        </div>
      )}
    </div>
  )
}
