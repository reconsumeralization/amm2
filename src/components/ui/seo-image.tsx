'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import { cn } from '@/lib/utils'

interface SEOImageProps {
  seoName: string
  title: string
  description: string
  keywords: string[]
  category: 'barber-profile' | 'stylist-profile' | 'hair-styling-product' | 'hair-care-product' | 'barber-interior'
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'xl' | 'profile' | 'card' | 'gallery' | 'zoom' | 'hero'
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  fill?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  showZoom?: boolean
  person?: {
    name: string
    jobTitle: string
    worksFor: string
    email?: string
    experience?: number
  }
  product?: {
    name: string
    brand: string
    price: number
    category: string
    sku?: string
  }
  location?: string
}

export function SEOImage({
  seoName,
  title,
  description,
  keywords,
  category,
  size = 'medium',
  className,
  priority = false,
  loading = 'lazy',
  quality = 95,
  fill = false,
  sizes,
  onLoad,
  onError,
  showZoom = false,
  person,
  product,
  location
}: SEOImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isZoomed, setIsZoomed] = useState(false)

  const basePath = `/media/seo/${seoName}`
  
  // Generate SEO-friendly image sources
  const generateSEOSources = (size: string) => {
    const sizeMap = {
      thumbnail: '150x150',
      small: '300x300',
      medium: '600x600',
      large: '1200x1200',
      xl: '1800x1800',
      profile: '400x500',
      card: '500x500',
      gallery: '800x800',
      zoom: '1600x1600',
      hero: '1920x1080'
    }
    
    const dimensions = sizeMap[size] || '600x600'
    
    return {
      webp: `${basePath}/${seoName}-${size}-${dimensions}.webp`,
      avif: `${basePath}/${seoName}-${size}-${dimensions}.avif`,
      jpeg: `${basePath}/${seoName}-${size}-${dimensions}.jpeg`,
      blur: `${basePath}/${seoName}-blur-placeholder.webp`
    }
  }

  // Generate responsive srcSet with SEO names
  const generateSEOSrcSet = (format: 'webp' | 'avif' | 'jpeg') => {
    const sizes = [
      { name: 'thumbnail', width: 150, dimensions: '150x150' },
      { name: 'small', width: 300, dimensions: '300x300' },
      { name: 'medium', width: 600, dimensions: '600x600' },
      { name: 'gallery', width: 800, dimensions: '800x800' },
      { name: 'large', width: 1200, dimensions: '1200x1200' },
      { name: 'zoom', width: 1600, dimensions: '1600x1600' },
      { name: 'xl', width: 1800, dimensions: '1800x1800' }
    ]
    
    return sizes.map(s => 
      `${basePath}/${seoName}-${s.name}-${s.dimensions}.${format} ${s.width}w`
    ).join(', ')
  }

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    const baseUrl = 'https://modernmen.com'
    const imageUrl = `${baseUrl}${generateSEOSources(size).webp}`
    
    if (person) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': person.name,
        'jobTitle': person.jobTitle,
        'worksFor': {
          '@type': 'Organization',
          'name': person.worksFor,
          'url': baseUrl,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '425 Victoria Avenue East',
            'addressLocality': 'Regina',
            'addressRegion': 'Saskatchewan',
            'postalCode': 'S4N 0N8',
            'addressCountry': 'Canada'
          },
          'telephone': '(306) 522-4111'
        },
        'email': person.email,
        'image': {
          '@type': 'ImageObject',
          'url': imageUrl,
          'caption': title,
          'description': description,
          'keywords': keywords.join(', '),
          'contentLocation': location,
          'width': '1200',
          'height': '1200',
          'encodingFormat': 'image/webp'
        },
        'hasOccupation': {
          '@type': 'Occupation',
          'name': person.jobTitle,
          'occupationLocation': {
            '@type': 'City',
            'name': 'Regina, Saskatchewan'
          }
        },
        'knowsAbout': keywords,
        'memberOf': {
          '@type': 'Organization',
          'name': 'Modern Men Hair barber'
        }
      }
    } else if (product) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'description': description,
        'brand': {
          '@type': 'Brand',
          'name': product.brand
        },
        'category': product.category,
        'sku': product.sku,
        'offers': {
          '@type': 'Offer',
          'price': product.price,
          'priceCurrency': 'CAD',
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': 'Modern Men Hair barber',
            'url': baseUrl
          }
        },
        'image': {
          '@type': 'ImageObject',
          'url': imageUrl,
          'caption': title,
          'description': description,
          'keywords': keywords.join(', '),
          'width': '1200',
          'height': '1200',
          'encodingFormat': 'image/webp'
        },
        'keywords': keywords.join(', ')
      }
    }
    
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      'url': imageUrl,
      'caption': title,
      'description': description,
      'keywords': keywords.join(', '),
      'contentLocation': location,
      'width': '1200',
      'height': '1200',
      'encodingFormat': 'image/webp'
    }
  }

  const sources = generateSEOSources(size)
  const structuredData = generateStructuredData()
  
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

  const handleImageClick = () => {
    if (showZoom) {
      setIsZoomed(!isZoomed)
    }
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div 
        className={cn(
          'relative overflow-hidden transition-transform duration-200',
          showZoom && 'cursor-zoom-in hover:scale-105',
          className
        )}
        onClick={handleImageClick}
        itemScope
        itemType={person ? 'https://schema.org/Person' : product ? 'https://schema.org/Product' : 'https://schema.org/ImageObject'}
      >
        {/* Microdata attributes */}
        {person && (
          <>
            <meta itemProp="name" content={person.name} />
            <meta itemProp="jobTitle" content={person.jobTitle} />
            <meta itemProp="email" content={person.email || ''} />
          </>
        )}
        
        {product && (
          <>
            <meta itemProp="name" content={product.name} />
            <meta itemProp="brand" content={product.brand} />
            <meta itemProp="price" content={product.price.toString()} />
            <meta itemProp="priceCurrency" content="CAD" />
          </>
        )}

        <meta itemProp="description" content={description} />
        <meta itemProp="keywords" content={keywords.join(', ')} />
        
        {/* Loading placeholder */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Error fallback */}
        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 min-h-[200px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{person ? '👤' : product ? '📦' : '🖼️'}</span>
              </div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">Image unavailable</p>
            </div>
          </div>
        ) : (
          <picture>
            {/* AVIF - Best compression for modern browsers */}
            <source
              srcSet={generateSEOSrcSet('avif')}
              sizes={defaultSizes}
              type="image/avif"
            />
            
            {/* WebP - Good compression with wide support */}
            <source
              srcSet={generateSEOSrcSet('webp')}
              sizes={defaultSizes}
              type="image/webp"
            />
            
            {/* JPEG - Universal fallback */}
            <source
              srcSet={generateSEOSrcSet('jpeg')}
              sizes={defaultSizes}
              type="image/jpeg"
            />
            
            {/* Main image element with microdata */}
            <Image
              src={sources.jpeg}
              alt={title}
              fill={fill}
              priority={priority}
              loading={loading}
              quality={quality}
              sizes={defaultSizes}
              placeholder="blur"
              blurDataURL={sources.blur}
              onLoad={handleLoad}
              onError={handleError}
              itemProp="image"
              className={cn(
                'transition-all duration-300',
                isLoading ? 'opacity-0' : 'opacity-100',
                fill ? 'object-cover' : 'object-contain',
                showZoom && 'hover:scale-105'
              )}
            />
          </picture>
        )}
        
        {/* SEO-friendly caption (hidden but crawlable) */}
        <div className="sr-only" itemProp="caption">
          {description}
        </div>
        
        {/* Zoom indicator */}
        {showZoom && !imageError && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            🔍 Click to zoom
          </div>
        )}
      </div>

      {/* Zoom modal with enhanced SEO */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center z-10"
              onClick={() => setIsZoomed(false)}
              aria-label="Close zoom view"
            >
              ✕
            </button>
            <Image
              src={generateSEOSources('zoom').webp}
              alt={`${title} - Detailed view`}
              width={1600}
              height={1600}
              className="max-w-full max-h-full object-contain"
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  )
}

// Specialized barber image component with SEO
interface SEOBarberImageProps extends Omit<SEOImageProps, 'seoName' | 'title' | 'description' | 'keywords' | 'category' | 'person'> {
  barberName: 'Hicham Mellouli' | 'Sarah Mitchell' | 'Emma Thompson' | 'Zoe Chen'
  variant?: 'avatar' | 'card' | 'profile' | 'hero'
}

export function SEOBarberImage({
  barberName,
  variant = 'card',
  className,
  ...props
}: SEOBarberImageProps) {
  const barberConfigs = {
    'Hicham Mellouli': {
      seoName: 'hicham-mellouli-professional-barber-regina-saskatchewan',
      title: 'Hicham Mellouli - Professional Barber in Regina, Saskatchewan',
      description: 'Master barber Hicham Mellouli specializing in precision fades, beard sculpting, and modern cuts at Modern Men Hair barber',
      keywords: ['barber', 'regina', 'saskatchewan', 'precision-fades', 'beard-sculpting', 'modern-cuts'],
      person: {
        name: 'Hicham Mellouli',
        jobTitle: 'Master Barber',
        worksFor: 'Modern Men Hair barber',
        email: 'hicham.mellouli@modernmen.com',
        experience: 10
      }
    },
    'Sarah Mitchell': {
      seoName: 'sarah-mitchell-creative-stylist-regina-hair-barber',
      title: 'Sarah Mitchell - Creative Hair Stylist in Regina',
      description: 'Creative stylist Sarah Mitchell specializing in trendy cuts, color work, and texture styling',
      keywords: ['stylist', 'regina', 'trendy-cuts', 'color-work', 'texture-styling', 'creative-hair'],
      person: {
        name: 'Sarah Mitchell',
        jobTitle: 'Creative Hair Stylist',
        worksFor: 'Modern Men Hair barber',
        email: 'sarah.mitchell@modernmen.com',
        experience: 6
      }
    },
    'Emma Thompson': {
      seoName: 'emma-thompson-senior-stylist-bridal-specialist-regina',
      title: 'Emma Thompson - Senior Stylist & Bridal Specialist in Regina',
      description: 'Senior stylist Emma Thompson specializing in classic cuts, bridal styling, and special occasions',
      keywords: ['senior-stylist', 'bridal-specialist', 'regina', 'classic-cuts', 'special-occasions'],
      person: {
        name: 'Emma Thompson',
        jobTitle: 'Senior Hair Stylist & Bridal Specialist',
        worksFor: 'Modern Men Hair barber',
        email: 'emma.thompson@modernmen.com',
        experience: 10
      }
    },
    'Zoe Chen': {
      seoName: 'zoe-chen-innovative-stylist-edgy-cuts-regina',
      title: 'Zoe Chen - Innovative Stylist for Edgy Cuts in Regina',
      description: 'Innovative stylist Zoe Chen specializing in edgy cuts, avant-garde styling, and creative color work',
      keywords: ['innovative-stylist', 'edgy-cuts', 'avant-garde', 'creative-color', 'regina'],
      person: {
        name: 'Zoe Chen',
        jobTitle: 'Innovative Hair Stylist',
        worksFor: 'Modern Men Hair barber',
        email: 'zoe.chen@modernmen.com',
        experience: 5
      }
    }
  }

  const config = barberConfigs[barberName]
  const sizeMap = {
    avatar: 'thumbnail',
    card: 'medium',
    profile: 'profile',
    hero: 'hero'
  } as const

  return (
    <SEOImage
      {...config}
      category="barber-profile"
      size={sizeMap[variant]}
      location="Regina, Saskatchewan, Canada"
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

// Specialized product image component with SEO
interface SEOProductImageProps extends Omit<SEOImageProps, 'seoName' | 'title' | 'description' | 'keywords' | 'category' | 'product'> {
  productName: 'Premium Styling Pomade' | 'Matte Finish Clay'
  variant?: 'thumbnail' | 'card' | 'gallery' | 'zoom' | 'hero'
}

export function SEOProductImage({
  productName,
  variant = 'card',
  className,
  ...props
}: SEOProductImageProps) {
  const productConfigs = {
    'Premium Styling Pomade': {
      seoName: 'modern-men-premium-styling-pomade-strong-hold-hair-product',
      title: 'Modern Men Premium Styling Pomade - Strong Hold Hair Product',
      description: 'Professional-grade styling pomade with strong hold and high shine finish for classic and modern hairstyles',
      keywords: ['pomade', 'hair-styling', 'strong-hold', 'high-shine', 'professional', 'modern-men'],
      product: {
        name: 'Premium Styling Pomade',
        brand: 'Modern Men',
        price: 24.99,
        category: 'Hair Styling Products',
        sku: 'MM-PSP-001'
      }
    },
    'Matte Finish Clay': {
      seoName: 'modern-men-matte-finish-clay-natural-texture-hair-product',
      title: 'Modern Men Matte Finish Clay - Natural Texture Hair Product',
      description: 'Lightweight matte clay for natural-looking texture and medium hold, perfect for casual and professional styles',
      keywords: ['clay', 'matte-finish', 'natural-texture', 'medium-hold', 'hair-product'],
      product: {
        name: 'Matte Finish Clay',
        brand: 'Modern Men',
        price: 22.99,
        category: 'Hair Styling Products',
        sku: 'MM-MFC-002'
      }
    }
  }

  const config = productConfigs[productName]

  return (
    <SEOImage
      {...config}
      category="hair-styling-product"
      size={variant}
      className={cn(
        variant === 'thumbnail' && 'w-20 h-20',
        variant === 'card' && 'w-full aspect-square rounded-lg',
        variant === 'gallery' && 'w-full max-w-2xl aspect-square rounded-lg',
        variant === 'zoom' && 'w-full max-w-4xl aspect-square',
        variant === 'hero' && 'w-full h-64 md:h-96 lg:h-[500px]',
        className
      )}
      {...props}
    />
  )
}

export default SEOImage
