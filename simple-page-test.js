const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

const pages = [
  '/', '/about', '/services', '/products', '/team', '/gallery', '/contact',
  '/auth/signin', '/auth/signup', '/book',
  '/admin', '/admin/dashboard', '/admin/users', '/admin/content',
  '/crm/dashboard', '/crm/customers',
  '/portal', '/portal/login', '/portal/profile',
  '/editor', '/image-editor', '/demo', '/search'
];

async function testPage(url) {
  try {
    const response = await axios.get(`${BASE_URL}${url}`, { timeout: 10000 });
    const hasErrors = response.data.includes('Error:') || response.data.includes('500');
    const hasContent = response.data.length > 1000;
    return { url, status: response.status, success: response.status === 200 && !hasErrors && hasContent };
  } catch (error) {
    return { url, status: 'ERROR', success: false };
  }
}

async function main() {
  console.log('Testing pages...\n');

  const results = [];
  for (const url of pages) {
    const result = await testPage(url);
    results.push(result);
    console.log(`${result.success ? '✅' : '❌'} ${result.url}: ${result.status}`);
  }

  const successful = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n🎯 Results: ${successful}/${total} pages working (${(successful/total*100).toFixed(1)}%)`);

  if (successful === total) {
    console.log('🎉 All pages are working perfectly!');
  } else {
    console.log('🔧 Some pages need attention');
  }
}

main().catch(console.error);
