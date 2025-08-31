#!/usr/bin/env tsx
// Optimize existing product images and create comprehensive product catalog

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

interface Product {
  id: string
  name: string
  description: string
  category: string
  brand: string
  price: number
  originalImage: string
  tags: string[]
  specifications?: { [key: string]: string }
}

const MODERN_MEN_PRODUCTS: Product[] = [
  {
    id: 'premium-styling-pomade',
    name: 'Premium Styling Pomade',
    description: 'Professional-grade pomade for strong hold and high shine finish. Perfect for classic and modern styles.',
    category: 'Hair Styling',
    brand: 'Modern Men',
    price: 24.99,
    originalImage: 'image.png',
    tags: ['pomade', 'strong-hold', 'high-shine', 'professional', 'styling'],
    specifications: {
      'Hold Level': 'Strong',
      'Shine Level': 'High',
      'Volume': '100ml',
      'Ingredients': 'Natural wax, essential oils',
      'Suitable For': 'All hair types'
    }
  },
  {
    id: 'matte-finish-clay',
    name: 'Matte Finish Clay',
    description: 'Lightweight clay for natural-looking texture and medium hold with a matte finish.',
    category: 'Hair Styling',
    brand: 'Modern Men',
    price: 22.99,
    originalImage: 'image copy.png',
    tags: ['clay', 'matte', 'natural', 'texture', 'medium-hold'],
    specifications: {
      'Hold Level': 'Medium',
      'Shine Level': 'Matte',
      'Volume': '85ml',
      'Ingredients': 'Kaolin clay, natural fibers',
      'Suitable For': 'Fine to medium hair'
    }
  }
]

async function createDirectoryIfNotExists(dirPath: string) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function optimizeProductImage(product: Product, inputDir: string, outputDir: string) {
  const inputPath = path.join(inputDir, product.originalImage)
  const productDir = path.join(outputDir, product.id)
  
  console.log(`\n🛍️ Optimizing: ${product.name}`)
  
  try {
    // Check if input file exists
    await fs.access(inputPath)
  } catch {
    console.log(`   ⚠️ Source image not found: ${product.originalImage}`)
    return
  }
  
  await createDirectoryIfNotExists(productDir)
  
  const originalImage = sharp(inputPath)
  const metadata = await originalImage.metadata()
  
  console.log(`   📏 Original: ${metadata.width}x${metadata.height} (${metadata.format})`)
  
  // E-commerce optimized sizes
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    gallery: { width: 800, height: 800 },
    zoom: { width: 1600, height: 1600 },
    hero: { width: 1920, height: 1080 },
    square: { width: 500, height: 500 },
    card: { width: 400, height: 400 }
  }
  
  const formats = ['webp', 'avif', 'jpeg', 'png']
  
  // Process each size and format
  for (const [sizeName, dimensions] of Object.entries(sizes)) {
    for (const format of formats) {
      const outputFilename = `${sizeName}.${format}`
      const outputPath = path.join(productDir, outputFilename)
      
      try {
        let pipeline = originalImage
          .clone()
          .resize(dimensions.width, dimensions.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .sharpen(1.5, 0.5, 2) // Enhanced sharpening for product details
        
        // Apply format-specific optimizations
        switch (format) {
          case 'webp':
            pipeline = pipeline.webp({ 
              quality: 95,
              effort: 6,
              smartSubsample: true
            })
            break
          case 'avif':
            pipeline = pipeline.avif({ 
              quality: 90,
              effort: 9
            })
            break
          case 'jpeg':
            pipeline = pipeline.jpeg({ 
              quality: 95,
              progressive: true,
              mozjpeg: true
            })
            break
          case 'png':
            pipeline = pipeline.png({ 
              quality: 100,
              compressionLevel: 6,
              adaptiveFiltering: true
            })
            break
        }
        
        await pipeline.toFile(outputPath)
        
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
    const blurPath = path.join(productDir, 'blur.webp')
    await originalImage
      .clone()
      .resize(20, 20, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .blur(1)
      .webp({ quality: 20 })
      .toFile(blurPath)
    console.log(`   ✅ blur.webp (20x20) - Placeholder`)
  } catch (error) {
    console.error(`   ❌ Failed to create blur placeholder:`, error.message)
  }
}

async function generateProductManifest(outputDir: string) {
  const manifest = {
    products: {},
    categories: [...new Set(MODERN_MEN_PRODUCTS.map(p => p.category))],
    brands: [...new Set(MODERN_MEN_PRODUCTS.map(p => p.brand))],
    metadata: {
      generatedAt: new Date().toISOString(),
      totalProducts: MODERN_MEN_PRODUCTS.length,
      formats: ['webp', 'avif', 'jpeg', 'png'],
      sizes: ['thumbnail', 'small', 'medium', 'large', 'gallery', 'zoom', 'hero', 'square', 'card']
    }
  }
  
  for (const product of MODERN_MEN_PRODUCTS) {
    manifest.products[product.id] = {
      ...product,
      basePath: `/media/products/${product.id}`,
      srcSet: {
        webp: 'thumbnail.webp 150w, small.webp 300w, medium.webp 600w, large.webp 1200w, gallery.webp 800w, zoom.webp 1600w',
        avif: 'thumbnail.avif 150w, small.avif 300w, medium.avif 600w, large.avif 1200w, gallery.avif 800w, zoom.avif 1600w',
        jpeg: 'thumbnail.jpeg 150w, small.jpeg 300w, medium.jpeg 600w, large.jpeg 1200w, gallery.jpeg 800w, zoom.jpeg 1600w'
      },
      blurDataURL: `/media/products/${product.id}/blur.webp`
    }
  }
  
  const manifestPath = path.join(outputDir, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  
  console.log('\n📄 Generated product manifest: public/media/products/manifest.json')
  return manifest
}

async function optimizeExistingProducts() {
  console.log('🛍️ MODERN MEN PRODUCT IMAGE OPTIMIZATION')
  console.log('==========================================\n')
  
  try {
    const inputDir = path.join(process.cwd(), 'public', 'media', 'products')
    const outputDir = path.join(process.cwd(), 'public', 'media', 'products')
    
    await createDirectoryIfNotExists(outputDir)
    
    console.log('📸 Processing existing product images...')
    
    for (const product of MODERN_MEN_PRODUCTS) {
      await optimizeProductImage(product, inputDir, outputDir)
    }
    
    // Generate comprehensive manifest
    const manifest = await generateProductManifest(outputDir)
    
    console.log('\n🎉 PRODUCT OPTIMIZATION COMPLETE!')
    console.log('\n📊 OPTIMIZATION SUMMARY:')
    console.log(`   🛍️ Products processed: ${MODERN_MEN_PRODUCTS.length}`)
    console.log(`   📂 Categories: ${manifest.categories.join(', ')}`)
    console.log(`   🏷️ Brands: ${manifest.brands.join(', ')}`)
    console.log(`   📐 Sizes per product: 9`)
    console.log(`   🎨 Formats per size: 4`)
    console.log(`   📁 Total files per product: 37 (36 images + 1 blur)`)
    
    console.log('\n💡 PRODUCT CATEGORIES:')
    manifest.categories.forEach(category => {
      const productsInCategory = MODERN_MEN_PRODUCTS.filter(p => p.category === category)
      console.log(`   ${category}: ${productsInCategory.length} products`)
      productsInCategory.forEach(p => {
        console.log(`      - ${p.name} ($${p.price})`)
      })
    })
    
    console.log('\n📱 E-COMMERCE RESPONSIVE SIZES:')
    console.log('   📱 Mobile: thumbnail (150px), small (300px)')
    console.log('   💻 Desktop: medium (600px), large (1200px)')
    console.log('   🛒 Product Cards: card (400px), square (500px)')
    console.log('   🖼️ Gallery: gallery (800px) for product viewing')
    console.log('   🔍 Zoom: zoom (1600px) for detailed inspection')
    console.log('   🎬 Hero: hero (1920x1080px) for banners')
    
    console.log('\n🚀 PERFORMANCE OPTIMIZATIONS:')
    console.log('   ✅ Modern formats (WebP, AVIF) for 50-80% smaller files')
    console.log('   ✅ Enhanced sharpening for product detail clarity')
    console.log('   ✅ Progressive JPEG for faster loading')
    console.log('   ✅ Blur placeholders for smooth loading experience')
    console.log('   ✅ Multiple sizes for responsive e-commerce design')
    console.log('   ✅ White background for consistent product presentation')
    
    console.log('\n📂 PRODUCT IMAGE STRUCTURE:')
    console.log('   public/media/products/')
    MODERN_MEN_PRODUCTS.forEach(product => {
      console.log(`   ├── ${product.id}/`)
      console.log(`   │   ├── thumbnail.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── card.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── gallery.{webp,avif,jpeg,png}`)
      console.log(`   │   ├── zoom.{webp,avif,jpeg,png}`)
      console.log(`   │   └── blur.webp`)
    })
    
    return manifest
    
  } catch (error) {
    console.error('❌ Product optimization failed:', error)
    throw error
  }
}

// Export for use in other scripts
export { optimizeExistingProducts, MODERN_MEN_PRODUCTS }

// Run if called directly
if (require.main === module) {
  optimizeExistingProducts()
    .then(() => {
      console.log('\n✅ Product image optimization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Optimization failed:', error)
      process.exit(1)
    })
}
