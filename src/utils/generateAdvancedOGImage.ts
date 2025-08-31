// src/utils/generateAdvancedOGImage.ts
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

interface OGParams {
  title: string;
  excerpt?: string;
  categoryColor?: string;
  logoUrl?: string;
  template?: string;
  outputFileName: string;
  collectionSlug?: string;
}

export async function generateAdvancedOGImage({
  title,
  excerpt = '',
  categoryColor = '#1a1a1a',
  logoUrl = '/logo.png',
  template = 'default',
  outputFileName,
  collectionSlug = '',
}: OGParams) {
  const outputDir = path.resolve('./public/media/generated-og');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  // Convert Markdown excerpt to HTML
  const excerptHTML = marked.parse(excerpt || '') as string;

  // Generate HTML based on template
  const html = generateTemplateHTML(template, {
    title,
    excerptHTML,
    categoryColor,
    logoUrl,
    collectionSlug,
  });

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${outputPath}.png`, type: 'png', quality: 100 });
  await browser.close();

  return `/media/generated-og/${outputFileName}`;
}

function generateTemplateHTML(
  template: string,
  data: {
    title: string;
    excerptHTML: string;
    categoryColor: string;
    logoUrl: string;
    collectionSlug: string;
  }
) {
  const { title, excerptHTML, categoryColor, logoUrl, collectionSlug } = data;

  switch (template) {
    case 'blogTemplate':
      return generateBlogTemplate(title, excerptHTML, categoryColor, logoUrl);
    case 'productTemplate':
      return generateProductTemplate(title, excerptHTML, categoryColor, logoUrl);
    case 'eventTemplate':
      return generateEventTemplate(title, excerptHTML, categoryColor, logoUrl);
    case 'serviceTemplate':
      return generateServiceTemplate(title, excerptHTML, categoryColor, logoUrl);
    case 'customerTemplate':
      return generateCustomerTemplate(title, excerptHTML, categoryColor, logoUrl);
    default:
      return generateDefaultTemplate(title, excerptHTML, categoryColor, logoUrl, collectionSlug);
  }
}

function generateDefaultTemplate(title: string, excerptHTML: string, categoryColor: string, logoUrl: string, collectionSlug: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1200px;
            height: 630px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: ${categoryColor};
            color: white;
            font-family: 'Arial', sans-serif;
            text-align: center;
            padding: 40px;
          }
          .container {
            max-width: 1000px;
          }
          h1 {
            font-size: 72px;
            font-weight: 700;
            margin: 0 0 20px 0;
            line-height: 1.1;
          }
          .excerpt {
            font-size: 32px;
            font-weight: 400;
            opacity: 0.9;
            line-height: 1.3;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 40px;
            width: 120px;
            height: auto;
            opacity: 0.8;
          }
          .collection-badge {
            position: absolute;
            top: 40px;
            left: 40px;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 24px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${logoUrl}" alt="Logo" />
        <div class="collection-badge">${collectionSlug}</div>
        <div class="container">
          <h1>${title}</h1>
          ${excerptHTML ? `<div class="excerpt">${excerptHTML}</div>` : ''}
        </div>
      </body>
    </html>
  `;
}

function generateBlogTemplate(title: string, excerptHTML: string, categoryColor: string, logoUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: ${categoryColor};
            color: white;
            font-family: 'Georgia', serif;
            display: flex;
            align-items: center;
            padding: 60px;
          }
          .content {
            flex: 1;
            max-width: 800px;
          }
          h1 {
            font-size: 64px;
            font-weight: 700;
            margin: 0 0 30px 0;
            line-height: 1.1;
          }
          .excerpt {
            font-size: 28px;
            line-height: 1.4;
            opacity: 0.9;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 40px;
            width: 100px;
            height: auto;
          }
          .blog-icon {
            position: absolute;
            bottom: 40px;
            right: 40px;
            font-size: 120px;
            opacity: 0.3;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${logoUrl}" alt="Logo" />
        <div class="content">
          <h1>${title}</h1>
          ${excerptHTML ? `<div class="excerpt">${excerptHTML}</div>` : ''}
        </div>
        <div class="blog-icon">📝</div>
      </body>
    </html>
  `;
}

function generateProductTemplate(title: string, excerptHTML: string, categoryColor: string, logoUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, ${categoryColor} 0%, #000000 100%);
            color: white;
            font-family: 'Arial', sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 60px;
          }
          .content {
            flex: 1;
            max-width: 600px;
          }
          h1 {
            font-size: 56px;
            font-weight: 700;
            margin: 0 0 20px 0;
            line-height: 1.1;
          }
          .excerpt {
            font-size: 24px;
            line-height: 1.4;
            opacity: 0.9;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 40px;
            width: 100px;
            height: auto;
          }
          .product-icon {
            font-size: 200px;
            opacity: 0.4;
            margin-left: 40px;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${logoUrl}" alt="Logo" />
        <div class="content">
          <h1>${title}</h1>
          ${excerptHTML ? `<div class="excerpt">${excerptHTML}</div>` : ''}
        </div>
        <div class="product-icon">🛍️</div>
      </body>
    </html>
  `;
}

function generateEventTemplate(title: string, excerptHTML: string, categoryColor: string, logoUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: ${categoryColor};
            color: white;
            font-family: 'Arial', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px;
          }
          .container {
            max-width: 900px;
          }
          h1 {
            font-size: 68px;
            font-weight: 700;
            margin: 0 0 30px 0;
            line-height: 1.1;
          }
          .excerpt {
            font-size: 30px;
            line-height: 1.4;
            opacity: 0.9;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 40px;
            width: 100px;
            height: auto;
          }
          .event-icon {
            font-size: 150px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${logoUrl}" alt="Logo" />
        <div class="container">
          <div class="event-icon">📅</div>
          <h1>${title}</h1>
          ${excerptHTML ? `<div class="excerpt">${excerptHTML}</div>` : ''}
        </div>
      </body>
    </html>
  `;
}

function generateServiceTemplate(title: string, excerptHTML: string, categoryColor: string, logoUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(45deg, ${categoryColor} 0%, #ffffff 100%);
            color: #333;
            font-family: 'Arial', sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 60px;
          }
          .content {
            flex: 1;
            max-width: 700px;
          }
          h1 {
            font-size: 60px;
            font-weight: 700;
            margin: 0 0 25px 0;
            line-height: 1.1;
            color: #000;
          }
          .excerpt {
            font-size: 26px;
            line-height: 1.4;
            color: #666;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 40px;
            width: 100px;
            height: auto;
          }
          .service-icon {
            font-size: 180px;
            opacity: 0.7;
            margin-left: 40px;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${logoUrl}" alt="Logo" />
        <div class="content">
          <h1>${title}</h1>
          ${excerptHTML ? `<div class="excerpt">${excerptHTML}</div>` : ''}
        </div>
        <div class="service-icon">✂️</div>
      </body>
    </html>
  `;
}

function generateCustomerTemplate(title: string, excerptHTML: string, categoryColor: string, logoUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            color: #333;
            font-family: 'Arial', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px;
          }
          .container {
            max-width: 900px;
          }
          h1 {
            font-size: 64px;
            font-weight: 700;
            margin: 0 0 30px 0;
            line-height: 1.1;
            color: #000;
          }
          .excerpt {
            font-size: 28px;
            line-height: 1.4;
            color: #666;
          }
          .logo {
            position: absolute;
            top: 40px;
            right: 40px;
            width: 100px;
            height: auto;
          }
          .customer-icon {
            font-size: 140px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${logoUrl}" alt="Logo" />
        <div class="container">
          <div class="customer-icon">👤</div>
          <h1>${title}</h1>
          ${excerptHTML ? `<div class="excerpt">${excerptHTML}</div>` : ''}
        </div>
      </body>
    </html>
  `;
}
