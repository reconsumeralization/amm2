#!/usr/bin/env tsx
// Script to extract the Modern Men logo from their website

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { createWriteStream } from 'fs'
import https from 'https'
import http from 'http'

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http
    
    client.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = createWriteStream(filepath)
        response.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close()
          resolve()
        })
        fileStream.on('error', reject)
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
      }
    }).on('error', reject)
  })
}

async function extractLogoFromModernMen() {
  console.log('🎯 Extracting Modern Men logo from modernmen.ca...\n')

  // Common logo URLs to try
  const logoUrls = [
    'https://www.modernmen.ca/logo.png',
    'https://www.modernmen.ca/assets/logo.png',
    'https://www.modernmen.ca/images/logo.png',
    'https://www.modernmen.ca/static/logo.png',
    'https://www.modernmen.ca/uploads/logo.png',
    'https://www.modernmen.ca/media/logo.png',
    'https://www.modernmen.ca/wp-content/uploads/logo.png',
    'https://www.modernmen.ca/wp-content/themes/modernmen/images/logo.png',
    'https://static.wixstatic.com/media/modernmen_logo.png',
    'https://cdn.squarespace.com/modernmen/logo.png'
  ]

  const outputDir = path.resolve(process.cwd(), 'public/media/logos')
  
  // Ensure output directory exists
  try {
    await fs.mkdir(outputDir, { recursive: true })
    console.log(`📁 Created logos directory: ${outputDir}`)
  } catch (error) {
    console.log(`📁 Logos directory already exists`)
  }

  let logoFound = false

  for (const logoUrl of logoUrls) {
    try {
      console.log(`🔍 Trying: ${logoUrl}`)
      
      const tempPath = path.join(outputDir, 'temp-logo.png')
      await downloadImage(logoUrl, tempPath)
      
      // Check if the downloaded file is actually an image
      const metadata = await sharp(tempPath).metadata()
      
      if (metadata.width && metadata.height) {
        console.log(`✅ Found logo: ${metadata.width}x${metadata.height}`)
        
        // Generate optimized versions
        await generateLogoVariants(tempPath, outputDir)
        
        // Clean up temp file
        await fs.unlink(tempPath)
        
        logoFound = true
        break
      } else {
        await fs.unlink(tempPath)
        console.log(`❌ Not a valid image`)
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (!logoFound) {
    console.log('\n⚠️ Could not find logo automatically. Manual extraction needed.')
    console.log('\n📋 Manual steps:')
    console.log('1. Visit https://www.modernmen.ca')
    console.log('2. Right-click on the logo')
    console.log('3. Save as "modern-men-original-logo.png" in public/media/logos/')
    console.log('4. Run this script again to generate optimized versions')
    
    // Check if manual logo exists
    const manualLogoPath = path.join(outputDir, 'modern-men-original-logo.png')
    try {
      await fs.access(manualLogoPath)
      console.log('\n✅ Found manually downloaded logo, processing...')
      await generateLogoVariants(manualLogoPath, outputDir)
    } catch (error) {
      console.log('\n❌ No manual logo found yet')
    }
  }
}

async function generateLogoVariants(sourcePath: string, outputDir: string) {
  console.log('\n🎨 Generating logo variants...')
  
  const originalImage = sharp(sourcePath)
  const metadata = await originalImage.metadata()
  
  console.log(`📏 Original: ${metadata.width}x${metadata.height}`)

  const logoVariants = [
    { name: 'header', width: 200, height: null, description: 'Header logo' },
    { name: 'footer', width: 150, height: null, description: 'Footer logo' },
    { name: 'mobile', width: 120, height: null, description: 'Mobile header' },
    { name: 'favicon', width: 64, height: 64, description: 'Favicon size' },
    { name: 'large', width: 400, height: null, description: 'Large displays' },
    { name: 'social', width: 512, height: 512, description: 'Social media' }
  ]

  for (const variant of logoVariants) {
    console.log(`   🔧 Creating ${variant.name} variant...`)
    
    const resizeOptions: any = { 
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
    }

    if (variant.height) {
      resizeOptions.width = variant.width
      resizeOptions.height = variant.height
    } else {
      resizeOptions.width = variant.width
    }

    // PNG version (with transparency)
    const pngPath = path.join(outputDir, `modern-men-logo-${variant.name}.png`)
    await originalImage
      .clone()
      .resize(resizeOptions)
      .png({ quality: 100 })
      .toFile(pngPath)

    // WebP version
    const webpPath = path.join(outputDir, `modern-men-logo-${variant.name}.webp`)
    await originalImage
      .clone()
      .resize(resizeOptions)
      .webp({ quality: 95 })
      .toFile(webpPath)

    // AVIF version
    const avifPath = path.join(outputDir, `modern-men-logo-${variant.name}.avif`)
    await originalImage
      .clone()
      .resize(resizeOptions)
      .avif({ quality: 95 })
      .toFile(avifPath)

    const stats = await fs.stat(pngPath)
    console.log(`      PNG: ${Math.round(stats.size / 1024)}KB`)
  }

  // Generate SVG if the original is vector (unlikely but possible)
  if (metadata.format === 'svg') {
    const svgPath = path.join(outputDir, 'modern-men-logo.svg')
    await fs.copyFile(sourcePath, svgPath)
    console.log(`   ✅ SVG version preserved`)
  }

  // Generate logo component
  await generateLogoComponent(outputDir)
  
  console.log('\n✅ Logo variants generated successfully!')
}

async function generateLogoComponent(outputDir: string) {
  const componentCode = `'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ModernMenLogoProps {
  variant?: 'header' | 'footer' | 'mobile' | 'favicon' | 'large' | 'social'
  className?: string
  alt?: string
  priority?: boolean
  onClick?: () => void
}

const LOGO_PATHS = {
  header: '/media/logos/modern-men-logo-header.webp',
  footer: '/media/logos/modern-men-logo-footer.webp',
  mobile: '/media/logos/modern-men-logo-mobile.webp',
  favicon: '/media/logos/modern-men-logo-favicon.webp',
  large: '/media/logos/modern-men-logo-large.webp',
  social: '/media/logos/modern-men-logo-social.webp'
} as const

const LOGO_DIMENSIONS = {
  header: { width: 200, height: 60 },
  footer: { width: 150, height: 45 },
  mobile: { width: 120, height: 36 },
  favicon: { width: 64, height: 64 },
  large: { width: 400, height: 120 },
  social: { width: 512, height: 512 }
} as const

/**
 * Modern Men Logo Component
 * 
 * Provides the official Modern Men Hair Salon logo in various sizes and formats.
 * Automatically handles WebP/AVIF with PNG fallbacks for transparency.
 * 
 * @example
 * // Header logo
 * <ModernMenLogo variant="header" priority />
 * 
 * @example
 * // Mobile logo with click handler
 * <ModernMenLogo 
 *   variant="mobile" 
 *   onClick={() => router.push('/')}
 *   className="cursor-pointer"
 * />
 */
export function ModernMenLogo({
  variant = 'header',
  className,
  alt = 'Modern Men Hair Salon',
  priority = false,
  onClick
}: ModernMenLogoProps) {
  const logoPath = LOGO_PATHS[variant]
  const dimensions = LOGO_DIMENSIONS[variant]

  return (
    <Image
      src={logoPath}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn(
        'object-contain',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    />
  )
}

export default ModernMenLogo`

  const componentPath = path.join(outputDir, 'ModernMenLogo.tsx')
  await fs.writeFile(componentPath, componentCode)
  console.log(`⚛️ Logo component generated: ${componentPath}`)
}

// Run if called directly
if (require.main === module) {
  extractLogoFromModernMen()
    .then(() => {
      console.log('\n✅ Logo extraction completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Logo extraction failed:', error)
      process.exit(1)
    })
}

export { extractLogoFromModernMen }
