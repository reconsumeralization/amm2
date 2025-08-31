'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ResponsiveImageProps {
  src: string
  alt: string
  barberName?: string
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'xl' | 'profile' | 'hero'
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  placeholder?: 'blur' | 'empty'
  fill?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  barberName,
  size = 'medium',
  className,
  priority = false,
  loading = 'lazy',
  quality = 90,
  placeholder = 'blur',
  fill = false,
  sizes,
  onLoad,
  onError
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Generate responsive image sources for barber photos
  const generateBarberImageSources = (barberName: string, size: string) => {
    const barberKey = barberName.toLowerCase().replace(/\s+/g, '-')
    const basePath = `/media/barbers/${barberKey}`
    
    return {
      webp: `${basePath}/${size}.webp`,
      avif: `${basePath}/${size}.avif`,
      jpeg: `${basePath}/${size}.jpeg`,
      png: `${basePath}/${size}.png`,
      blur: `${basePath}/blur.webp`
    }
  }

  // Generate srcSet for different screen densities
  const generateSrcSet = (barberName: string) => {
    const barberKey = barberName.toLowerCase().replace(/\s+/g, '-')
    const basePath = `/media/barbers/${barberKey}`
    
    return {
      webp: `${basePath}/small.webp 300w, ${basePath}/medium.webp 600w, ${basePath}/large.webp 1200w, ${basePath}/xl.webp 1800w`,
      avif: `${basePath}/small.avif 300w, ${basePath}/medium.avif 600w, ${basePath}/large.avif 1200w, ${basePath}/xl.avif 1800w`,
      jpeg: `${basePath}/small.jpeg 300w, ${basePath}/medium.jpeg 600w, ${basePath}/large.jpeg 1200w, ${basePath}/xl.jpeg 1800w`
    }
  }

  // Default sizes for responsive behavior
  const defaultSizes = sizes || '(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1440px) 1200px, 1800px'

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
    onError?.()
  }

  // If it's a barber image, use optimized responsive sources
  if (barberName) {
    const sources = generateBarberImageSources(barberName, size)
    const srcSets = generateSrcSet(barberName)
    
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {/* Loading placeholder */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Error fallback */}
        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full" />
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        ) : (
          <picture>
            {/* AVIF - Modern browsers, best compression */}
            <source
              srcSet={srcSets.avif}
              sizes={defaultSizes}
              type="image/avif"
            />
            
            {/* WebP - Good compression, wide support */}
            <source
              srcSet={srcSets.webp}
              sizes={defaultSizes}
              type="image/webp"
            />
            
            {/* JPEG - Fallback */}
            <source
              srcSet={srcSets.jpeg}
              sizes={defaultSizes}
              type="image/jpeg"
            />
            
            {/* Main image element */}
            <Image
              src={sources.jpeg}
              alt={alt}
              fill={fill}
              priority={priority}
              loading={loading}
              quality={quality}
              sizes={defaultSizes}
              placeholder={placeholder}
              blurDataURL={placeholder === 'blur' ? sources.blur : undefined}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                'transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100',
                fill ? 'object-cover' : ''
              )}
            />
          </picture>
        )}
      </div>
    )
  }

  // Regular image (non-barber)
  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        loading={loading}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : ''
        )}
      />
    </div>
  )
}

// Specialized barber image component
interface BarberImageProps extends Omit<ResponsiveImageProps, 'src' | 'barberName'> {
  barberName: 'Marcus Rodriguez' | 'Sarah Mitchell' | 'Emma Thompson' | 'Zoe Chen'
  variant?: 'avatar' | 'card' | 'profile' | 'hero'
}

export function BarberImage({
  barberName,
  variant = 'card',
  alt,
  className,
  ...props
}: BarberImageProps) {
  const sizeMap = {
    avatar: 'thumbnail',
    card: 'medium', 
    profile: 'profile',
    hero: 'hero'
  } as const

  const sizesMap = {
    avatar: '150px',
    card: '(max-width: 640px) 300px, (max-width: 1024px) 600px, 1200px',
    profile: '(max-width: 640px) 300px, 400px',
    hero: '100vw'
  }

  return (
    <ResponsiveImage
      src="" // Will be overridden by barberName logic
      alt={alt || `${barberName} - Professional Barber`}
      barberName={barberName}
      size={sizeMap[variant]}
      sizes={sizesMap[variant]}
      className={cn(
        variant === 'avatar' && 'w-12 h-12 rounded-full',
        variant === 'card' && 'w-full aspect-square rounded-lg',
        variant === 'profile' && 'w-full max-w-sm aspect-[4/5] rounded-lg',
        variant === 'hero' && 'w-full h-64 md:h-96 lg:h-[500px]',
        className
      )}
      {...props}
    />
  )
}

export default ResponsiveImage
