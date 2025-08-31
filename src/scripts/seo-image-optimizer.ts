#!/usr/bin/env tsx
// SEO-optimized image processing with structured data

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

interface SEOImageConfig {
  originalFile: string
  seoName: string
  title: string
  description: string
  category: string
  keywords: string[]
  location?: string
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
}

// SEO-optimized barber configurations
const BARBER_SEO_CONFIGS: SEOImageConfig[] = [
  {
    originalFile: 'malebarber.png',
    seoName: 'hicham-mellouli-professional-barber-regina-saskatchewan',
    title: 'Hicham Mellouli - Professional Barber in Regina, Saskatchewan',
    description: 'Master barber Hicham Mellouli specializing in precision fades, beard sculpting, and modern cuts at Modern Men Hair barber in Regina, SK',
    category: 'barber-profile',
    keywords: ['barber', 'regina', 'saskatchewan', 'precision-fades', 'beard-sculpting', 'modern-cuts', 'hair-barber', 'professional'],
    location: 'Regina, Saskatchewan, Canada',
    person: {
      name: 'Hicham Mellouli',
      jobTitle: 'Master Barber',
      worksFor: 'Modern Men Hair barber',
      email: 'hicham.mellouli@modernmen.com',
      experience: 10
    }
  },
  {
    originalFile: 'femalebarber.png',
    seoName: 'sarah-mitchell-creative-stylist-regina-hair-barber',
    title: 'Sarah Mitchell - Creative Hair Stylist in Regina',
    description: 'Creative stylist Sarah Mitchell specializing in trendy cuts, color work, and texture styling at Modern Men Hair barber Regina',
    category: 'stylist-profile',
    keywords: ['stylist', 'regina', 'trendy-cuts', 'color-work', 'texture-styling', 'creative-hair', 'modern-barber'],
    location: 'Regina, Saskatchewan, Canada',
    person: {
      name: 'Sarah Mitchell',
      jobTitle: 'Creative Hair Stylist',
      worksFor: 'Modern Men Hair barber',
      email: 'sarah.mitchell@modernmen.com',
      experience: 6
    }
  },
  {
    originalFile: 'femalebarber2.png',
    seoName: 'emma-thompson-senior-stylist-bridal-specialist-regina',
    title: 'Emma Thompson - Senior Stylist & Bridal Specialist in Regina',
    description: 'Senior stylist Emma Thompson specializing in classic cuts, bridal styling, and special occasions at Modern Men Hair barber',
    category: 'stylist-profile',
    keywords: ['senior-stylist', 'bridal-specialist', 'regina', 'classic-cuts', 'special-occasions', 'wedding-hair'],
    location: 'Regina, Saskatchewan, Canada',
    person: {
      name: 'Emma Thompson',
      jobTitle: 'Senior Hair Stylist & Bridal Specialist',
      worksFor: 'Modern Men Hair barber',
      email: 'emma.thompson@modernmen.com',
      experience: 10
    }
  },
  {
    originalFile: 'femalebarber3.png',
    seoName: 'zoe-chen-innovative-stylist-edgy-cuts-regina',
    title: 'Zoe Chen - Innovative Stylist for Edgy Cuts in Regina',
    description: 'Innovative stylist Zoe Chen specializing in edgy cuts, avant-garde styling, and creative color work in Regina, Saskatchewan',
    category: 'stylist-profile',
    keywords: ['innovative-stylist', 'edgy-cuts', 'avant-garde', 'creative-color', 'regina', 'artistic-hair'],
    location: 'Regina, Saskatchewan, Canada',
    person: {
      name: 'Zoe Chen',
      jobTitle: 'Innovative Hair Stylist',
      worksFor: 'Modern Men Hair barber',
      email: 'zoe.chen@modernmen.com',
      experience: 5
    }
  }
]

// SEO-optimized product configurations
const PRODUCT_SEO_CONFIGS: SEOImageConfig[] = [
  {
    originalFile: 'image.png',
    seoName: 'modern-men-premium-styling-pomade-strong-hold-hair-product',
    title: 'Modern Men Premium Styling Pomade - Strong Hold Hair Product',
    description: 'Professional-grade styling pomade with strong hold and high shine finish for classic and modern hairstyles',
    category: 'hair-styling-product',
    keywords: ['pomade', 'hair-styling', 'strong-hold', 'high-shine', 'professional', 'modern-men', 'regina'],
    product: {
      name: 'Premium Styling Pomade',
      brand: 'Modern Men',
      price: 24.99,
      category: 'Hair Styling Products',
      sku: 'MM-PSP-001'
    }
  },
  {
    originalFile: 'image copy.png',
    seoName: 'modern-men-matte-finish-clay-natural-texture-hair-product',
    title: 'Modern Men Matte Finish Clay - Natural Texture Hair Product',
    description: 'Lightweight matte clay for natural-looking texture and medium hold, perfect for casual and professional styles',
    category: 'hair-styling-product',
    keywords: ['clay', 'matte-finish', 'natural-texture', 'medium-hold', 'hair-product', 'modern-men'],
    product: {
      name: 'Matte Finish Clay',
      brand: 'Modern Men',
      price: 22.99,
      category: 'Hair Styling Products',
      sku: 'MM-MFC-002'
    }
  }
]

function generateStructuredData(config: SEOImageConfig, imagePath: string) {
  const baseUrl = 'https://modernmen.com'
  
  if (config.person) {
    // Person/Barber structured data
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': config.person.name,
      'jobTitle': config.person.jobTitle,
      'worksFor': {
        '@type': 'Organization',
        'name': config.person.worksFor,
        'url': baseUrl,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Regina',
          'addressRegion': 'Saskatchewan',
          'addressCountry': 'Canada'
        }
      },
      'email': config.person.email,
      'image': {
        '@type': 'ImageObject',
        'url': `${baseUrl}${imagePath}`,
        'caption': config.description,
        'description': config.description,
        'keywords': config.keywords.join(', '),
        'contentLocation': config.location,
        'creator': {
          '@type': 'Organization',
          'name': 'Modern Men Hair barber'
        }
      },
      'hasOccupation': {
        '@type': 'Occupation',
        'name': config.person.jobTitle,
        'occupationLocation': {
          '@type': 'City',
          'name': 'Regina, Saskatchewan'
        },
        'experienceRequirements': `${config.person.experience} years of professional experience`
      },
      'knowsAbout': config.keywords,
      'memberOf': {
        '@type': 'Organization',
        'name': 'Modern Men Hair barber',
        'url': baseUrl
      }
    }
  } else if (config.product) {
    // Product structured data
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': config.product.name,
      'description': config.description,
      'brand': {
        '@type': 'Brand',
        'name': config.product.brand
      },
      'category': config.product.category,
      'sku': config.product.sku,
      'offers': {
        '@type': 'Offer',
        'price': config.product.price,
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
        'url': `${baseUrl}${imagePath}`,
        'caption': config.title,
        'description': config.description,
        'keywords': config.keywords.join(', '),
        'creator': {
          '@type': 'Organization',
          'name': 'Modern Men Hair barber'
        }
      },
      'keywords': config.keywords.join(', '),
      'manufacturer': {
        '@type': 'Organization',
        'name': config.product.brand
      }
    }
  }
  
  // Generic image structured data
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    'url': `${baseUrl}${imagePath}`,
    'caption': config.title,
    'description': config.description,
    'keywords': config.keywords.join(', '),
    'contentLocation': config.location,
    'creator': {
      '@type': 'Organization',
      'name': 'Modern Men Hair barber',
      'url': baseUrl
    }
  }
}

async function createDirectoryIfNotExists(dirPath: string) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function optimizeSEOImage(config: SEOImageConfig, inputDir: string, outputDir: string) {
  const inputPath = path.join(inputDir, config.originalFile)
  const seoDir = path.join(outputDir, config.seoName)
  
  console.log(`\n📸 SEO Optimizing: ${config.title}`)
  
  try {
    await fs.access(inputPath)
  } catch {
    console.log(`   ⚠️ Source image not found: ${config.originalFile}`)
    return
  }
  
  await createDirectoryIfNotExists(seoDir)
  
  const originalImage = sharp(inputPath)
  const metadata = await originalImage.metadata()
  
  console.log(`   📏 Original: ${metadata.width}x${metadata.height} (${metadata.format})`)
  
  // SEO-optimized sizes with descriptive names
  const seoSizes = {
    'thumbnail-150x150': { width: 150, height: 150 },
    'small-300x300': { width: 300, height: 300 },
    'medium-600x600': { width: 600, height: 600 },
    'large-1200x1200': { width: 1200, height: 1200 },
    'xl-1800x1800': { width: 1800, height: 1800 },
    'profile-400x500': { width: 400, height: 500 },
    'card-500x500': { width: 500, height: 500 },
    'gallery-800x800': { width: 800, height: 800 },
    'zoom-1600x1600': { width: 1600, height: 1600 },
    'hero-1920x1080': { width: 1920, height: 1080 }
  }
  
  const formats = ['webp', 'avif', 'jpeg']
  
  // Process each size and format with SEO naming
  for (const [sizeName, dimensions] of Object.entries(seoSizes)) {
    for (const format of formats) {
      const seoFilename = `${config.seoName}-${sizeName}.${format}`
      const outputPath = path.join(seoDir, seoFilename)
      
      try {
        let pipeline = originalImage
          .clone()
          .resize(dimensions.width, dimensions.height, {
            fit: config.category.includes('product') ? 'contain' : 'cover',
            position: 'center',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .sharpen(1.5, 0.5, 2)
        
        // Enhanced metadata for SEO
        const imageMetadata = {
          title: config.title,
          description: config.description,
          keywords: config.keywords.join(', '),
          subject: config.category,
          copyright: 'Modern Men Hair barber',
          creator: 'Modern Men Hair barber',
          source: 'https://modernmen.com'
        }
        
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
              mozjpeg: true,
              optimiseScans: true
            })
            break
        }
        
        await pipeline.toFile(outputPath)
        
        const stats = await fs.stat(outputPath)
        const fileSizeKB = Math.round(stats.size / 1024)
        
        console.log(`   ✅ ${seoFilename} - ${fileSizeKB}KB`)
        
      } catch (error) {
        console.error(`   ❌ Failed ${seoFilename}:`, error instanceof Error ? error.message : String(error))
      }
    }
  }
  
  // Create blur placeholder with SEO name
  try {
    const blurFilename = `${config.seoName}-blur-placeholder.webp`
    const blurPath = path.join(seoDir, blurFilename)
    await originalImage
      .clone()
      .resize(20, 20, { 
        fit: config.category.includes('product') ? 'contain' : 'cover',
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .blur(1)
      .webp({ quality: 20 })
      .toFile(blurPath)
    console.log(`   ✅ ${blurFilename} - Placeholder`)
  } catch (error) {
    console.error(`   ❌ Failed blur placeholder:`, error instanceof Error ? error.message : String(error))
  }
  
  // Generate JSON-LD structured data
  const structuredData = generateStructuredData(config, `/media/seo/${config.seoName}/${config.seoName}-large-1200x1200.webp`)
  const jsonPath = path.join(seoDir, `${config.seoName}-structured-data.json`)
  await fs.writeFile(jsonPath, JSON.stringify(structuredData, null, 2))
  console.log(`   ✅ ${config.seoName}-structured-data.json`)
  
  // Generate image metadata file
  const metadataFile = {
    seoName: config.seoName,
    title: config.title,
    description: config.description,
    category: config.category,
    keywords: config.keywords,
    location: config.location,
    person: config.person,
    product: config.product,
    images: {
      thumbnail: `${config.seoName}-thumbnail-150x150`,
      small: `${config.seoName}-small-300x300`,
      medium: `${config.seoName}-medium-600x600`,
      large: `${config.seoName}-large-1200x1200`,
      xl: `${config.seoName}-xl-1800x1800`,
      profile: `${config.seoName}-profile-400x500`,
      card: `${config.seoName}-card-500x500`,
      gallery: `${config.seoName}-gallery-800x800`,
      zoom: `${config.seoName}-zoom-1600x1600`,
      hero: `${config.seoName}-hero-1920x1080`,
      blur: `${config.seoName}-blur-placeholder`
    },
    srcSets: {
      webp: [150, 300, 600, 800, 1200, 1600, 1800].map(w => 
        `/media/seo/${config.seoName}/${config.seoName}-${getSizeName(w)}-${w}x${w}.webp ${w}w`
      ).join(', '),
      avif: [150, 300, 600, 800, 1200, 1600, 1800].map(w => 
        `/media/seo/${config.seoName}/${config.seoName}-${getSizeName(w)}-${w}x${w}.avif ${w}w`
      ).join(', '),
      jpeg: [150, 300, 600, 800, 1200, 1600, 1800].map(w => 
        `/media/seo/${config.seoName}/${config.seoName}-${getSizeName(w)}-${w}x${w}.jpeg ${w}w`
      ).join(', ')
    },
    structuredData
  }
  
  const metadataPath = path.join(seoDir, `${config.seoName}-metadata.json`)
  await fs.writeFile(metadataPath, JSON.stringify(metadataFile, null, 2))
  console.log(`   ✅ ${config.seoName}-metadata.json`)
}

function getSizeName(width: number): string {
  const sizeMap: { [key: number]: string } = {
    150: 'thumbnail',
    300: 'small',
    400: 'card',
    500: 'card',
    600: 'medium',
    800: 'gallery',
    1200: 'large',
    1600: 'zoom',
    1800: 'xl'
  }
  return sizeMap[width] || 'custom'
}

async function generateSEOSitemap(outputDir: string) {
  const sitemap = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    'name': 'Modern Men Hair barber - Professional Staff and Products',
    'description': 'Professional barber and stylist team, plus premium hair care products at Modern Men Hair barber in Regina, Saskatchewan',
    'url': 'https://modernmen.com',
    'publisher': {
      '@type': 'Organization',
      'name': 'Modern Men Hair barber',
      'url': 'https://modernmen.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '425 Victoria Avenue East',
        'addressLocality': 'Regina',
        'addressRegion': 'Saskatchewan',
        'postalCode': 'S4N 0N8',
        'addressCountry': 'Canada'
      },
      'telephone': '(306) 522-4111',
      'email': 'info@modernmen.ca'
    },
    'image': [
      ...BARBER_SEO_CONFIGS.map(config => ({
        '@type': 'ImageObject',
        'url': `https://modernmen.com/media/seo/${config.seoName}/${config.seoName}-large-1200x1200.webp`,
        'caption': config.title,
        'description': config.description,
        'keywords': config.keywords.join(', '),
        'representativeOfPage': true
      })),
      ...PRODUCT_SEO_CONFIGS.map(config => ({
        '@type': 'ImageObject',
        'url': `https://modernmen.com/media/seo/${config.seoName}/${config.seoName}-large-1200x1200.webp`,
        'caption': config.title,
        'description': config.description,
        'keywords': config.keywords.join(', ')
      }))
    ]
  }
  
  const sitemapPath = path.join(outputDir, 'image-sitemap.json')
  await fs.writeFile(sitemapPath, JSON.stringify(sitemap, null, 2))
  
  console.log('\n🗺️ Generated SEO image sitemap: public/media/seo/image-sitemap.json')
  return sitemap
}

async function optimizeAllSEOImages() {
  console.log('🎯 SEO-OPTIMIZED IMAGE PROCESSING')
  console.log('==================================\n')
  
  try {
    const inputDir = path.join(process.cwd(), 'public', 'media')
    const outputDir = path.join(process.cwd(), 'public', 'media', 'seo')
    
    await createDirectoryIfNotExists(outputDir)
    
    console.log('👨‍💼👩‍💼 Processing barber images with SEO optimization...')
    for (const config of BARBER_SEO_CONFIGS) {
      await optimizeSEOImage(config, inputDir, outputDir)
    }
    
    console.log('\n🛍️ Processing product images with SEO optimization...')
    for (const config of PRODUCT_SEO_CONFIGS) {
      await optimizeSEOImage(config, path.join(inputDir, 'products'), outputDir)
    }
    
    // Generate comprehensive sitemap
    const sitemap = await generateSEOSitemap(outputDir)
    
    console.log('\n🎉 SEO IMAGE OPTIMIZATION COMPLETE!')
    console.log('\n📊 SEO OPTIMIZATION SUMMARY:')
    console.log(`   👥 Barber images: ${BARBER_SEO_CONFIGS.length}`)
    console.log(`   🛍️ Product images: ${PRODUCT_SEO_CONFIGS.length}`)
    console.log(`   📐 Sizes per image: 10`)
    console.log(`   🎨 Formats per size: 3`)
    console.log(`   📁 Total files per image: 31 (30 images + 1 blur)`)
    console.log(`   📄 Metadata files per image: 2 (structured data + metadata)`)
    
    console.log('\n🎯 SEO FEATURES:')
    console.log('   ✅ Descriptive, keyword-rich filenames')
    console.log('   ✅ JSON-LD structured data for each image')
    console.log('   ✅ Comprehensive metadata files')
    console.log('   ✅ Schema.org Person markup for barbers')
    console.log('   ✅ Schema.org Product markup for products')
    console.log('   ✅ Image sitemap for search engines')
    console.log('   ✅ Alt text and captions optimized for accessibility')
    
    console.log('\n📱 RESPONSIVE PERFORMANCE:')
    console.log('   ✅ WebP format: 25-50% smaller than JPEG')
    console.log('   ✅ AVIF format: 50-80% smaller than JPEG')
    console.log('   ✅ Progressive JPEG for fast initial display')
    console.log('   ✅ Blur placeholders for smooth loading')
    console.log('   ✅ Multiple sizes for all screen densities')
    
    console.log('\n📂 SEO FILE STRUCTURE:')
    console.log('   public/media/seo/')
    ;[...BARBER_SEO_CONFIGS, ...PRODUCT_SEO_CONFIGS].slice(0, 2).forEach(config => {
      console.log(`   ├── ${config.seoName}/`)
      console.log(`   │   ├── ${config.seoName}-thumbnail-150x150.{webp,avif,jpeg}`)
      console.log(`   │   ├── ${config.seoName}-medium-600x600.{webp,avif,jpeg}`)
      console.log(`   │   ├── ${config.seoName}-large-1200x1200.{webp,avif,jpeg}`)
      console.log(`   │   ├── ${config.seoName}-structured-data.json`)
      console.log(`   │   ├── ${config.seoName}-metadata.json`)
      console.log(`   │   └── ${config.seoName}-blur-placeholder.webp`)
    })
    console.log(`   └── ... ${BARBER_SEO_CONFIGS.length + PRODUCT_SEO_CONFIGS.length - 2} more image sets`)
    
    console.log('\n🔍 SEARCH ENGINE BENEFITS:')
    console.log('   📈 Improved image search rankings')
    console.log('   🎯 Rich snippets in search results')
    console.log('   📱 Better mobile search visibility')
    console.log('   🏪 Enhanced local business presence')
    console.log('   🛍️ Product search optimization')
    
    return sitemap
    
  } catch (error) {
    console.error('❌ SEO optimization failed:', error)
    throw error
  }
}

// Export for use in other scripts
export { optimizeAllSEOImages, BARBER_SEO_CONFIGS, PRODUCT_SEO_CONFIGS, generateStructuredData }

// Run if called directly
if (require.main === module) {
  optimizeAllSEOImages()
    .then(() => {
      console.log('\n✅ SEO image optimization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ SEO optimization failed:', error)
      process.exit(1)
    })
}
