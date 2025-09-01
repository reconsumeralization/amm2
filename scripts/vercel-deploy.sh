#!/bin/bash

# Vercel Deployment Script for Modern Men Hair BarberShop
# This script handles secure deployment to Vercel with proper environment setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="modernmen-hair-barbershop"
VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +%H:%M:%S)]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Vercel CLI is installed
    if ! command -v vercel >/dev/null 2>&1; then
        print_error "Vercel CLI is not installed"
        print_status "Install Vercel CLI: npm install -g vercel"
        exit 1
    fi

    # Check if logged in to Vercel
    if ! vercel whoami >/dev/null 2>&1; then
        print_error "Not logged in to Vercel"
        print_status "Login to Vercel: vercel login"
        exit 1
    fi

    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed"
        exit 1
    fi

    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Function to validate environment variables
validate_environment() {
    print_status "Validating environment variables..."

    local missing_vars=()

    # Required environment variables for deployment
    local required_vars=(
        "NEXTAUTH_SECRET"
        "PAYLOAD_SECRET"
        "DATABASE_URL"
    )

    # Check if variables are set (either in env or will be set in Vercel)
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            # Check if it's in .env.local
            if [ -f ".env.local" ] && grep -q "^${var}=" .env.local; then
                continue
            fi
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_warning "Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        print_status "Make sure to set these in your Vercel dashboard or .env.local"
    fi

    print_success "Environment validation completed"
}

# Function to prepare deployment
prepare_deployment() {
    print_status "Preparing deployment..."

    # Clean previous build artifacts
    if [ -d ".next" ]; then
        print_status "Cleaning previous build..."
        rm -rf .next
    fi

    if [ -d "node_modules/.cache" ]; then
        print_status "Cleaning cache..."
        rm -rf node_modules/.cache
    fi

    # Ensure package.json is ready
    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        exit 1
    fi

    # Ensure vercel.json is ready
    if [ ! -f "vercel.json" ]; then
        print_error "vercel.json not found"
        exit 1
    fi

    print_success "Deployment preparation completed"
}

# Function to run pre-deployment checks
run_pre_deployment_checks() {
    print_status "Running pre-deployment checks..."

    # Type checking
    print_status "Running TypeScript type check..."
    if npm run type-check; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed"
        exit 1
    fi

    # Linting
    print_status "Running ESLint..."
    if npm run lint; then
        print_success "ESLint check passed"
    else
        print_warning "ESLint check failed - continuing with deployment"
    fi

    # Build test
    print_status "Testing build process..."
    if npm run build; then
        print_success "Build test passed"
    else
        print_error "Build test failed"
        exit 1
    fi

    print_success "Pre-deployment checks completed"
}

# Function to setup Vercel project
setup_vercel_project() {
    print_status "Setting up Vercel project..."

    # Link project if not already linked
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking Vercel project..."

        if [ -n "$VERCEL_PROJECT_ID" ]; then
            vercel link --project "$PROJECT_NAME" --yes
        else
            vercel link --yes
        fi
    else
        print_success "Vercel project already linked"
    fi

    print_success "Vercel project setup completed"
}

# Function to configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."

    # Check if .env.local exists and has variables
    if [ -f ".env.local" ]; then
        print_status "Found .env.local file"

        # Read environment variables from .env.local and set them in Vercel
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z "$key" ]] && continue

            # Remove quotes from value if present
            value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")

            if [ -n "$key" ] && [ -n "$value" ]; then
                print_status "Setting environment variable: $key"
                vercel env add "$key" production
            fi
        done < .env.local

        print_success "Environment variables configured"
    else
        print_warning ".env.local not found"
        print_status "Make sure to set environment variables manually in Vercel dashboard"
    fi
}

# Function to deploy to Vercel
deploy_to_vercel() {
    local environment="${1:-production}"

    print_status "Deploying to Vercel ($environment)..."

    # Deploy based on environment
    case "$environment" in
        "production")
            print_status "Deploying to production..."
            vercel --prod
            ;;
        "preview")
            print_status "Deploying to preview..."
            vercel
            ;;
        "development")
            print_status "Deploying to development..."
            vercel --target development
            ;;
        *)
            print_error "Unknown environment: $environment"
            print_status "Valid environments: production, preview, development"
            exit 1
            ;;
    esac

    if [ $? -eq 0 ]; then
        print_success "Deployment to $environment completed successfully"
    else
        print_error "Deployment to $environment failed"
        exit 1
    fi
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    print_status "Running post-deployment tests..."

    # Get the deployment URL
    local deployment_url=$(vercel ls --format json | jq -r '.[0].url' 2>/dev/null || echo "")

    if [ -n "$deployment_url" ]; then
        print_status "Testing deployment at: https://$deployment_url"

        # Wait for deployment to be ready
        sleep 30

        # Test basic connectivity
        if curl -f --max-time 30 "https://$deployment_url" >/dev/null 2>&1; then
            print_success "Basic connectivity test passed"
        else
            print_warning "Basic connectivity test failed - deployment may still be initializing"
        fi

        # Test API health endpoint
        if curl -f --max-time 30 "https://$deployment_url/api/health" >/dev/null 2>&1; then
            print_success "API health test passed"
        else
            print_warning "API health test failed"
        fi
    else
        print_warning "Could not retrieve deployment URL"
    fi

    print_success "Post-deployment tests completed"
}

# Function to show deployment information
show_deployment_info() {
    print_status "Deployment Information:"
    echo ""

    # Show Vercel project info
    vercel ls

    echo ""
    print_status "Next Steps:"
    echo "1. Check your deployment at the URL shown above"
    echo "2. Verify all environment variables are set in Vercel dashboard"
    echo "3. Test critical functionality (login, payments, etc.)"
    echo "4. Monitor logs: vercel logs"
    echo "5. Set up domain if needed: vercel domains add yourdomain.com"
    echo ""
    print_status "Useful Vercel Commands:"
    echo "- vercel env ls              # List environment variables"
    echo "- vercel logs               # View deployment logs"
    echo "- vercel domains ls         # List domains"
    echo "- vercel certs ls          # List SSL certificates"
    echo "- vercel scale             # Scale your deployment"
}

# Function to cleanup
cleanup_deployment() {
    print_status "Cleaning up deployment artifacts..."

    # Remove build artifacts that aren't needed
    if [ -d ".next/cache" ]; then
        rm -rf .next/cache
    fi

    print_success "Cleanup completed"
}

# Main deployment function
main() {
    local environment="production"
    local skip_checks=false
    local skip_tests=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --environment)
                environment="$2"
                shift 2
                ;;
            --skip-checks)
                skip_checks=true
                shift
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --environment ENV    Set deployment environment (default: production)"
                echo "  --skip-checks        Skip pre-deployment checks"
                echo "  --skip-tests         Skip post-deployment tests"
                echo "  --help              Show this help message"
                echo ""
                echo "Environments:"
                echo "  production    Deploy to production"
                echo "  preview      Deploy to preview"
                echo "  development  Deploy to development"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    print_status "Starting Vercel deployment for $PROJECT_NAME"
    print_status "Environment: $environment"

    # Run deployment steps
    check_prerequisites
    validate_environment
    prepare_deployment

    if [ "$skip_checks" = false ]; then
        run_pre_deployment_checks
    else
        print_warning "Skipping pre-deployment checks"
    fi

    setup_vercel_project
    configure_environment
    deploy_to_vercel "$environment"

    if [ "$skip_tests" = false ]; then
        run_post_deployment_tests
    else
        print_warning "Skipping post-deployment tests"
    fi

    show_deployment_info
    cleanup_deployment

    print_success "Vercel deployment completed successfully!"
    print_status "Your application is now live!"
}

# Function to handle script interruption
cleanup() {
    print_warning "Deployment script interrupted"
    print_status "You may need to manually cleanup or redeploy"
    exit 1
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
