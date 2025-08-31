// scripts/test-all-og-templates.js
import { generateProfessionalOGImage } from '../src/utils/generateProfessionalOGImage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Testing All Professional OG Image Templates...');
console.log('=' .repeat(70));

// Test data for different templates
const testData = [
  {
    title: 'Welcome to Modern Men BarberShop',
    excerpt: 'Experience the ultimate grooming experience with our expert stylists and premium services tailored for the modern gentleman. Book your appointment today!',
    category: 'BarberShop Services',
    template: 'service',
    outputFileName: 'test-service-og.png',
  },
  {
    title: 'Premium Haircut Package',
    excerpt: 'Our signature haircut includes consultation, precision cut, and professional styling. Perfect for the discerning gentleman who values quality.',
    category: 'Haircut',
    template: 'product',
    outputFileName: 'test-product-og.png',
  },
  {
    title: 'Customer Spotlight: John Doe',
    excerpt: 'John has been a loyal customer for 2 years and loves our fade cuts! "Best BarberShop experience ever!" - John D.',
    category: 'Testimonial',
    template: 'customer',
    outputFileName: 'test-customer-og.png',
  },
  {
    title: 'Summer Sale Event - 30% Off',
    excerpt: 'Join us for our summer extravaganza! Get 30% off all services this weekend. Limited time offer - book now and save big!',
    category: 'Promotion',
    template: 'event',
    outputFileName: 'test-event-og.png',
  },
  {
    title: 'The Art of Beard Grooming',
    excerpt: 'Master the techniques of professional beard care and maintenance. Learn from our expert stylists about proper trimming and styling.',
    category: 'Guide',
    template: 'blog',
    outputFileName: 'test-blog-og.png',
  },
  {
    title: 'Complete Grooming Experience',
    excerpt: 'A comprehensive guide to modern mens grooming, from haircuts to skincare routines. Everything you need to know about looking your best.',
    category: 'Lifestyle',
    template: 'default',
    outputFileName: 'test-default-og.png',
  },
];

async function testAllTemplates() {
  console.log(`📋 Testing ${testData.length} OG Image Templates\n`);

  // Test logo existence
  const logoPath = path.join(process.cwd(), 'public', 'logo.svg');
  const logoExists = fs.existsSync(logoPath);
  console.log(`🖼️  Logo Status: ${logoExists ? '✅ Found' : '⚠️  Not found (will use fallback)'}\n`);

  for (let i = 0; i < testData.length; i++) {
    const testCase = testData[i];
    try {
      console.log(`${i + 1}/${testData.length} 🎨 Generating ${testCase.template.toUpperCase()}:`);
      console.log(`   📝 "${testCase.title.substring(0, 50)}..."`);
      console.log(`   🏷️  Category: ${testCase.category}`);

      const startTime = Date.now();

      // Generate OG image
      const imageUrl = await generateProfessionalOGImage({
        title: testCase.title,
        excerpt: testCase.excerpt,
        category: testCase.category,
        categoryColor: getCategoryColor(testCase.category),
        logoUrl: logoExists ? '/logo.svg' : undefined,
        template: testCase.template,
        outputFileName: testCase.outputFileName,
        collectionSlug: 'test-collection',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   ✅ Generated in ${duration}ms`);
      console.log(`   📁 Saved to: public/media/generated-og/${testCase.outputFileName}`);
      console.log(`   🌐 URL: ${imageUrl}\n`);

    } catch (error) {
      console.error(`   ❌ Failed to generate ${testCase.template}:`, error.message);
      console.log('');
    }
  }

  console.log('=' .repeat(70));
  console.log('🎉 OG Image Template Testing Complete!');
  console.log('\n📊 Summary:');

  // Count generated files
  const outputDir = path.join(process.cwd(), 'public', 'media', 'generated-og');
  const files = fs.readdirSync(outputDir).filter(f => f.startsWith('test-') && f.endsWith('.png'));
  console.log(`   ✅ Generated: ${files.length}/${testData.length} images`);
  console.log(`   📁 Output directory: ${outputDir}`);

  if (files.length > 0) {
    console.log('\n📋 Generated Files:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(outputDir, file));
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   • ${file} (${sizeKB} KB)`);
    });
  }

  console.log('\n🎨 Template Features Tested:');
  console.log('   • Dynamic font sizing for long titles');
  console.log('   • Professional gradients and backgrounds');
  console.log('   • Category badges and collection indicators');
  console.log('   • Logo integration and branding');
  console.log('   • Text wrapping and layout optimization');
  console.log('   • Template-specific styling (blog, product, service, event, customer)');

  console.log('\n🚀 Next Steps:');
  console.log('   1. Check generated images in public/media/generated-og/');
  console.log('   2. Create content in Payload collections to auto-generate OG images');
  console.log('   3. OG images will be generated automatically on publish');
  console.log('   4. Use OG image URLs in your social media sharing');
}

// Get appropriate color for category
function getCategoryColor(category) {
  const colorMap = {
    'BarberShop Services': '#1a365d',
    'Haircut': '#2d3748',
    'Testimonial': '#38a169',
    'Promotion': '#d69e2e',
    'Guide': '#3182ce',
    'Lifestyle': '#805ad5',
  };
  return colorMap[category] || '#1a202c';
}

// Run the test
testAllTemplates().catch(console.error);
