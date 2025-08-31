// src/scripts/generate-sample-og.ts
import { generateAdvancedOGImage } from '../utils/generateAdvancedOGImage';
import { ogTemplates } from '../utils/ogTemplates';

async function generateSampleOGImages() {
  console.log('Generating sample OG images...');

  const samples = [
    {
      title: 'Welcome to Modern Men BarberShop',
      excerpt: 'Experience the ultimate grooming experience with our expert stylists and premium services.',
      template: 'serviceTemplate',
      outputFileName: 'sample-service-og.png',
    },
    {
      title: 'Premium Haircut Package',
      excerpt: 'Our signature haircut includes consultation, precision cut, and professional styling.',
      template: 'productTemplate',
      outputFileName: 'sample-product-og.png',
    },
    {
      title: 'Customer Spotlight: John Doe',
      excerpt: 'John has been a loyal customer for 2 years and loves our fade cuts!',
      template: 'customerTemplate',
      outputFileName: 'sample-customer-og.png',
    },
    {
      title: 'Summer Sale Event',
      excerpt: '20% off all services this weekend! Book now and save big.',
      template: 'eventTemplate',
      outputFileName: 'sample-event-og.png',
    },
    {
      title: 'The Art of Beard Grooming',
      excerpt: 'Master the techniques of professional beard care and maintenance.',
      template: 'blogTemplate',
      outputFileName: 'sample-blog-og.png',
    },
  ];

  for (const sample of samples) {
    try {
      console.log(`Generating ${sample.template} for: ${sample.title}`);
      const imageUrl = await generateAdvancedOGImage({
        ...sample,
        categoryColor: '#1a1a1a',
        logoUrl: '/logo.png',
        collectionSlug: 'sample',
      });
      console.log(`✓ Generated: ${imageUrl}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${sample.outputFileName}:`, error);
    }
  }

  console.log('Sample OG image generation complete!');
}

// Run the script
generateSampleOGImages().catch(console.error);
