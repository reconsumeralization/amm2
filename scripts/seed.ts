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
      id: result.doc.id,
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
    name: 'Site Settings',
    value: {
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
    }
  });
}

/**
 * Seed stylists/team members
 */
async function seedStylists(adminUser: SeedResult): Promise<SeedResult[]> {
  logger.info('👨‍💼 Seeding stylists...');
  
  const stylists = [
    {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '555-0101',
      bio: 'With over 8 years of experience, Alex specializes in modern techniques and classic cuts. He\'s passionate about helping men look and feel their best.',
      user: adminUser.id,
      isActive: true,
      rating: 4.8,
      reviewCount: 120,
      experience: 8,
      specialties: 'Modern fades, beard shaping, precision cuts',
    },
    {
      name: 'Jordan Smith',
      email: 'jordan.smith@example.com',
      phone: '555-0102',
      bio: 'Jordan brings traditional barbering techniques with a modern twist. His attention to detail ensures every client leaves satisfied.',
      user: adminUser.id,
      isActive: true,
      rating: 4.9,
      reviewCount: 95,
      experience: 6,
      specialties: 'Traditional cuts, hot towel shaves, styling',
    },
    {
      name: 'Sam Williams',
      email: 'sam.williams@example.com',
      phone: '555-0103',
      bio: 'Sam is our beard expert, specializing in shaping and maintaining facial hair. He knows that a great beard starts with great technique.',
      user: adminUser.id,
      isActive: true,
      rating: 4.7,
      reviewCount: 80,
      experience: 5,
      specialties: 'Beard grooming, line-ups, facial hair design',
    },
  ];

  const results: SeedResult[] = [];
  for (const stylist of stylists) {
    const result = await createDocument('stylists', stylist);
    results.push(result);
  }
  
  return results;
}

async function seedTenants(): Promise<SeedResult> {
    logger.info('🏢 Seeding tenants...');
    return createDocument('tenants', {
        name: 'ModernMen',
        email: 'tenant@modernmen.com',
        status: 'active',
    });
}

async function seedUsers(tenant: SeedResult): Promise<SeedResult> {
    logger.info('👤 Seeding users...');
    return createDocument('users', {
        email: 'admin@modernmen.com',
        password: 'password',
        name: 'Admin User',
        role: 'admin',
        tenant: tenant.id,
    });
}

async function seedCustomers(tenant: SeedResult): Promise<SeedResult[]> {
    logger.info('👥 Seeding customers...');
    const customers = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-0104',
            tenant: tenant.id,
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '555-0105',
            tenant: tenant.id,
        },
    ];

    const results: SeedResult[] = [];
    for (const customer of customers) {
        const result = await createDocument('customers', customer);
        results.push(result);
    }
    return results;
}

async function seedServices(): Promise<SeedResult[]> {
    logger.info('✂️ Seeding services...');
    const services = [
        {
            name: 'Classic Haircut',
            description: 'A timeless haircut that never goes out of style.',
            price: 30,
            duration: 30,
            category: 'Hair',
        },
        {
            name: 'Beard Trim',
            description: 'Keep your beard looking sharp and well-groomed.',
            price: 15,
            duration: 15,
            category: 'Beard',
        },
        {
            name: 'Hot Towel Shave',
            description: 'A luxurious and relaxing shave experience.',
            price: 40,
            duration: 45,
            category: 'Shave',
        },
    ];

    const results: SeedResult[] = [];
    for (const service of services) {
        const result = await createDocument('services', service);
        results.push(result);
    }
    return results;
}

async function seedProducts(): Promise<SeedResult[]> {
    logger.info('🧴 Seeding products...');
    const products = [
        {
            name: 'Styling Pomade',
            description: 'Provides a strong hold and a matte finish.',
            price: 20,
            category: 'Styling',
            brand: 'ModernMen',
            sku: 'MM-P001',
            inStock: true,
        },
        {
            name: 'Beard Oil',
            description: 'Nourishes and conditions your beard.',
            price: 25,
            category: 'Beard',
            brand: 'ModernMen',
            sku: 'MM-B001',
            inStock: true,
        },
    ];

    const results: SeedResult[] = [];
    for (const product of products) {
        const result = await createDocument('products', product);
        results.push(result);
    }
    return results;
}

async function seedLocations(tenant: SeedResult): Promise<SeedResult[]> {
    logger.info('📍 Seeding locations...');
    const locations = [
        {
            name: 'Downtown',
            address: '123 Main St, Anytown, USA',
            phone: '555-0106',
            tenant: tenant.id,
            active: true,
        },
        {
            name: 'Uptown',
            address: '456 Oak Ave, Anytown, USA',
            phone: '555-0107',
            tenant: tenant.id,
            active: true,
        },
    ];

    const results: SeedResult[] = [];
    for (const location of locations) {
        const result = await createDocument('locations', location);
        results.push(result);
    }
    return results;
}

async function seedAppointments(customers: SeedResult[], services: SeedResult[], stylists: SeedResult[]): Promise<SeedResult[]> {
    logger.info('📅 Seeding appointments...');
    const appointments = [
        {
            customer: customers[0].id,
            service: services[0].id,
            stylist: stylists[0].id,
            date: new Date().toISOString(),
            status: 'scheduled',
        },
        {
            customer: customers[1].id,
            service: services[1].id,
            stylist: stylists[1].id,
            date: new Date().toISOString(),
            status: 'completed',
        },
    ];

    const results: SeedResult[] = [];
    for (const appointment of appointments) {
        const result = await createDocument('appointments', appointment);
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
    const tenant = await seedTenants();
    results.push(tenant);

    if (!tenant.success) {
        logger.error('Failed to seed tenant, aborting seeding process.', {});
        process.exit(1);
    }

    const adminUser = await seedUsers(tenant);
    results.push(adminUser);

    if (!adminUser.success) {
        logger.error('Failed to seed admin user, aborting seeding process.', {});
        process.exit(1);
    }

    results.push(await seedSettings());
    const stylists = await seedStylists(adminUser);
    results.push(...stylists);

    const customers = await seedCustomers(tenant);
    results.push(...customers);

    const services = await seedServices();
    results.push(...services);

    results.push(...await seedProducts());
    results.push(...await seedLocations(tenant));

    if (customers.every(c => c.success) && services.every(s => s.success) && stylists.every(s => s.success)) {
        results.push(...await seedAppointments(customers, services, stylists));
    }

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