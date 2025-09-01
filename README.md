# ModernMen-Yolo Barbershop Project

## Overview
The `modernmen-yolo` project is a multi-tenant barbershop management system built with Next.js 14, Payload CMS, and MongoDB. It includes features like a customer portal, admin dashboard, booking chatbot, hair simulator, loyalty program, events, responsive image optimization, and advanced barber profiles with mini social media features.

## Advanced Barber Profiles
- **Location**: `/portal/barbers/[barberId]`
- **Features**:
  - Displays barber’s name, bio, photo, specialties, and services.
  - Portfolio gallery with responsive images (WebP, `srcset`) via `ImagePlugin`.
  - Client testimonials with comments and likes (stored in `Testimonials` collection).
  - Social sharing buttons for Facebook, Twitter, Instagram.
  - “Book Now” button integrated with `BookingChatbot`.
  - Follow functionality with email notifications.
- **Configuration**:
  - Managed via `Settings` collection (`/admin/payload/collections/settings`).
  - Enable/disable profiles, comments, likes, and sharing via `barberProfiles` group.
- **API Routes**:
  - `GET /api/barber-profiles/[barberId]`: Fetch profile data.
  - `POST /api/testimonials`: Create a testimonial.
  - `PATCH /api/testimonials/[id]`: Like or moderate testimonials.
- **Gotchas Addressed**:
  - Multi-tenant isolation with `X-Tenant-ID` header validation.
  - Performance optimized with caching and lazy loading.
  - Accessibility with ARIA labels and keyboard navigation.
  - Error handling for missing settings or invalid barber IDs.

## Setup

### Quick Start (Docker Recommended)
```bash
# Clone and start with Docker (includes PostgreSQL, Redis, pgAdmin)
git clone <repo-url>
cd modernmen-yolo
cp .env.example .env
docker-compose up
```

### Manual Setup
1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` (see `.env.example`).
4. Start PostgreSQL and Redis services
5. Run database migrations: `npm run db:push`
6. Seed initial data: `npm run db:seed`
7. Run the development server: `npm run dev`
8. Access the admin panel: `http://localhost:3000/admin/payload`
9. Access the customer portal: `http://localhost:3000/portal`

## 🤖 AI-Powered Development

This project includes advanced AI-powered development tools and automation:

### AI Features
- **Automated Code Review**: AI analyzes pull requests for quality, security, and performance
- **Documentation Generation**: Automatically generates comprehensive API and component documentation
- **Security Auditing**: AI-powered security analysis and vulnerability detection
- **Performance Analysis**: Bundle size optimization and performance recommendations
- **Changelog Generation**: Automated changelog creation from commits

### AI Workflow Integration
- **GitHub Actions**: Fully integrated with CI/CD pipeline
- **OpenAI GPT-4**: Uses OpenAI for advanced AI analysis
- **Automated PR Comments**: AI provides feedback directly on pull requests
- **Security Monitoring**: Continuous security scanning and alerts

### Getting Started with AI Features
1. Configure OpenAI API key in GitHub secrets
2. Push changes to trigger automated code review
3. Use manual workflows for documentation and security audits
4. Review AI-generated insights in workflow logs and PR comments

### Development Tools
- **pgAdmin**: http://localhost:8080 (PostgreSQL admin interface)
- **Redis Commander**: http://localhost:8081 (Redis admin interface)
- **Storybook**: `npm run storybook` (Component development)
- **Bundle Analyzer**: `npm run bundle:analyze` (Performance analysis)

## Testing

This project implements a comprehensive testing strategy:

### Testing Pyramid
- **Unit Tests**: Individual functions and components (`npm run test:unit`)
- **Integration Tests**: API endpoints and database interactions (`npm run test:integration`)
- **E2E Tests**: Full user workflows with Playwright (`npm run test:e2e`)

### Running Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Code Coverage
- Target: 70% coverage across statements, branches, functions, and lines
- Reports generated automatically in CI/CD
- View coverage: `npm run test:coverage` then open `coverage/lcov-report/index.html`

For detailed testing information, see [TESTING.md](./TESTING.md).

## Environment Variables
```plaintext
# .env.example
DATABASE_URI=mongodb://localhost:27017/modernmen
PAYLOAD_SECRET=your-secret
OPENAI_API_KEY=sk-...
BUNNY_API_KEY=...
BUNNY_STORAGE_ZONE=modernmen
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/oauth/callback
SMTP_HOST=smtp.example.com
SMTP_USER=user
SMTP_PASS=pass
```

## Deployment
- Deploy to Vercel: `vercel --prod`
- Ensure MongoDB is configured with indexes for `Users`, `Testimonials`, and `Appointments`.
- Set up Bunny CDN for media storage.
- Configure Stripe webhooks and Google Calendar OAuth.
- **Important**: For production, ensure `NEXTAUTH_URL` in your `.env` is set to an `https` URL (e.g., `https://yourdomain.com`). This is crucial for security, as it enables the `secure` flag for authentication cookies.

## Testing
- Run unit tests: `npm run test`
- Test multi-tenant scenarios with different `tenantId` values.
- Verify responsive images and accessibility with Lighthouse.

## Contributing
- Add new features via Payload CMS collections or Next.js components.
- Ensure tenant isolation and settings integration in all changes.
- Submit pull requests with test coverage.