const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

const pages = [
  // Main pages
  '/',
  '/about',
  '/services',
  '/products',
  '/team',
  '/gallery',
  '/contact',
  '/book',
  '/gift-cards',
  '/faq',
  '/testimonials',
  '/blog',
  '/careers',

  // Auth pages
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',

  // Admin pages
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/content',
  '/admin/barbers',
  '/admin/editor',
  '/admin/settings',

  // CRM pages
  '/crm',
  '/crm/dashboard',
  '/crm/customers',

  // Portal pages
  '/portal',
  '/portal/login',
  '/portal/profile',

  // Specialized pages
  '/editor',
  '/image-editor',
  '/text-editor',
  '/demo',
  '/search',
  '/offline',
  '/preview'
];

async function testPage(url) {
  try {
    const response = await axios.get(`${BASE_URL}${url}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const status = response.status;
    // More specific error detection - avoid false positives from error handling code
    const errorPatterns = [
      'Error:', 'TypeError:', 'ReferenceError:', 'SyntaxError:',
      'console.error', 'throw new Error', 'catch (error)',
      '500 Internal Server Error', '404 Not Found',
      '<title>Error</title>', 'Application error',
      'Something went wrong', 'Failed to load'
    ];
    const hasErrors = errorPatterns.some(pattern => response.data.includes(pattern));
    const title = response.data.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
    const hasContent = response.data.length > 1000;

    return {
      url,
      status,
      title,
      hasContent,
      hasErrors,
      success: status === 200 && !hasErrors && hasContent
    };
  } catch (error) {
    return {
      url,
      status: error.response?.status || 'TIMEOUT',
      error: error.message,
      success: false
    };
  }
}

async function testAllPages() {
  console.log('🚀 Starting comprehensive page testing...\n');

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const page of pages) {
    console.log(`Testing: ${page}`);
    const result = await testPage(page);
    results.push(result);

    if (result.success) {
      successCount++;
      console.log(`✅ ${page} - OK (${result.status})`);
    } else {
      errorCount++;
      console.log(`❌ ${page} - FAILED (${result.status})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.hasErrors) {
        console.log(`   Contains errors in HTML`);
      }
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`Total pages tested: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log(`Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`);

  // Detailed error analysis
  const failedPages = results.filter(r => !r.success);
  if (failedPages.length > 0) {
    console.log('\n❌ Failed Pages Details:');
    failedPages.forEach(page => {
      console.log(`- ${page.url}: ${page.status} ${page.error || ''}`);
    });
  }

  // Check for common issues
  const timeoutPages = results.filter(r => r.status === 'TIMEOUT');
  const serverErrorPages = results.filter(r => r.status >= 500);
  const clientErrorPages = results.filter(r => r.status >= 400 && r.status < 500);

  if (timeoutPages.length > 0) {
    console.log(`\n⏱️  Timeout pages: ${timeoutPages.length}`);
  }
  if (serverErrorPages.length > 0) {
    console.log(`\n🔥 Server error pages: ${serverErrorPages.length}`);
  }
  if (clientErrorPages.length > 0) {
    console.log(`\n⚠️  Client error pages: ${clientErrorPages.length}`);
  }

  return results;
}

// Test homepage first to check if server is running
async function checkServer() {
  try {
    console.log('🔍 Checking if server is running...');
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    console.log(`✅ Server is running on ${BASE_URL} (Status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ Server not accessible: ${error.message}`);
    console.log('💡 Make sure to run: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  const results = await testAllPages();

  // Save results to file
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1) + '%'
    }
  };

  fs.writeFileSync('page-test-results.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Results saved to: page-test-results.json');
}

main().catch(console.error);
