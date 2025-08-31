// scripts/generate-professional-og-samples.js
import { generateProfessionalOGImage } from '../src/utils/generateProfessionalOGImage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samples = [
  {
    title: 'Welcome to Modern Men BarberShop',
    excerpt: 'Experience the ultimate grooming experience with our expert stylists and premium services tailored for the modern gentleman.',
    category: 'BarberShop',
    template: 'service',
    outputFileName: 'sample-service-og.png',
  },
  {
    title: 'Premium Haircut Package',
    excerpt: 'Our signature haircut includes consultation, precision cut, and professional styling. Perfect for the discerning gentleman.',
    category: 'Haircut',
    template: 'product',
    outputFileName: 'sample-product-og.png',
  },
  {
    title: 'Customer Spotlight: John Doe',
    excerpt: 'John has been a loyal customer for 2 years and loves our fade cuts! "Best BarberShop experience ever!"',
    category: 'Review',
    template: 'customer',
    outputFileName: 'sample-customer-og.png',
  },
  {
    title: 'Summer Sale Event - 20% Off',
    excerpt: 'Join us for our summer sale! Get 20% off all services this weekend. Limited time offer - book now!',
    category: 'Sale',
    template: 'event',
    outputFileName: 'sample-event-og.png',
  },
  {
    title: 'The Art of Beard Grooming',
    excerpt: 'Master the techniques of professional beard care and maintenance. Learn from our expert stylists.',
    category: 'Guide',
    template: 'blog',
    outputFileName: 'sample-blog-og.png',
  },
  {
    title: 'Ultimate Grooming Experience',
    excerpt: 'A comprehensive guide to modern mens grooming, from haircuts to skincare routines.',
    category: 'Lifestyle',
    template: 'default',
    outputFileName: 'sample-default-og.png',
  },
];

async function generateSampleOGImages() {
  console.log('🎨 Generating Professional OG Image Samples...');
  console.log('=' .repeat(60));

  // Check if logo exists
  const logoPath = path.join(process.cwd(), 'public', 'logo.svg');
  if (!fs.existsSync(logoPath)) {
    console.warn('⚠️  Logo not found at public/logo.svg - images will be generated without logo');
  }

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    try {
      console.log(`\n${i + 1}/${samples.length} 📝 Generating ${sample.template.toUpperCase()}: "${sample.title.substring(0, 40)}..."`);

      const startTime = Date.now();
      const imageUrl = await generateProfessionalOGImage({
        ...sample,
        categoryColor: getCategoryColor(sample.category),
        logoUrl: '/logo.svg',
        collectionSlug: 'samples',
      });
      const endTime = Date.now();

      console.log(`   ✅ Generated in ${(endTime - startTime)}ms: ${imageUrl}`);
      console.log(`   📁 Saved to: public${imageUrl}`);

    } catch (error) {
      console.error(`   ❌ Failed to generate ${sample.outputFileName}:`, error.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Professional OG Image Generation Complete!');
  console.log('\n📋 Generated Templates:');
  samples.forEach((sample, i) => {
    console.log(`   ${i + 1}. ${sample.template.charAt(0).toUpperCase() + sample.template.slice(1)} - "${sample.title.substring(0, 30)}..."`);
  });

  console.log('\n🔍 Check the generated images in: public/media/generated-og/');
  console.log('🌐 Use these URLs in your social media previews!');
}

// Get appropriate color for category
function getCategoryColor(category) {
  const colorMap = {
    'BarberShop': '#1a365d',
    'Haircut': '#2d3748',
    'Review': '#38a169',
    'Sale': '#d69e2e',
    'Guide': '#3182ce',
    'Lifestyle': '#805ad5',
  };
  return colorMap[category] || '#1a202c';
}

// Run the script
generateSampleOGImages().catch(console.error);
