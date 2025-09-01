#!/usr/bin/env tsx

/**
 * ModernMen Content Seeding Script
 * Seeds initial content for the barbershop application
 */

import { config } from 'dotenv';
import { validateEnvironmentVariables } from '../src/lib/env-validator';
import { logger } from '../src/lib/logger';

// Load environment variables
config();

const PAYLOAD_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.SEED_API_KEY;

interface SeedResult {
  collection: string;
  id: string;
  success: boolean;
  error?: string;
}

/**
 * Create a document in a Payload collection
 */
async function createDocument(collection: string, data: any): Promise<SeedResult> {
  try {
    const response = await fetch(`${PAYLOAD_URL}/api/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `API-Key ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      logger.error(`Failed to seed ${collection}:`, {}, result);
      return {
        collection,
        id: '',
        success: false,
        error: result.message || 'Unknown error',
      };
    }

    return {
      collection,
      id: result.id,
      success: true,
    };
  } catch (error) {
    logger.error(`Error seeding ${collection}:`, {}, error as Error);
    return {
      collection,
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Seed site settings
 */
async function seedSettings(): Promise<SeedResult> {
  logger.info('📝 Seeding site settings...');
  
  return createDocument('settings', {
    siteTitle: 'Modern Men Hair BarberShop',
    siteDescription: 'Regina\'s premier men\'s grooming BarberShop. Expert barbers, modern styles, and premium grooming services.',
    contactEmail: 'hello@modernmen.ca',
    contactPhone: '+1 (306) 522-4111',
    businessHours: 'Mon-Fri 9am-6pm, Sat 8am-5pm, Sun Closed',
    address: '#4 - 425 Victoria Ave East, Regina, SK, S4N 0N8',
    socialLinks: {
      facebook: 'https://facebook.com/modernmenregina',
      instagram: 'https://instagram.com/modernmenregina',
    },
    editor: {
      pageBuilder: {
        enabled: true,
        components: ['text', 'image', 'button', 'bookingChatbot', 'barberProfile', 'testimonial'],
      },
      imageOptimization: {
        maxImageSize: 5242880,
        responsiveSizes: [
          { width: 320, label: 'mobile' },
          { width: 768, label: 'tablet' },
          { width: 1200, label: 'desktop' },
        ],
        formats: ['jpeg', 'webp'],
        quality: 80,
      },
    },
  });
}

/**
 * Seed stylists/team members
 */
async function seedStylists(): Promise<SeedResult[]> {
  logger.info('👨‍💼 Seeding stylists...');
  
  const stylists = [
    {
      name: 'Alex Johnson',
      role: 'Lead Stylist',
      specialty: 'Modern fades, beard shaping, precision cuts',
      bio: 'With over 8 years of experience, Alex specializes in modern techniques and classic cuts. He\'s passionate about helping men look and feel their best.',
      status: 'active',
      order: 0,
    },
    {
      name: 'Jordan Smith',
      role: 'Senior Barber',
      specialty: 'Traditional cuts, hot towel shaves, styling',
      bio: 'Jordan brings traditional barbering techniques with a modern twist. His attention to detail ensures every client leaves satisfied.',
      status: 'active',
      order: 1,
    },
    {
      name: 'Sam Williams',
      role: 'Beard Specialist',
      specialty: 'Beard grooming, line-ups, facial hair design',
      bio: 'Sam is our beard expert, specializing in shaping and maintaining facial hair. He knows that a great beard starts with great technique.',
      status: 'active',
      order: 2,
    },
  ];

  const results: SeedResult[] = [];
  for (const stylist of stylists) {
    const result = await createDocument('stylists', stylist);
    results.push(result);
  }
  
  return results;
}

/**
 * Seed contact information
 */
async function seedContacts(): Promise<SeedResult> {
  logger.info('📞 Seeding contact information...');
  
  return createDocument('contacts', {
    name: 'Modern Men HQ',
    address: '#4 - 425 Victoria Ave East, Regina, SK, S4N 0N8',
    phone: '+1 (306) 522-4111',
    email: 'hello@modernmen.ca',
    hours: 'Mon–Fri: 9am–6pm • Sat: 8am–5pm • Sun: Closed',
    mapEmbedUrl: 'https://maps.google.com/maps?q=425+Victoria+Ave+East+Regina+SK&t=&z=15&ie=UTF8&iwloc=&output=embed',
  });
}

/**
 * Seed navigation menu
 */
async function seedNavigation(): Promise<SeedResult> {
  logger.info('🧭 Seeding navigation...');
  
  return createDocument('navigation', {
    name: 'Main Menu',
    items: [
      { label: 'Home', href: '/', internal: true, order: 0, isActive: true },
      { label: 'Services', href: '/services', internal: true, order: 1, isActive: true },
      { label: 'Team', href: '/team', internal: true, order: 2, isActive: true },
      { label: 'Gallery', href: '/gallery', internal: true, order: 3, isActive: true },
      { label: 'Blog', href: '/blog', internal: true, order: 4, isActive: true },
      { label: 'Contact', href: '/contact', internal: true, order: 5, isActive: true },
    ],
  });
}

/**
 * Seed blog posts
 */
async function seedBlogPosts(): Promise<SeedResult[]> {
  logger.info('📝 Seeding blog posts...');
  
  const posts = [
    {
      title: 'Welcome to Modern Men Hair BarberShop',
      slug: 'welcome-modernmen',
      excerpt: 'Your premier destination for men\'s grooming in Regina. Expert barbers, modern techniques, and exceptional service.',
      content: [
        {
          type: 'paragraph',
          children: [
            { text: 'Welcome to Modern Men Hair BarberShop, Regina\'s premier destination for men\'s grooming. We combine traditional barbering techniques with modern styling to give you the perfect look.' }
          ]
        },
        {
          type: 'paragraph',
          children: [
            { text: 'Our experienced team of professional barbers specializes in everything from precision cuts and fades to beard grooming and hot towel shaves. We\'re committed to providing exceptional service in a comfortable, modern environment.' }
          ]
        }
      ],
      published: true,
      publishedAt: new Date().toISOString(),
      author: 'Modern Men Team',
      category: 'announcement',
      featured: true,
    },
    {
      title: 'The Art of the Perfect Fade',
      slug: 'perfect-fade-guide',
      excerpt: 'Master the art of the fade haircut with our comprehensive guide to achieving professional results.',
      content: [
        {
          type: 'paragraph',
          children: [
            { text: 'The fade haircut has become a staple in men\'s grooming, and for good reason. When done correctly, it creates a clean, polished look that transitions seamlessly from longer hair on top to shorter hair at the sides and back.' }
          ]
        },
        {
          type: 'paragraph',
          children: [
            { text: 'At Modern Men, our barbers are experts in various fade techniques, from the subtle low fade to the dramatic high and tight. Each fade is customized to complement your face shape, hair texture, and personal style.' }
          ]
        }
      ],
      published: true,
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      author: 'Alex Johnson',
      category: 'technique',
      featured: false,
    },
  ];

  const results: SeedResult[] = [];
  for (const post of posts) {
    const result = await createDocument('blog-posts', post);
    results.push(result);
  }
  
  return results;
}

/**
 * Seed promotions
 */
async function seedPromotions(): Promise<SeedResult> {
  logger.info('🎉 Seeding sample promotion...');
  
  return createDocument('promotions', {
    title: 'Grand Opening Special - 20% Off',
    description: 'Book your appointment in our first month and receive 20% off any service. Limited time offer!',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days from now
    active: true,
    discountType: 'percentage',
    discountValue: 20,
    applicableServices: ['all'],
  });
}

/**
 * Seed FAQs
 */
async function seedFAQs(): Promise<SeedResult[]> {
  logger.info('❓ Seeding FAQs...');
  
  const faqs = [
    {
      question: 'How long does a typical haircut appointment take?',
      answer: 'Most haircut appointments take 30-45 minutes, depending on the style and complexity. We recommend booking ahead to ensure your preferred time slot is available.',
      category: 'services',
      order: 0,
      isActive: true,
      featured: true,
    },
    {
      question: 'Do you accept walk-ins?',
      answer: 'While we do accept walk-ins when capacity allows, we strongly recommend booking an appointment to guarantee your preferred stylist and time slot.',
      category: 'appointments',
      order: 1,
      isActive: true,
      featured: false,
    },
    {
      question: 'What grooming products do you carry?',
      answer: 'We carry a full range of premium grooming products including beard oils, hair styling products, skincare items, and professional-grade tools.',
      category: 'products',
      order: 2,
      isActive: true,
      featured: false,
    },
  ];

  const results: SeedResult[] = [];
  for (const faq of faqs) {
    const result = await createDocument('faqs', faq);
    results.push(result);
  }
  
  return results;
}

/**
 * Main seeding function
 */
async function run(): Promise<void> {
  try {
    logger.info('🌱 Starting ModernMen content seeding...\n');

    // Validate environment first
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      logger.error('Environment validation failed:', { errors: envValidation.errors });
      process.exit(1);
    }

    if (!API_KEY) {
      logger.error('SEED_API_KEY environment variable is required');
      process.exit(1);
    }

    const results: SeedResult[] = [];

    // Seed all content
    results.push(await seedSettings());
    results.push(...await seedStylists());
    results.push(await seedContacts());
    results.push(await seedNavigation());
    results.push(...await seedBlogPosts());
    results.push(await seedPromotions());
    results.push(...await seedFAQs());

    // Report results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    logger.info('\n🎉 Content seeding complete!');
    logger.info('📊 Summary:');
    logger.info(`  • ${successful.length} items seeded successfully`);
    logger.info(`  • ${failed.length} items failed`);

    if (failed.length > 0) {
      logger.error('\n❌ Failed items:');
      failed.forEach(item => {
        logger.error(`  • ${item.collection}: ${item.error}`);
      });
    }

    logger.info('\n🚀 Ready for production!');

  } catch (error) {
    logger.error('Seeding failed:', {}, error as Error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  run().catch((error) => {
    logger.error('Unhandled error:', {}, error as Error);
    process.exit(1);
  });
}

export { run as seedContent };
