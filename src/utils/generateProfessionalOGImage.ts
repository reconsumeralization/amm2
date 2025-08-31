// src/utils/generateProfessionalOGImage.ts
import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

interface OGImageOptions {
  title: string;
  excerpt?: string;
  category?: string;
  categoryColor?: string;
  logoUrl?: string;
  template?: 'default' | 'blog' | 'product' | 'event' | 'service' | 'customer';
  outputFileName: string;
  collectionSlug?: string;
}

export async function generateProfessionalOGImage({
  title,
  excerpt = '',
  category,
  categoryColor = '#1a1a1a',
  logoUrl = '/logo.svg',
  template = 'default',
  outputFileName,
  collectionSlug = '',
}: OGImageOptions): Promise<string> {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1️⃣ Dynamic background based on template
  drawBackground(ctx, width, height, template, categoryColor);

  // 2️⃣ Draw accent elements (lines, shapes)
  drawAccentElements(ctx, width, height, template);

  // 3️⃣ Logo (if available)
  await drawLogo(ctx, logoUrl, template);

  // 4️⃣ Collection badge (top-right)
  if (collectionSlug) {
    drawCollectionBadge(ctx, width, collectionSlug, template);
  }

  // 5️⃣ Category badge (if provided)
  if (category) {
    drawCategoryBadge(ctx, width, height, category, categoryColor);
  }

  // 6️⃣ Dynamic title with font sizing
  drawTitle(ctx, width, height, title, template);

  // 7️⃣ Excerpt text
  if (excerpt) {
    drawExcerpt(ctx, width, height, excerpt, template);
  }

  // 8️⃣ Save the image
  const outputDir = path.join(process.cwd(), 'public', 'media', 'generated-og');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));

  return `/media/generated-og/${outputFileName}`;
}

// 🎨 Background gradients and styling
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: string,
  categoryColor: string
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);

  switch (template) {
    case 'blog':
      gradient.addColorStop(0, '#2d3748');
      gradient.addColorStop(0.5, '#1a202c');
      gradient.addColorStop(1, '#0f1419');
      break;
    case 'product':
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      break;
    case 'service':
      gradient.addColorStop(0, '#fef7ed');
      gradient.addColorStop(1, '#fed7aa');
      break;
    case 'event':
      gradient.addColorStop(0, '#fef3c7');
      gradient.addColorStop(1, '#fbbf24');
      break;
    case 'customer':
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#bae6fd');
      break;
    default:
      gradient.addColorStop(0, categoryColor);
      gradient.addColorStop(1, adjustColor(categoryColor, -30));
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle pattern overlay
  drawSubtlePattern(ctx, width, height, template);
}

// 🎨 Subtle pattern overlay
function drawSubtlePattern(ctx: CanvasRenderingContext2D, width: number, height: number, template: string) {
  ctx.save();
  ctx.globalAlpha = 0.05;

  if (template === 'blog') {
    // Diagonal lines for blog
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let i = -height; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
  } else if (template === 'product') {
    // Dots for product
    ctx.fillStyle = '#1a1a1a';
    for (let x = 0; x < width; x += 80) {
      for (let y = 0; y < height; y += 80) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// 🎨 Accent elements (lines, shapes)
function drawAccentElements(ctx: CanvasRenderingContext2D, width: number, height: number, template: string) {
  ctx.save();
  ctx.globalAlpha = 0.1;

  switch (template) {
    case 'blog':
      // Elegant corner accent
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(width - 100, 50);
      ctx.lineTo(width - 50, 50);
      ctx.lineTo(width - 50, 100);
      ctx.stroke();
      break;

    case 'product':
      // Bottom accent line
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(80, height - 60);
      ctx.lineTo(width - 80, height - 60);
      ctx.stroke();
      break;

    case 'service':
      // Circular accent
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(width - 100, height - 100, 60, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'event':
      // Calendar-style accent
      ctx.fillStyle = '#d97706';
      ctx.fillRect(width - 120, 60, 80, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📅', width - 80, 110);
      break;

    default:
      // Simple accent line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(60, height - 40);
      ctx.lineTo(200, height - 40);
      ctx.stroke();
  }

  ctx.restore();
}

// 🖼️ Logo rendering
async function drawLogo(ctx: CanvasRenderingContext2D, logoUrl: string, template: string) {
  try {
    const logoPath = path.join(process.cwd(), 'public', logoUrl);
    if (!fs.existsSync(logoPath)) {
      console.warn(`Logo not found at ${logoPath}, skipping logo rendering`);
      return;
    }

    const logoImage = await loadImage(logoPath);
    const logoSize = template === 'product' ? 100 : 120;
    const logoX = template === 'blog' ? 50 : 40;
    const logoY = template === 'blog' ? 50 : 40;

    // Add subtle background circle for logo
    if (template !== 'product') {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = template === 'product' ? 0.8 : 1;
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    ctx.restore();

  } catch (error) {
    console.warn('Failed to load logo:', error);
  }
}

// 🏷️ Collection badge
function drawCollectionBadge(ctx: CanvasRenderingContext2D, width: number, collectionSlug: string, template: string) {
  const displayName = getCollectionDisplayName(collectionSlug);
  ctx.save();

  // Badge styling
  const badgeWidth = Math.min(ctx.measureText(displayName).width + 60, 300);
  const badgeHeight = 50;
  const badgeX = width - badgeWidth - 40;
  const badgeY = 50;

  // Badge background
  const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY + badgeHeight);
  if (template === 'product') {
    badgeGradient.addColorStop(0, '#1a1a1a');
    badgeGradient.addColorStop(1, '#374151');
  } else {
    badgeGradient.addColorStop(0, '#ffffff');
    badgeGradient.addColorStop(1, '#f3f4f6');
  }

  ctx.fillStyle = badgeGradient;
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

  // Badge text
  ctx.fillStyle = template === 'product' ? '#ffffff' : '#374151';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayName, badgeX + badgeWidth/2, badgeY + badgeHeight/2);

  ctx.restore();
}

// 🏷️ Category badge
function drawCategoryBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  category: string,
  categoryColor: string
) {
  ctx.save();

  const badgeWidth = Math.min(ctx.measureText(category.toUpperCase()).width + 40, 250);
  const badgeHeight = 45;
  const badgeX = 60;
  const badgeY = height - badgeHeight - 60;

  // Badge background
  ctx.fillStyle = categoryColor;
  ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

  // Badge text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(category.toUpperCase(), badgeX + badgeWidth/2, badgeY + badgeHeight/2);

  ctx.restore();
}

// 📝 Dynamic title rendering
function drawTitle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, template: string) {
  const maxWidth = width - 320; // Leave space for logo and badges
  const baseFontSize = 64;
  const minFontSize = 32;

  // Calculate optimal font size
  const fontSize = calculateOptimalFontSize(ctx, title, baseFontSize, minFontSize, maxWidth);

  ctx.save();
  ctx.fillStyle = template === 'product' ? '#1a1a1a' : '#ffffff';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Position based on template
  const titleX = template === 'blog' ? 220 : 200;
  const titleY = template === 'blog' ? 120 : 100;

  // Text wrapping for long titles
  wrapText(ctx, title, titleX, titleY, maxWidth, fontSize * 1.2);

  ctx.restore();
}

// 📄 Excerpt text
function drawExcerpt(ctx: CanvasRenderingContext2D, width: number, height: number, excerpt: string, template: string) {
  const maxWidth = width - 320;
  const maxLines = 3;
  const lineHeight = 42;

  ctx.save();
  ctx.fillStyle = template === 'product' ? '#4a5568' : '#e5e7eb';
  ctx.font = '400 32px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const excerptX = template === 'blog' ? 220 : 200;
  const excerptY = template === 'blog' ? 320 : 300;

  wrapText(ctx, excerpt, excerptX, excerptY, maxWidth, lineHeight, maxLines);

  ctx.restore();
}

// 🔤 Font size calculation
function calculateOptimalFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxSize: number,
  minSize: number,
  maxWidth: number
): number {
  let fontSize = maxSize;
  ctx.font = `bold ${fontSize}px Arial`;

  while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px Arial`;
  }

  return fontSize;
}

// 📝 Text wrapping utility
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines?: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      linesCount++;

      if (maxLines && linesCount >= maxLines) {
        if (i < words.length - 1) {
          ctx.fillText(line.trim() + '...', x, currentY);
        }
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (line !== '' && (!maxLines || linesCount < maxLines)) {
    ctx.fillText(line.trim(), x, currentY);
  }
}

// 🎨 Color adjustment utility
function adjustColor(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;

  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : g < 0 ? 0 : b;

  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
}

// 📋 Collection display names
function getCollectionDisplayName(slug: string): string {
  const names: Record<string, string> = {
    'blog-posts': 'Blog',
    'pages': 'Page',
    'products': 'Product',
    'services': 'Service',
    'events': 'Event',
    'testimonials': 'Review',
    'customers': 'Customer',
    'appointments': 'Booking',
    'documentation': 'Docs',
    'business-documentation': 'Business',
  };

  return names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}
