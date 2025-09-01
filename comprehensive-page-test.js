const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

const testCategories = {
  main: [
    '/',
    '/about',
    '/services',
    '/products',
    '/team',
    '/gallery',
    '/contact',
    '/faq',
    '/testimonials',
    '/blog',
    '/careers'
  ],
  auth: [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password'
  ],
  booking: [
    '/book'
  ],
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/content',
    '/admin/barbers',
    '/admin/settings'
  ],
  crm: [
    '/crm',
    '/crm/dashboard',
    '/crm/customers'
  ],
  portal: [
    '/portal',
    '/portal/login',
    '/portal/profile'
  ],
  specialized: [
    '/editor',
    '/image-editor',
    '/text-editor',
    '/demo',
    '/search',
    '/offline',
    '/preview',
    '/gift-cards'
  ]
};

async function testPage(url, category) {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}${url}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    });
    const loadTime = Date.now() - startTime;

    const status = response.status;
    const data = response.data;
    const hasContent = data.length > 1000;

    // Check for common error patterns
    const errorPatterns = [
      'Error:', 'TypeError:', 'ReferenceError:', 'SyntaxError:',
      'console.error', 'throw new Error', '500 Internal Server Error',
      'Application error', 'Something went wrong', 'Failed to load',
      '<title>Error</title>', 'Internal Server Error'
    ];

    const hasErrors = errorPatterns.some(pattern => data.includes(pattern));

    // Extract title and meta information
    const title = data.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
    const hasH1 = data.includes('<h1') || data.includes('<H1');
    const hasNavigation = data.includes('nav') || data.includes('navigation');
    const hasFooter = data.includes('footer') || data.includes('Footer');

    // Check for key UI elements
    const hasButtons = data.includes('<button') || data.includes('<Button');
    const hasForms = data.includes('<form') || data.includes('<Form');
    const hasImages = data.includes('<img') || data.includes('<Image');

    // Check for responsive design indicators
    const hasResponsiveClasses = data.includes('md:') || data.includes('lg:') || data.includes('sm:');

    return {
      url,
      category,
      status,
      loadTime,
      title,
      hasContent,
      hasErrors,
      hasH1,
      hasNavigation,
      hasFooter,
      hasButtons,
      hasForms,
      hasImages,
      hasResponsiveClasses,
      contentLength: data.length,
      success: status === 200 && !hasErrors && hasContent
    };
  } catch (error) {
    return {
      url,
      category,
      status: error.response?.status || 'TIMEOUT',
      error: error.message,
      success: false,
      loadTime: 0,
      hasContent: false,
      hasErrors: true
    };
  }
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      averageLoadTime: results.filter(r => r.loadTime > 0).reduce((sum, r) => sum + r.loadTime, 0) / results.filter(r => r.loadTime > 0).length,
      successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1) + '%'
    },
    byCategory: {},
    issues: [],
    recommendations: []
  };

  // Group by category
  Object.keys(testCategories).forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    report.byCategory[category] = {
      total: categoryResults.length,
      successful: categoryResults.filter(r => r.success).length,
      failed: categoryResults.filter(r => !r.success).length,
      successRate: ((categoryResults.filter(r => r.success).length / categoryResults.length) * 100).toFixed(1) + '%'
    };
  });

  // Identify issues
  const failedPages = results.filter(r => !r.success);
  if (failedPages.length > 0) {
    report.issues.push(`❌ ${failedPages.length} pages failed to load properly`);
    failedPages.forEach(page => {
      report.issues.push(`   - ${page.url}: ${page.status} ${page.error || ''}`);
    });
  }

  // Check for missing UI elements
  const pagesWithoutNavigation = results.filter(r => r.success && !r.hasNavigation);
  if (pagesWithoutNavigation.length > 0) {
    report.issues.push(`⚠️  ${pagesWithoutNavigation.length} pages missing navigation`);
  }

  const pagesWithoutFooter = results.filter(r => r.success && !r.hasFooter);
  if (pagesWithoutFooter.length > 0) {
    report.issues.push(`⚠️  ${pagesWithoutFooter.length} pages missing footer`);
  }

  // Check for slow loading pages
  const slowPages = results.filter(r => r.success && r.loadTime > 5000);
  if (slowPages.length > 0) {
    report.issues.push(`🐌 ${slowPages.length} pages loading slowly (>5s)`);
  }

  // Generate recommendations
  if (report.summary.successful < report.summary.total) {
    report.recommendations.push('🔧 Fix broken pages and error handling');
  }
  if (pagesWithoutNavigation.length > 0) {
    report.recommendations.push('🎨 Add consistent navigation to all pages');
  }
  if (pagesWithoutFooter.length > 0) {
    report.recommendations.push('🎨 Add consistent footer to all pages');
  }
  if (slowPages.length > 0) {
    report.recommendations.push('⚡ Optimize page loading performance');
  }

  // Check responsive design
  const responsivePages = results.filter(r => r.success && r.hasResponsiveClasses);
  if (responsivePages.length < results.filter(r => r.success).length * 0.8) {
    report.recommendations.push('📱 Improve responsive design implementation');
  }

  return report;
}

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive page testing...\n');

  const allPages = [];
  Object.entries(testCategories).forEach(([category, urls]) => {
    urls.forEach(url => allPages.push({ url, category }));
  });

  const results = [];
  let completed = 0;

  console.log(`Testing ${allPages.length} pages across ${Object.keys(testCategories).length} categories...\n`);

  // Test pages in batches to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < allPages.length; i += batchSize) {
    const batch = allPages.slice(i, i + batchSize);
    const batchPromises = batch.map(({ url, category }) => testPage(url, category));

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    completed += batch.length;
    console.log(`✅ Completed ${completed}/${allPages.length} pages`);

    // Small delay between batches
    if (i + batchSize < allPages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Generate and display report
  const report = generateReport(results);

  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(60));
  console.log(`Total Pages: ${report.summary.total}`);
  console.log(`Successful: ${report.summary.successful} (${report.summary.successRate})`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Average Load Time: ${report.summary.averageLoadTime.toFixed(0)}ms`);
  console.log('');

  console.log('📈 By Category:');
  Object.entries(report.byCategory).forEach(([category, stats]) => {
    console.log(`  ${category}: ${stats.successful}/${stats.total} (${stats.successRate})`);
  });
  console.log('');

  if (report.issues.length > 0) {
    console.log('❌ Issues Found:');
    report.issues.forEach(issue => console.log(`  ${issue}`));
    console.log('');
  }

  if (report.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log('');
  }

  // Save detailed results
  const fs = require('fs');
  fs.writeFileSync('comprehensive-test-results.json', JSON.stringify({ results, report }, null, 2));
  console.log('📄 Detailed results saved to: comprehensive-test-results.json');

  // Show top performing pages
  const topPages = results
    .filter(r => r.success)
    .sort((a, b) => a.loadTime - b.loadTime)
    .slice(0, 5);

  if (topPages.length > 0) {
    console.log('\n🏆 Top 5 Fastest Pages:');
    topPages.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.url} (${page.loadTime}ms)`);
    });
  }

  return { results, report };
}

async function main() {
  try {
    console.log('🔍 Checking server status...');
    await axios.get(BASE_URL, { timeout: 5000 });
    console.log('✅ Server is running and responsive\n');

    const { results, report } = await runComprehensiveTest();

    // Provide actionable insights
    console.log('\n🎯 Action Items:');

    if (report.summary.successful === report.summary.total) {
      console.log('✅ All pages are working perfectly!');
    } else {
      const failedCategories = Object.entries(report.byCategory)
        .filter(([_, stats]) => stats.failed > 0)
        .map(([category, _]) => category);

      console.log(`🔧 Focus on fixing: ${failedCategories.join(', ')}`);
    }

    console.log('\n✨ Testing completed successfully!');

  } catch (error) {
    console.error('❌ Server not accessible:', error.message);
    console.log('💡 Make sure to run: npm run dev');
    process.exit(1);
  }
}

main().catch(console.error);
