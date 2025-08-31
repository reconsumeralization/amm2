#!/usr/bin/env tsx
// High-quality image processing and optimization for barber photos
// Generates multiple sizes and formats for responsive design

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

interface ImageConfig {
  filename: string
  barberName: string
  outputSizes: {
    thumbnail: { width: 150, height: 150 }
    small: { width: 300, height: 300 }
    medium: { width: 600, height: 600 }
    large: { width: 1200, height: 1200 }
    xl: { width: 1800, height: 1800 }
    profile: { width: 400, height: 500 }
    hero: { width: 1920, height: 1080 }
  }
  formats: ['webp', 'avif', 'jpeg', 'png']
}

const BARBER_IMAGES: ImageConfig[] = [
  {
    filename: 'malebarber.png',
    barberName: 'Marcus Rodriguez',
    outputSizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      xl: { width: 1800, height: 1800 },
      profile: { width: 400, height: 500 },
      hero: { width: 1920, height: 1080 }
    },
    formats: ['webp', 'avif', 'jpeg', 'png']
  },
  {
    filename: 'femalebarber.png',
    barberName: 'Sarah Mitchell',
    outputSizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      xl: { width: 1800, height: 1800 },
      profile: { width: 400, height: 500 },
      hero: { width: 1920, height: 1080 }
    },
    formats: ['webp', 'avif', 'jpeg', 'png']
  },
  {
    filename: 'femalebarber2.png',
    barberName: 'Emma Thompson',
    outputSizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      xl: { width: 1800, height: 1800 },
      profile: { width: 400, height: 500 },
      hero: { width: 1920, height: 1080 }
    },
    formats: ['webp', 'avif', 'jpeg', 'png']
  },
  {
    filename: 'femalebarber3.png',
    barberName: 'Zoe Chen',
    outputSizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      xl: { width: 1800, height: 1800 },
      profile: { width: 400, height: 500 },
      hero: { width: 1920, height: 1080 }
    },
    formats: ['webp', 'avif', 'jpeg', 'png']
  }
]

async function createDirectoryIfNotExists(dirPath: string) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function optimizeBarberImage(config: ImageConfig) {
  const inputPath = path.join(process.cwd(), 'public', 'media', config.filename)
  const outputDir = path.join(process.cwd(), 'public', 'media', 'barbers', config.barberName.toLowerCase().replace(/\s+/g, '-'))
  
  console.log(`\n📸 Processing ${config.barberName}...`)
  
  // Create output directory
  await createDirectoryIfNotExists(outputDir)
  
  // Load original image and get metadata
  const originalImage = sharp(inputPath)
  const metadata = await originalImage.metadata()
  
  console.log(`   📏 Original: ${metadata.width}x${metadata.height} (${metadata.format})`)
  
  // Process each size and format
  for (const [sizeName, dimensions] of Object.entries(config.outputSizes)) {
    for (const format of config.formats) {
      const outputFilename = `${sizeName}.${format}`
      const outputPath = path.join(outputDir, outputFilename)
      
      try {
        let pipeline = originalImage
          .clone()
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          })
        
        // Apply format-specific optimizations
        switch (format) {
          case 'webp':
            pipeline = pipeline.webp({ 
              quality: 90,
              effort: 6,
              smartSubsample: true
            })
            break
          case 'avif':
            pipeline = pipeline.avif({ 
              quality: 85,
              effort: 9
            })
            break
          case 'jpeg':
            pipeline = pipeline.jpeg({ 
              quality: 92,
              progressive: true,
              mozjpeg: true
            })
            break
          case 'png':
            pipeline = pipeline.png({ 
              quality: 95,
              compressionLevel: 6,
              adaptiveFiltering: true
            })
            break
        }
        
        await pipeline.toFile(outputPath)
        
        // Get file size
        const stats = await fs.stat(outputPath)
        const fileSizeKB = Math.round(stats.size / 1024)
        
        console.log(`   ✅ ${sizeName}.${format} (${dimensions.width}x${dimensions.height}) - ${fileSizeKB}KB`)
        
      } catch (error) {
        console.error(`   ❌ Failed to create ${outputFilename}:`, error.message)
      }
    }
  }
  
  // Create blur placeholder
  try {
    const blurPath = path.join(outputDir, 'blur.webp')
    await originalImage
      .clone()
      .resize(20, 20, { fit: 'cover' })
      .blur(2)
      .webp({ quality: 20 })
      .toFile(blurPath)
    console.log(`   ✅ blur.webp (20x20) - Placeholder`)
  } catch (error) {
    console.error(`   ❌ Failed to create blur placeholder:`, error.message)
  }
}

async function generateResponsiveImageManifest() {
  const manifest = {
    barbers: {},
    metadata: {
      generatedAt: new Date().toISOString(),
      totalImages: BARBER_IMAGES.length,
      formats: ['webp', 'avif', 'jpeg', 'png'],
      sizes: ['thumbnail', 'small', 'medium', 'large', 'xl', 'profile', 'hero']
    }
  }
  
  for (const config of BARBER_IMAGES) {
    const barberKey = config.barberName.toLowerCase().replace(/\s+/g, '-')
    manifest.barbers[barberKey] = {
      name: config.barberName,
      originalFile: config.filename,
      basePath: `/media/barbers/${barberKey}`,
      sizes: config.outputSizes,
      formats: config.formats,
      srcSet: {
        webp: Object.entries(config.outputSizes).map(([size, dims]) => 
          `/media/barbers/${barberKey}/${size}.webp ${dims.width}w`
        ).join(', '),
        avif: Object.entries(config.outputSizes).map(([size, dims]) => 
          `/media/barbers/${barberKey}/${size}.avif ${dims.width}w`
        ).join(', '),
        jpeg: Object.entries(config.outputSizes).map(([size, dims]) => 
          `/media/barbers/${barberKey}/${size}.jpeg ${dims.width}w`
        ).join(', ')
      },
      blurDataURL: `/media/barbers/${barberKey}/blur.webp`
    }
  }
  
  const manifestPath = path.join(process.cwd(), 'public', 'media', 'barbers', 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  
  console.log('\n📄 Generated image manifest: public/media/barbers/manifest.json')
  return manifest
}

async function optimizeAllBarberImages() {
  console.log('🎨 HIGH-QUALITY BARBER IMAGE OPTIMIZATION')
  console.log('=========================================\n')
  
  try {
    // Create main barbers directory
    const barbersDir = path.join(process.cwd(), 'public', 'media', 'barbers')
    await createDirectoryIfNotExists(barbersDir)
    
    // Process each barber image
    for (const config of BARBER_IMAGES) {
      await optimizeBarberImage(config)
    }
    
    // Generate manifest file
    const manifest = await generateResponsiveImageManifest()
    
    console.log('\n🎉 IMAGE OPTIMIZATION COMPLETE!')
    console.log('\n📊 OPTIMIZATION SUMMARY:')
    console.log(`   👥 Barbers processed: ${BARBER_IMAGES.length}`)
    console.log(`   📐 Sizes per image: ${Object.keys(BARBER_IMAGES[0].outputSizes).length}`)
    console.log(`   🎨 Formats per size: ${BARBER_IMAGES[0].formats.length}`)
    console.log(`   📁 Total files generated: ${BARBER_IMAGES.length * Object.keys(BARBER_IMAGES[0].outputSizes).length * BARBER_IMAGES[0].formats.length + BARBER_IMAGES.length}`)
    
    console.log('\n📱 RESPONSIVE BREAKPOINTS:')
    console.log('   📱 Mobile: thumbnail (150px), small (300px)')
    console.log('   💻 Tablet: medium (600px), profile (400x500px)')
    console.log('   🖥️ Desktop: large (1200px), xl (1800px)')
    console.log('   🎬 Hero: hero (1920x1080px)')
    
    console.log('\n🚀 PERFORMANCE FEATURES:')
    console.log('   ✅ Modern formats (WebP, AVIF) for 50-80% smaller files')
    console.log('   ✅ Progressive JPEG for faster loading')
    console.log('   ✅ Blur placeholders for smooth loading')
    console.log('   ✅ Multiple sizes for responsive design')
    console.log('   ✅ Optimized compression settings')
    
    console.log('\n📂 FILE STRUCTURE:')
    console.log('   public/media/barbers/')
    BARBER_IMAGES.forEach(config => {
      const barberKey = config.barberName.toLowerCase().replace(/\s+/g, '-')
      console.log(`   ├── ${barberKey}/`)
      console.log(`   │   ├── thumbnail.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── small.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── medium.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── large.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── xl.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── profile.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── hero.{webp,avif,jpeg,png}`)
      console.log(`   │   └── blur.webp`)
    })
    
    return manifest
    
  } catch (error) {
    console.error('❌ Image optimization failed:', error)
    throw error
  }
}

// Export for use in other scripts
export { optimizeAllBarberImages, BARBER_IMAGES }

// Run if called directly
if (require.main === module) {
  optimizeAllBarberImages()
    .then(() => {
      console.log('\n✅ All barber images optimized successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Optimization failed:', error)
      process.exit(1)
    })
}
