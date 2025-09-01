# GitHub Actions Workflows

This directory contains automated workflows for CI/CD, security, and AI-powered development tools.

## 🚀 Available Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)
Comprehensive CI/CD pipeline with testing, security scanning, and deployment.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- `test-and-build`: Unit tests, integration tests, linting, type checking
- `e2e-tests`: End-to-end testing with Playwright
- `deploy-staging`: Deploy to Vercel staging on develop branch
- `deploy-production`: Deploy to Vercel production on main branch
- `security-scan`: Vulnerability scanning with Trivy
- `bundle-analysis`: Bundle size analysis
- `ai-code-review`: AI-powered code review for pull requests

### 2. AI-Powered Development Tools (`ai-tools.yml`)
Specialized AI workflows for documentation, security, and performance analysis.

**Triggers:**
- Push to main/develop (documentation generation)
- Manual trigger via GitHub Actions UI
- Pull request events (selective)

**Available Tasks:**
- `documentation`: Generate API and component documentation
- `changelog`: Create release notes and changelogs
- `security-audit`: Comprehensive security analysis
- `performance`: Performance optimization recommendations

## 🔧 Setup Instructions

### 1. Vercel AI Configuration

#### Required Secrets
Add these secrets to your GitHub repository:

```bash
# Vercel AI API Key (get from Vercel dashboard)
VERCEL_AI_API_KEY=your_vercel_ai_api_key_here

# Vercel Deployment Token (for CLI deployments)
VERCEL_TOKEN=your_vercel_token_here

# Database URLs for different environments
STAGING_DATABASE_URL=your_staging_db_url
PRODUCTION_DATABASE_URL=your_production_db_url

# App URLs
STAGING_APP_URL=https://your-project-staging.vercel.app
PRODUCTION_APP_URL=https://your-project.vercel.app
```

#### How to Get Vercel AI API Key
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project settings
3. Go to "Integrations" → "AI"
4. Generate and copy your API key

#### How to Get Vercel Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Generate a new token with appropriate permissions
3. Copy the token value

### 2. Environment Variables

Ensure your Vercel project has these environment variables configured:

```bash
# Required for all environments
PAYLOAD_SECRET=your_payload_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
DATABASE_URL=your_database_url

# Optional but recommended
NEXT_PUBLIC_VERCEL_ENV=production
VERCEL_ENV=production
```

### 3. Vercel Project Configuration

#### Connect GitHub Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (leave default)

#### Environment Variables in Vercel
1. In your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add all required environment variables
4. Set appropriate environments (Production, Preview, Development)

## 🤖 AI-Powered Features

### Code Review
Automatically reviews pull requests and provides:
- Code quality assessment
- Security vulnerability checks
- Performance recommendations
- Testing coverage analysis
- Documentation update suggestions

### Documentation Generation
Generates comprehensive documentation including:
- API endpoint documentation
- Component documentation
- Database schema documentation
- Usage examples and best practices

### Security Auditing
Performs security analysis covering:
- Authentication vulnerabilities
- Authorization issues
- Input validation problems
- API security concerns
- Dependency vulnerabilities

### Performance Analysis
Provides optimization recommendations for:
- Bundle size reduction
- Code splitting improvements
- Database query optimization
- Caching strategy enhancements

## 📋 Manual Workflow Triggers

### Running AI Tasks Manually
1. Go to GitHub repository → Actions tab
2. Select "AI-Powered Development Tools" workflow
3. Click "Run workflow"
4. Choose the task you want to run:
   - `documentation`: Generate docs
   - `changelog`: Create changelog
   - `security-audit`: Run security analysis
   - `performance`: Analyze performance

### Running Security Scans
1. Go to Actions → Security Audit workflow
2. Click "Run workflow"
3. The workflow will scan for vulnerabilities and create security reports

## 🔍 Monitoring and Logs

### Viewing AI Analysis Results
1. Go to Actions tab in your repository
2. Click on the workflow run you want to examine
3. Check the logs for AI-generated analysis and recommendations

### Bundle Analysis Reports
- Available in pull request comments
- Detailed logs in Actions → Bundle Analysis workflow
- Bundle size reports and optimization suggestions

## 🚨 Troubleshooting

### Common Issues

#### Vercel AI Action Fails
- Check that `VERCEL_AI_API_KEY` secret is properly set
- Verify the API key has the correct permissions
- Ensure the Vercel project has AI features enabled

#### Deployment Fails
- Verify all required environment variables are set in Vercel
- Check that the build command is correct
- Ensure database connectivity is working

#### Workflow Permissions
- Make sure the repository has the required permissions for Actions
- Check that secrets are accessible to the workflows

### Getting Help
- Check Vercel AI documentation: https://vercel.com/docs/ai
- Review GitHub Actions documentation: https://docs.github.com/en/actions
- Check workflow logs for detailed error messages

## 📊 Workflow Status Badges

Add these badges to your README:

```markdown
![CI/CD](https://github.com/your-username/your-repo/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/your-username/your-repo/workflows/Security%20Audit/badge.svg)
![AI Tools](https://github.com/your-username/your-repo/workflows/AI-Powered%20Development%20Tools/badge.svg)
```

## 🔄 Workflow Updates

To update workflows:
1. Edit the YAML files in this directory
2. Test changes on a feature branch
3. Merge to main branch
4. Monitor the Actions tab for any issues

Remember to update this README when making changes to the workflows!
