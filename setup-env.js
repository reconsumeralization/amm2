const fs = require('fs');
const path = require('path');

const envContent = `# Development Environment Variables
NODE_ENV=development

# Payload CMS Configuration
PAYLOAD_SECRET=your-super-secure-secret-key-for-development
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Database Configuration (SQLite for development)
DATABASE_URL=sqlite://./dev.db

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-for-development

# Email Service (Optional for development)
EMAIL_SERVER_HOST=smtp.mailtrap.io
EMAIL_SERVER_PORT=2525
EMAIL_SERVER_USER=your-mailtrap-user
EMAIL_SERVER_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@modernmen.local

# Analytics (Optional for development)
NEXT_PUBLIC_GA_ID=
VERCEL_ANALYTICS_ID=

# Performance Monitoring
SENTRY_DSN=
LOGTAIL_TOKEN=
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with development settings');
  console.log('📝 Please update the environment variables as needed');
} else {
  console.log('⚠️  .env.local already exists, skipping creation');
}

console.log('\n🚀 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
