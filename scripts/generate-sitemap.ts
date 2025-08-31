#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://modernmen.ca';

  // Static pages based on the actual app structure
  const staticPages: SitemapUrl[] = [
    { loc: '/', priority: 1.0, changefreq: 'weekly' },
    { loc: '/about', priority: 0.8, changefreq: 'monthly' },
    { loc: '/services', priority: 0.9, changefreq: 'weekly' },
    { loc: '/team', priority: 0.8, changefreq: 'weekly' },
    { loc: '/gallery', priority: 0.7, changefreq: 'weekly' },
    { loc: '/contact', priority: 0.9, changefreq: 'monthly' },
    { loc: '/blog', priority: 0.8, changefreq: 'daily' },
    { loc: '/book', priority: 0.9, changefreq: 'monthly' },
    { loc: '/gift-cards', priority: 0.6, changefreq: 'monthly' },
    { loc: '/faq', priority: 0.7, changefreq: 'monthly' },
    { loc: '/testimonials', priority: 0.6, changefreq: 'monthly' },
    { loc: '/careers', priority: 0.5, changefreq: 'monthly' },
    { loc: '/search', priority: 0.6, changefreq: 'monthly' },
    { loc: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
    { loc: '/terms', priority: 0.3, changefreq: 'yearly' },
    
    // Documentation pages
    { loc: '/documentation', priority: 0.7, changefreq: 'weekly' },
    { loc: '/documentation/business', priority: 0.6, changefreq: 'monthly' },
    { loc: '/documentation/business/owner', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/business/employee', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/business/customer', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/developer', priority: 0.6, changefreq: 'weekly' },
    { loc: '/documentation/developer/setup', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/developer/api', priority: 0.5, changefreq: 'weekly' },
    { loc: '/documentation/developer/testing', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/developer/architecture', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/developer/components', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/developer/contributing', priority: 0.4, changefreq: 'monthly' },
    { loc: '/documentation/shared', priority: 0.5, changefreq: 'monthly' },
    { loc: '/documentation/shared/faq', priority: 0.4, changefreq: 'monthly' },
    { loc: '/documentation/shared/changelog', priority: 0.4, changefreq: 'weekly' },
    { loc: '/documentation/shared/support', priority: 0.4, changefreq: 'monthly' },
    { loc: '/documentation/shared/troubleshooting', priority: 0.4, changefreq: 'monthly' },
    
    // Auth pages (lower priority as they're functional)
    { loc: '/auth/signin', priority: 0.3, changefreq: 'monthly' },
    { loc: '/auth/signup', priority: 0.3, changefreq: 'monthly' },
    { loc: '/auth/forgot-password', priority: 0.2, changefreq: 'monthly' },
    
    // Portal pages (authenticated users)
    { loc: '/portal', priority: 0.4, changefreq: 'monthly' },
    { loc: '/portal/book', priority: 0.4, changefreq: 'monthly' },
    { loc: '/portal/profile', priority: 0.3, changefreq: 'monthly' },
    { loc: '/portal/services', priority: 0.4, changefreq: 'monthly' },
  ];

  // Dynamic blog posts - fetch from Payload API
  const blogUrls: SitemapUrl[] = [];
  try {
    const { getPayloadClient } = await import('../src/lib/payload-client');
    const payload = await getPayloadClient();
    
    const blogPosts = await payload.find({
      collection: 'posts',
      limit: 1000,
      where: {
        _status: { equals: 'published' }
      }
    });

    blogUrls.push(...blogPosts.docs.map((post: any) => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
      priority: 0.6,
      changefreq: 'monthly'
    })));
    
    console.log(`Added ${blogPosts.docs.length} blog posts to sitemap`);
  } catch (error) {
    console.log('Could not fetch blog posts for sitemap:', error);
  }

  // Dynamic team member pages - fetch from Payload API
  const teamUrls: SitemapUrl[] = [];
  try {
    const { getPayloadClient } = await import('../src/lib/payload-client');
    const payload = await getPayloadClient();
    
    const teamMembers = await payload.find({
      collection: 'team-members',
      limit: 100,
      where: {
        active: { equals: true }
      }
    });

    teamUrls.push(...teamMembers.docs.map((member: any) => ({
      loc: `/team/${member.slug || member.id}`,
      lastmod: member.updatedAt,
      priority: 0.5,
      changefreq: 'monthly'
    })));
    
    console.log(`Added ${teamMembers.docs.length} team members to sitemap`);
  } catch (error) {
    console.log('Could not fetch team members for sitemap:', error);
  }

  const allUrls = [...staticPages, ...blogUrls, ...teamUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write sitemap
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');

  console.log(`✅ Sitemap generated at ${sitemapPath}`);
  console.log(`📊 Generated ${allUrls.length} URLs`);

  return sitemapPath;
}

// Robots.txt generator
function generateRobotsTxt() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://modernmen.ca';
  const robotsTxt = `User-agent: *
Allow: /

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /portal/
Disallow: /dashboard/
Disallow: /editor/
Disallow: /preview/
Disallow: /test-guide/
Disallow: /text-editor/
Disallow: /payload-status/
Disallow: /demo/
Disallow: /offline/
Disallow: /vercel/

# Allow documentation but block admin docs
Allow: /documentation/
Disallow: /documentation/admin/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  const publicDir = path.join(process.cwd(), 'public');
  const robotsPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');

  console.log(`✅ Robots.txt generated at ${robotsPath}`);
  return robotsPath;
}

async function main() {
  try {
    await generateSitemap();
    generateRobotsTxt();
    console.log('🎉 SEO files generated successfully!');
  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
