import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function SEO({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  noIndex = false,
}: SEOProps) {
  const siteTitle = 'Modern Men Hair BarberShop';
  const siteDescription = 'Regina\'s premier men\'s grooming BarberShop. Expert barbers, modern styles, and premium grooming services.';
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://modernmen.ca';
  const defaultOgImage = `${siteUrl}/og-image.jpg`;

  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || siteDescription;
  const pageOgTitle = ogTitle || title || siteTitle;
  const pageOgDescription = ogDescription || description || siteDescription;
  const pageOgImage = ogImage || defaultOgImage;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={pageOgTitle} />
      <meta property="og:description" content={pageOgDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageOgTitle} />
      <meta name="twitter:description" content={pageOgDescription} />
      <meta name="twitter:image" content={pageOgImage} />

      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />

      {/* No index directive */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Head>
  );
}
