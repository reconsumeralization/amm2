#!/usr/bin/env tsx
// Barbershop background image upscaling and optimization script

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

interface BackgroundConfig {
  name: string
  filename: string
  description: string
  usage: string[]
  targetSizes: { width: number; height: number; suffix: string }[]
}

const BACKGROUND_CONFIGS: BackgroundConfig[] = [
  {
    name: 'Showroom',
    filename: 'showrom.png',
    description: 'Modern barbershop showroom with reception area',
    usage: ['hero-sections', 'landing-page', 'about-page'],
    targetSizes: [
      { width: 1920, height: 1080, suffix: 'hero' },
      { width: 1200, height: 675, suffix: 'large' },
      { width: 800, height: 450, suffix: 'medium' },
      { width: 400, height: 225, suffix: 'small' }
    ]
  },
  {
    name: 'Front Entrance',
    filename: 'front re.png',
    description: 'Front entrance and exterior view of the barbershop',
    usage: ['contact-page', 'location-sections', 'about-us'],
    targetSizes: [
      { width: 1920, height: 1080, suffix: 'hero' },
      { width: 1200, height: 675, suffix: 'large' },
      { width: 800, height: 450, suffix: 'medium' },
      { width: 400, height: 225, suffix: 'small' }
    ]
  },
  {
    name: 'Barbers Working',
    filename: 'barbsworkin.png',
    description: 'Barbers actively working with clients in the shop',
    usage: ['services-page', 'team-sections', 'gallery'],
    targetSizes: [
      { width: 1920, height: 1080, suffix: 'hero' },
      { width: 1200, height: 675, suffix: 'large' },
      { width: 800, height: 450, suffix: 'medium' },
      { width: 400, height: 225, suffix: 'small' }
    ]
  },
  {
    name: 'Back House',
    filename: 'backhouse.png',
    description: 'Back area and private sections of the barbershop',
    usage: ['staff-areas', 'premium-services', 'private-sections'],
    targetSizes: [
      { width: 1920, height: 1080, suffix: 'hero' },
      { width: 1200, height: 675, suffix: 'large' },
      { width: 800, height: 450, suffix: 'medium' },
      { width: 400, height: 225, suffix: 'small' }
    ]
  },
  {
    name: 'Modern Men Logo',
    filename: 'modernmen.png',
    description: 'Modern Men brand logo and branding elements',
    usage: ['headers', 'footers', 'branding', 'overlays'],
    targetSizes: [
      { width: 1920, height: 1080, suffix: 'hero' },
      { width: 1200, height: 675, suffix: 'large' },
      { width: 800, height: 450, suffix: 'medium' },
      { width: 400, height: 225, suffix: 'small' },
      { width: 200, height: 113, suffix: 'thumbnail' }
    ]
  }
]

async function upscaleAndOptimizeBackgrounds() {
  console.log('🎨 Starting barbershop background image processing...\n')

  const sourceDir = path.resolve(process.cwd(), 'public/media/backroundsBarbershop')
  const outputDir = path.resolve(process.cwd(), 'public/media/backgrounds')

  // Ensure output directory exists
  try {
    await fs.mkdir(outputDir, { recursive: true })
    console.log(`📁 Created output directory: ${outputDir}`)
  } catch (error) {
    console.log(`📁 Output directory already exists: ${outputDir}`)
  }

  for (const config of BACKGROUND_CONFIGS) {
    console.log(`\n🖼️ Processing: ${config.name}`)
    console.log(`   📝 Description: ${config.description}`)
    console.log(`   🎯 Usage: ${config.usage.join(', ')}`)

    const sourcePath = path.join(sourceDir, config.filename)
    const seoName = config.name.toLowerCase().replace(/\s+/g, '-')
    const backgroundDir = path.join(outputDir, seoName)

    // Create specific directory for this background
    try {
      await fs.mkdir(backgroundDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    try {
      // Check if source file exists
      await fs.access(sourcePath)
      
      // Load the original image
      const originalImage = sharp(sourcePath)
      const metadata = await originalImage.metadata()
      
      console.log(`   📏 Original: ${metadata.width}x${metadata.height} (${Math.round((metadata.size || 0) / 1024)}KB)`)

      // Process each target size
      for (const size of config.targetSizes) {
        const outputFilename = `${seoName}-${size.suffix}-${size.width}x${size.height}`
        
        // Generate WebP version (primary)
        const webpPath = path.join(backgroundDir, `${outputFilename}.webp`)
        await originalImage
          .clone()
          .resize(size.width, size.height, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ 
            quality: size.suffix === 'thumbnail' ? 85 : 90,
            effort: 6
          })
          .toFile(webpPath)

        // Generate JPEG fallback
        const jpegPath = path.join(backgroundDir, `${outputFilename}.jpeg`)
        await originalImage
          .clone()
          .resize(size.width, size.height, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: size.suffix === 'thumbnail' ? 85 : 90,
            progressive: true
          })
          .toFile(jpegPath)

        // Generate AVIF for modern browsers
        const avifPath = path.join(backgroundDir, `${outputFilename}.avif`)
        await originalImage
          .clone()
          .resize(size.width, size.height, { 
            fit: 'cover',
            position: 'center'
          })
          .avif({ 
            quality: size.suffix === 'thumbnail' ? 85 : 90,
            effort: 6
          })
          .toFile(avifPath)

        // Get file sizes
        const webpStats = await fs.stat(webpPath)
        const jpegStats = await fs.stat(jpegPath)
        const avifStats = await fs.stat(avifPath)

        console.log(`   ✅ ${size.suffix} (${size.width}x${size.height}):`)
        console.log(`      WebP: ${Math.round(webpStats.size / 1024)}KB`)
        console.log(`      JPEG: ${Math.round(jpegStats.size / 1024)}KB`)
        console.log(`      AVIF: ${Math.round(avifStats.size / 1024)}KB`)
      }

      // Create blur placeholder
      const blurPath = path.join(backgroundDir, `${seoName}-blur-placeholder.webp`)
      await originalImage
        .clone()
        .resize(20, 20, { fit: 'cover' })
        .blur(1)
        .webp({ quality: 20 })
        .toFile(blurPath)

      console.log(`   🌫️ Blur placeholder created`)

      // Generate CSS custom properties file
      const cssVars = generateCSSVariables(seoName, config.targetSizes)
      const cssPath = path.join(backgroundDir, `${seoName}-variables.css`)
      await fs.writeFile(cssPath, cssVars)

      console.log(`   🎨 CSS variables generated`)

    } catch (error) {
      console.error(`   ❌ Failed to process ${config.name}:`, error instanceof Error ? error.message : String(error))
    }
  }

  // Generate master CSS file with all backgrounds
  await generateMasterBackgroundCSS(outputDir)
  
  // Generate React component for background usage
  await generateBackgroundComponent(outputDir)

  console.log('\n🎉 Background processing complete!')
  console.log('\n📋 Generated Files:')
  console.log('   📁 /public/media/backgrounds/ - All optimized images')
  console.log('   🎨 backgrounds.css - Master CSS file with all backgrounds')
  console.log('   ⚛️ BackgroundImage.tsx - React component for easy usage')
  
  console.log('\n🚀 Usage Examples:')
  console.log('   CSS: background-image: var(--bg-showroom-hero);')
  console.log('   React: <BackgroundImage name="showroom" size="hero" />')
  console.log('   Next.js: <Image src="/media/backgrounds/showroom/showroom-hero-1920x1080.webp" />')
}

function generateCSSVariables(name: string, sizes: { width: number; height: number; suffix: string }[]): string {
  const vars = sizes.map(size => {
    const varName = `--bg-${name}-${size.suffix}`
    const webpPath = `/media/backgrounds/${name}/${name}-${size.suffix}-${size.width}x${size.height}.webp`
    const jpegPath = `/media/backgrounds/${name}/${name}-${size.suffix}-${size.width}x${size.height}.jpeg`
    
    return `  ${varName}: url('${webpPath}');
  ${varName}-fallback: url('${jpegPath}');`
  }).join('\n')

  return `:root {
${vars}
  --bg-${name}-blur: url('/media/backgrounds/${name}/${name}-blur-placeholder.webp');
}

/* Background utility classes for ${name} */
${sizes.map(size => `.bg-${name}-${size.suffix} {
  background-image: var(--bg-${name}-${size.suffix});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}`).join('\n\n')}

.bg-${name}-blur {
  background-image: var(--bg-${name}-blur);
  background-size: cover;
  background-position: center;
}
`
}

async function generateMasterBackgroundCSS(outputDir: string) {
  const masterCSS = `/* Modern Men Barbershop Backgrounds */
/* Auto-generated CSS variables and utility classes */

:root {
  /* Showroom backgrounds */
  --bg-showroom-hero: url('/media/backgrounds/showroom/showroom-hero-1920x1080.webp');
  --bg-showroom-large: url('/media/backgrounds/showroom/showroom-large-1200x675.webp');
  --bg-showroom-medium: url('/media/backgrounds/showroom/showroom-medium-800x450.webp');
  --bg-showroom-small: url('/media/backgrounds/showroom/showroom-small-400x225.webp');
  --bg-showroom-blur: url('/media/backgrounds/showroom/showroom-blur-placeholder.webp');

  /* Front entrance backgrounds */
  --bg-front-entrance-hero: url('/media/backgrounds/front-entrance/front-entrance-hero-1920x1080.webp');
  --bg-front-entrance-large: url('/media/backgrounds/front-entrance/front-entrance-large-1200x675.webp');
  --bg-front-entrance-medium: url('/media/backgrounds/front-entrance/front-entrance-medium-800x450.webp');
  --bg-front-entrance-small: url('/media/backgrounds/front-entrance/front-entrance-small-400x225.webp');
  --bg-front-entrance-blur: url('/media/backgrounds/front-entrance/front-entrance-blur-placeholder.webp');

  /* Barbers working backgrounds */
  --bg-barbers-working-hero: url('/media/backgrounds/barbers-working/barbers-working-hero-1920x1080.webp');
  --bg-barbers-working-large: url('/media/backgrounds/barbers-working/barbers-working-large-1200x675.webp');
  --bg-barbers-working-medium: url('/media/backgrounds/barbers-working/barbers-working-medium-800x450.webp');
  --bg-barbers-working-small: url('/media/backgrounds/barbers-working/barbers-working-small-400x225.webp');
  --bg-barbers-working-blur: url('/media/backgrounds/barbers-working/barbers-working-blur-placeholder.webp');

  /* Back house backgrounds */
  --bg-back-house-hero: url('/media/backgrounds/back-house/back-house-hero-1920x1080.webp');
  --bg-back-house-large: url('/media/backgrounds/back-house/back-house-large-1200x675.webp');
  --bg-back-house-medium: url('/media/backgrounds/back-house/back-house-medium-800x450.webp');
  --bg-back-house-small: url('/media/backgrounds/back-house/back-house-small-400x225.webp');
  --bg-back-house-blur: url('/media/backgrounds/back-house/back-house-blur-placeholder.webp');

  /* Modern Men logo backgrounds */
  --bg-modern-men-logo-hero: url('/media/backgrounds/modern-men-logo/modern-men-logo-hero-1920x1080.webp');
  --bg-modern-men-logo-large: url('/media/backgrounds/modern-men-logo/modern-men-logo-large-1200x675.webp');
  --bg-modern-men-logo-medium: url('/media/backgrounds/modern-men-logo/modern-men-logo-medium-800x450.webp');
  --bg-modern-men-logo-small: url('/media/backgrounds/modern-men-logo/modern-men-logo-small-400x225.webp');
  --bg-modern-men-logo-thumbnail: url('/media/backgrounds/modern-men-logo/modern-men-logo-thumbnail-200x113.webp');
  --bg-modern-men-logo-blur: url('/media/backgrounds/modern-men-logo/modern-men-logo-blur-placeholder.webp');
}

/* Utility classes for each background */
.bg-showroom-hero { background-image: var(--bg-showroom-hero); background-size: cover; background-position: center; }
.bg-showroom-large { background-image: var(--bg-showroom-large); background-size: cover; background-position: center; }
.bg-showroom-medium { background-image: var(--bg-showroom-medium); background-size: cover; background-position: center; }
.bg-showroom-small { background-image: var(--bg-showroom-small); background-size: cover; background-position: center; }
.bg-showroom-blur { background-image: var(--bg-showroom-blur); background-size: cover; background-position: center; }

.bg-front-entrance-hero { background-image: var(--bg-front-entrance-hero); background-size: cover; background-position: center; }
.bg-front-entrance-large { background-image: var(--bg-front-entrance-large); background-size: cover; background-position: center; }
.bg-front-entrance-medium { background-image: var(--bg-front-entrance-medium); background-size: cover; background-position: center; }
.bg-front-entrance-small { background-image: var(--bg-front-entrance-small); background-size: cover; background-position: center; }
.bg-front-entrance-blur { background-image: var(--bg-front-entrance-blur); background-size: cover; background-position: center; }

.bg-barbers-working-hero { background-image: var(--bg-barbers-working-hero); background-size: cover; background-position: center; }
.bg-barbers-working-large { background-image: var(--bg-barbers-working-large); background-size: cover; background-position: center; }
.bg-barbers-working-medium { background-image: var(--bg-barbers-working-medium); background-size: cover; background-position: center; }
.bg-barbers-working-small { background-image: var(--bg-barbers-working-small); background-size: cover; background-position: center; }
.bg-barbers-working-blur { background-image: var(--bg-barbers-working-blur); background-size: cover; background-position: center; }

.bg-back-house-hero { background-image: var(--bg-back-house-hero); background-size: cover; background-position: center; }
.bg-back-house-large { background-image: var(--bg-back-house-large); background-size: cover; background-position: center; }
.bg-back-house-medium { background-image: var(--bg-back-house-medium); background-size: cover; background-position: center; }
.bg-back-house-small { background-image: var(--bg-back-house-small); background-size: cover; background-position: center; }
.bg-back-house-blur { background-image: var(--bg-back-house-blur); background-size: cover; background-position: center; }

.bg-modern-men-logo-hero { background-image: var(--bg-modern-men-logo-hero); background-size: cover; background-position: center; }
.bg-modern-men-logo-large { background-image: var(--bg-modern-men-logo-large); background-size: cover; background-position: center; }
.bg-modern-men-logo-medium { background-image: var(--bg-modern-men-logo-medium); background-size: cover; background-position: center; }
.bg-modern-men-logo-small { background-image: var(--bg-modern-men-logo-small); background-size: cover; background-position: center; }
.bg-modern-men-logo-thumbnail { background-image: var(--bg-modern-men-logo-thumbnail); background-size: cover; background-position: center; }
.bg-modern-men-logo-blur { background-image: var(--bg-modern-men-logo-blur); background-size: cover; background-position: center; }

/* Responsive background utilities */
@media (max-width: 640px) {
  .bg-responsive-showroom { background-image: var(--bg-showroom-small); }
  .bg-responsive-front-entrance { background-image: var(--bg-front-entrance-small); }
  .bg-responsive-barbers-working { background-image: var(--bg-barbers-working-small); }
  .bg-responsive-back-house { background-image: var(--bg-back-house-small); }
  .bg-responsive-modern-men-logo { background-image: var(--bg-modern-men-logo-small); }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .bg-responsive-showroom { background-image: var(--bg-showroom-medium); }
  .bg-responsive-front-entrance { background-image: var(--bg-front-entrance-medium); }
  .bg-responsive-barbers-working { background-image: var(--bg-barbers-working-medium); }
  .bg-responsive-back-house { background-image: var(--bg-back-house-medium); }
  .bg-responsive-modern-men-logo { background-image: var(--bg-modern-men-logo-medium); }
}

@media (min-width: 1025px) {
  .bg-responsive-showroom { background-image: var(--bg-showroom-hero); }
  .bg-responsive-front-entrance { background-image: var(--bg-front-entrance-hero); }
  .bg-responsive-barbers-working { background-image: var(--bg-barbers-working-hero); }
  .bg-responsive-back-house { background-image: var(--bg-back-house-hero); }
  .bg-responsive-modern-men-logo { background-image: var(--bg-modern-men-logo-hero); }
}
`

  const cssPath = path.join(outputDir, 'backgrounds.css')
  await fs.writeFile(cssPath, masterCSS)
  console.log(`\n🎨 Master CSS file generated: ${cssPath}`)
}

async function generateBackgroundComponent(outputDir: string) {
  const componentCode = `'use client'

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
    console.warn(\`Invalid background configuration: \${name} - \${size}\`)
    return null
  }

  const defaultAlt = \`Modern Men Barbershop - \${name.replace('-', ' ')} background\`

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
    backgroundImage: \`url('\${imagePath}')\`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
}

export default BackgroundImage
`

  const componentPath = path.join(outputDir, 'BackgroundImage.tsx')
  await fs.writeFile(componentPath, componentCode)
  console.log(`⚛️ React component generated: ${componentPath}`)
}

// Run the script
if (require.main === module) {
  upscaleAndOptimizeBackgrounds()
    .then(() => {
      console.log('\n✅ Background optimization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Background optimization failed:', error)
      process.exit(1)
    })
}

export { upscaleAndOptimizeBackgrounds, BACKGROUND_CONFIGS }
