'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  productName: string
  alt?: string
  variant?: 'thumbnail' | 'card' | 'gallery' | 'zoom' | 'hero'
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  placeholder?: 'blur' | 'empty'
  fill?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  showZoom?: boolean
}

export function ProductImage({
  productName,
  alt,
  variant = 'card',
  className,
  priority = false,
  loading = 'lazy',
  quality = 95,
  placeholder = 'blur',
  fill = false,
  sizes,
  onLoad,
  onError,
  showZoom = false
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isZoomed, setIsZoomed] = useState(false)

  const productKey = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const basePath = `/media/products/${productKey}`
  
  // Generate responsive image sources
  const generateSources = (size: string) => ({
    webp: `${basePath}/${size}.webp`,
    avif: `${basePath}/${size}.avif`,
    jpeg: `${basePath}/${size}.jpeg`,
    png: `${basePath}/${size}.png`,
    blur: `${basePath}/blur.webp`
  })

  const sizeMap = {
    thumbnail: 'thumbnail',
    card: 'medium',
    gallery: 'gallery',
    zoom: 'zoom',
    hero: 'hero'
  }

  const sizesMap = {
    thumbnail: '150px',
    card: '(max-width: 640px) 300px, (max-width: 1024px) 600px, 800px',
    gallery: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
    zoom: '(max-width: 768px) 100vw, 1600px',
    hero: '100vw'
  }

  const sources = generateSources(sizeMap[variant])
  const srcSets = {
    webp: `${basePath}/thumbnail.webp 150w, ${basePath}/small.webp 300w, ${basePath}/medium.webp 600w, ${basePath}/gallery.webp 800w, ${basePath}/large.webp 1200w, ${basePath}/zoom.webp 1600w`,
    avif: `${basePath}/thumbnail.avif 150w, ${basePath}/small.avif 300w, ${basePath}/medium.avif 600w, ${basePath}/gallery.avif 800w, ${basePath}/large.avif 1200w, ${basePath}/zoom.avif 1600w`,
    jpeg: `${basePath}/thumbnail.jpeg 150w, ${basePath}/small.jpeg 300w, ${basePath}/medium.jpeg 600w, ${basePath}/gallery.jpeg 800w, ${basePath}/large.jpeg 1200w, ${basePath}/zoom.jpeg 1600w`
  }

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
      <div 
        className={cn(
          'relative overflow-hidden transition-transform duration-200',
          showZoom && 'cursor-zoom-in hover:scale-105',
          className
        )}
        onClick={handleImageClick}
      >
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
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-sm font-medium">Product Image</p>
              <p className="text-xs">{productName}</p>
            </div>
          </div>
        ) : (
          <picture>
            {/* AVIF - Best compression for modern browsers */}
            <source
              srcSet={srcSets.avif}
              sizes={sizes || sizesMap[variant]}
              type="image/avif"
            />
            
            {/* WebP - Good compression with wide support */}
            <source
              srcSet={srcSets.webp}
              sizes={sizes || sizesMap[variant]}
              type="image/webp"
            />
            
            {/* JPEG - Universal fallback */}
            <source
              srcSet={srcSets.jpeg}
              sizes={sizes || sizesMap[variant]}
              type="image/jpeg"
            />
            
            {/* Main image element */}
            <Image
              src={sources.jpeg}
              alt={alt || `${productName} - Modern Men Hair Products`}
              fill={fill}
              priority={priority}
              loading={loading}
              quality={quality}
              sizes={sizes || sizesMap[variant]}
              placeholder={placeholder}
              blurDataURL={placeholder === 'blur' ? sources.blur : undefined}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                'transition-all duration-300',
                isLoading ? 'opacity-0' : 'opacity-100',
                fill ? 'object-cover' : 'object-contain',
                showZoom && 'hover:scale-105'
              )}
            />
          </picture>
        )}
        
        {/* Zoom indicator */}
        {showZoom && !imageError && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            🔍 Click to zoom
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setIsZoomed(false)}
            >
              ✕
            </button>
            <Image
              src={generateSources('zoom').webp}
              alt={alt || `${productName} - Zoomed view`}
              width={1600}
              height={1600}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}

// Product grid component for displaying multiple products
interface ProductGridProps {
  products: Array<{
    id: string
    name: string
    price: number
    category: string
    image?: string
  }>
  columns?: 2 | 3 | 4
  showPrices?: boolean
  onProductClick?: (productId: string) => void
}

export function ProductGrid({ 
  products, 
  columns = 3, 
  showPrices = true,
  onProductClick 
}: ProductGridProps) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-6', gridClass[columns])}>
      {products.map((product) => (
        <div 
          key={product.id}
          className="group cursor-pointer"
          onClick={() => onProductClick?.(product.id)}
        >
          <div className="aspect-square mb-3 rounded-lg overflow-hidden">
            <ProductImage
              productName={product.name}
              variant="card"
              className="w-full h-full group-hover:scale-105 transition-transform duration-200"
              showZoom={false}
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.category}</p>
            {showPrices && (
              <p className="font-bold text-sm">${product.price}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductImage
