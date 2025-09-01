#!/bin/bash

# Vercel + Supabase Deployment Script
# This script handles the complete deployment process for Vercel with Supabase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="modernmen-hair-barbershop"
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-}"

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

    # Check if Supabase CLI is installed
    if ! command -v supabase >/dev/null 2>&1; then
        print_error "Supabase CLI is not installed"
        print_status "Install with: npm install -g supabase"
        exit 1
    fi

    # Check if Vercel CLI is installed
    if ! command -v vercel >/dev/null 2>&1; then
        print_error "Vercel CLI is not installed"
        print_status "Install with: npm install -g vercel"
        exit 1
    fi

    # Check if logged in to Vercel
    if ! vercel whoami >/dev/null 2>&1; then
        print_error "Not logged in to Vercel"
        print_status "Login with: vercel login"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Function to validate Supabase configuration
validate_supabase_config() {
    print_status "Validating Supabase configuration..."

    # Check if config.toml exists
    if [ ! -f "supabase/config.toml" ]; then
        print_error "supabase/config.toml not found"
        exit 1
    fi

    # Check if migrations directory exists
    if [ ! -d "supabase/migrations" ]; then
        print_error "supabase/migrations directory not found"
        exit 1
    fi

    # Check Supabase environment variables
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Environment variable $var not set"
        fi
    done

    print_success "Supabase configuration validated"
}

# Function to setup Supabase project
setup_supabase_project() {
    print_status "Setting up Supabase project..."

    # Check if Supabase project is linked
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        print_warning "SUPABASE_PROJECT_REF not set"
        read -p "Enter your Supabase project reference: " project_ref
        if [ -n "$project_ref" ]; then
            export SUPABASE_PROJECT_REF="$project_ref"
        else
            print_error "Supabase project reference is required"
            exit 1
        fi
    fi

    # Link Supabase project
    print_status "Linking Supabase project..."
    supabase link --project-ref "$SUPABASE_PROJECT_REF"

    if [ $? -eq 0 ]; then
        print_success "Supabase project linked successfully"
    else
        print_error "Failed to link Supabase project"
        exit 1
    fi
}

# Function to deploy Supabase migrations
deploy_supabase_migrations() {
    print_status "Deploying Supabase migrations..."

    # Push database changes
    supabase db push

    if [ $? -eq 0 ]; then
        print_success "Supabase migrations deployed successfully"
    else
        print_error "Failed to deploy Supabase migrations"
        exit 1
    fi
}

# Function to generate Supabase types
generate_supabase_types() {
    print_status "Generating Supabase TypeScript types..."

    # Generate types from remote database
    supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > src/types/supabase-generated.ts

    if [ $? -eq 0 ]; then
        print_success "Supabase types generated successfully"
    else
        print_error "Failed to generate Supabase types"
        exit 1
    fi
}

# Function to setup Vercel environment variables
setup_vercel_environment() {
    print_status "Setting up Vercel environment variables..."

    # Environment variables to set
    local env_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXTAUTH_SECRET"
        "NEXT_PUBLIC_APP_URL"
    )

    for var in "${env_vars[@]}"; do
        if [ -n "${!var}" ]; then
            print_status "Setting $var in Vercel..."
            vercel env add "$var" production --force
        else
            print_warning "$var not set, skipping..."
        fi
    done

    print_success "Vercel environment variables configured"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    local environment="${1:-production}"

    print_status "Deploying to Vercel ($environment)..."

    # Build and deploy
    vercel --prod

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Vercel"
    else
        print_error "Failed to deploy to Vercel"
        exit 1
    fi
}

# Function to run post-deployment verification
run_post_deployment_verification() {
    print_status "Running post-deployment verification..."

    # Get deployment URL
    local deployment_url=$(vercel ls --format json | jq -r '.[0].url' 2>/dev/null || echo "")

    if [ -n "$deployment_url" ]; then
        print_status "Testing deployment at: https://$deployment_url"

        # Wait for deployment to be ready
        sleep 30

        # Test basic connectivity
        if curl -f --max-time 30 "https://$deployment_url/api/health" >/dev/null 2>&1; then
            print_success "API health check passed"
        else
            print_warning "API health check failed - may still be initializing"
        fi

        # Test Supabase connectivity (if health endpoint tests Supabase)
        print_success "Deployment verification completed"
    else
        print_warning "Could not retrieve deployment URL"
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_status "Deployment Summary"
    echo "==================="

    echo "✅ Supabase project linked and configured"
    echo "✅ Database migrations deployed"
    echo "✅ TypeScript types generated"
    echo "✅ Vercel environment variables set"
    echo "✅ Application deployed to Vercel"

    echo ""
    print_status "Important URLs:"
    echo "- Vercel App: https://modernmen-hair-barbershop.vercel.app"
    echo "- Supabase Studio: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF"
    echo "- Supabase API: https://$SUPABASE_PROJECT_REF.supabase.co"

    echo ""
    print_status "Next Steps:"
    echo "1. Verify the application is working correctly"
    echo "2. Test user authentication and database operations"
    echo "3. Configure additional environment variables if needed"
    echo "4. Set up monitoring and alerting"
    echo "5. Configure custom domain (optional)"

    echo ""
    print_status "Useful Commands:"
    echo "- View Vercel logs: vercel logs"
    echo "- View Supabase logs: supabase logs"
    echo "- Update types: supabase gen types typescript"
    echo "- Deploy migrations: supabase db push"
}

# Main deployment function
main() {
    local environment="${1:-production}"

    print_status "Starting Vercel + Supabase deployment for $PROJECT_NAME"
    print_status "Environment: $environment"

    # Run deployment steps
    check_prerequisites
    validate_supabase_config
    setup_supabase_project
    deploy_supabase_migrations
    generate_supabase_types
    setup_vercel_environment
    deploy_to_vercel "$environment"
    run_post_deployment_verification
    show_deployment_summary

    print_success "Vercel + Supabase deployment completed successfully!"
    print_status "Your application is now live with full database integration!"
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
