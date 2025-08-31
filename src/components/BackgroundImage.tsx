'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BackgroundImageProps {
  name: 'showroom' | 'front-entrance' | 'barbers-working' | 'back-house' | 'modern-men-logo'
  size?: 'hero' | 'large' | 'medium' | 'small' | 'thumbnail'
  className?: string
  overlay?: boolean
  overlayOpacity?: number
  children?: React.ReactNode
  alt?: string
  priority?: boolean
}

const BACKGROUND_PATHS = {
  showroom: {
    hero: '/media/backgrounds/showroom/showroom-hero-1920x1080.webp',
    large: '/media/backgrounds/showroom/showroom-large-1200x675.webp',
    medium: '/media/backgrounds/showroom/showroom-medium-800x450.webp',
    small: '/media/backgrounds/showroom/showroom-small-400x225.webp',
    blur: '/media/backgrounds/showroom/showroom-blur-placeholder.webp'
  },
  'front-entrance': {
    hero: '/media/backgrounds/front-entrance/front-entrance-hero-1920x1080.webp',
    large: '/media/backgrounds/front-entrance/front-entrance-large-1200x675.webp',
    medium: '/media/backgrounds/front-entrance/front-entrance-medium-800x450.webp',
    small: '/media/backgrounds/front-entrance/front-entrance-small-400x225.webp',
    blur: '/media/backgrounds/front-entrance/front-entrance-blur-placeholder.webp'
  },
  'barbers-working': {
    hero: '/media/backgrounds/barbers-working/barbers-working-hero-1920x1080.webp',
    large: '/media/backgrounds/barbers-working/barbers-working-large-1200x675.webp',
    medium: '/media/backgrounds/barbers-working/barbers-working-medium-800x450.webp',
    small: '/media/backgrounds/barbers-working/barbers-working-small-400x225.webp',
    blur: '/media/backgrounds/barbers-working/barbers-working-blur-placeholder.webp'
  },
  'back-house': {
    hero: '/media/backgrounds/back-house/back-house-hero-1920x1080.webp',
    large: '/media/backgrounds/back-house/back-house-large-1200x675.webp',
    medium: '/media/backgrounds/back-house/back-house-medium-800x450.webp',
    small: '/media/backgrounds/back-house/back-house-small-400x225.webp',
    blur: '/media/backgrounds/back-house/back-house-blur-placeholder.webp'
  },
  'modern-men-logo': {
    hero: '/media/backgrounds/modern-men-logo/modern-men-logo-hero-1920x1080.webp',
    large: '/media/backgrounds/modern-men-logo/modern-men-logo-large-1200x675.webp',
    medium: '/media/backgrounds/modern-men-logo/modern-men-logo-medium-800x450.webp',
    small: '/media/backgrounds/modern-men-logo/modern-men-logo-small-400x225.webp',
    thumbnail: '/media/backgrounds/modern-men-logo/modern-men-logo-thumbnail-200x113.webp',
    blur: '/media/backgrounds/modern-men-logo/modern-men-logo-blur-placeholder.webp'
  }
} as const

const SIZE_DIMENSIONS = {
  hero: { width: 1920, height: 1080 },
  large: { width: 1200, height: 675 },
  medium: { width: 800, height: 450 },
  small: { width: 400, height: 225 },
  thumbnail: { width: 200, height: 113 }
} as const

/**
 * BackgroundImage Component
 * 
 * Provides optimized barbershop background images with multiple formats and sizes.
 * Automatically handles WebP/AVIF with JPEG fallbacks.
 * 
 * @example
 * // Hero section with overlay
 * <BackgroundImage 
 *   name="showroom" 
 *   size="hero" 
 *   overlay 
 *   className="min-h-screen"
 * >
 *   <div className="relative z-10">Hero content</div>
 * </BackgroundImage>
 * 
 * @example
 * // Service section background
 * <BackgroundImage 
 *   name="barbers-working" 
 *   size="large" 
 *   overlayOpacity={0.3}
 * />
 */
export function BackgroundImage({
  name,
  size = 'large',
  className,
  overlay = false,
  overlayOpacity = 0.5,
  children,
  alt,
  priority = false
}: BackgroundImageProps) {
  const imagePath = BACKGROUND_PATHS[name][size as keyof typeof BACKGROUND_PATHS[typeof name]]
  const dimensions = SIZE_DIMENSIONS[size as keyof typeof SIZE_DIMENSIONS]
  
  if (!imagePath || !dimensions) {
    console.warn(`Invalid background configuration: ${name} - ${size}`)
    return null
  }

  const defaultAlt = `Modern Men Barbershop - ${name.replace('-', ' ')} background`

  return (
    <div className={cn('relative', className)}>
      <Image
        src={imagePath}
        alt={alt || defaultAlt}
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="absolute inset-0 w-full h-full object-cover"
        placeholder="blur"
        blurDataURL={BACKGROUND_PATHS[name].blur}
      />
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * CSS Background Hook
 * 
 * Returns CSS background properties for use with Tailwind or styled components
 * 
 * @example
 * const bgProps = useBackgroundCSS('showroom', 'hero')
 * <div style={bgProps}>Content</div>
 */
export function useBackgroundCSS(
  name: BackgroundImageProps['name'], 
  size: BackgroundImageProps['size'] = 'large'
) {
  const imagePath = BACKGROUND_PATHS[name][size as keyof typeof BACKGROUND_PATHS[typeof name]]
  
  return {
    backgroundImage: `url('${imagePath}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
}

export default BackgroundImage
