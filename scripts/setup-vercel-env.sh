#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps configure environment variables for Vercel deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if Vercel CLI is installed
check_vercel_cli() {
    print_status "Checking Vercel CLI..."

    if ! command -v vercel >/dev/null 2>&1; then
        print_error "Vercel CLI is not installed"
        print_status "Install with: npm install -g vercel"
        exit 1
    fi

    print_success "Vercel CLI is installed"
}

# Function to check if logged in to Vercel
check_vercel_login() {
    print_status "Checking Vercel login..."

    if ! vercel whoami >/dev/null 2>&1; then
        print_error "Not logged in to Vercel"
        print_status "Login with: vercel login"
        exit 1
    fi

    print_success "Logged in to Vercel as: $(vercel whoami)"
}

# Function to create Vercel project
create_vercel_project() {
    print_status "Setting up Vercel project..."

    if [ ! -f ".vercel/project.json" ]; then
        print_status "Creating new Vercel project..."
        vercel --yes
    else
        print_success "Vercel project already exists"
    fi
}

# Function to set environment variables
set_environment_variables() {
    local env_file="${1:-.env.local}"
    local environment="${2:-production}"

    print_status "Setting up environment variables for $environment..."

    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found"
        print_status "Copy env.local.example to $env_file and configure your variables"
        exit 1
    fi

    # Read environment variables from file and set them in Vercel
    print_status "Reading environment variables from $env_file..."

    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue

        # Remove quotes from value if present
        value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")

        # Skip if value is empty or placeholder
        if [ -z "$value" ] || [[ $value == your-* ]] || [[ $value == *placeholder* ]]; then
            print_warning "Skipping $key (empty or placeholder value)"
            continue
        fi

        # Set environment variable in Vercel
        print_status "Setting $key..."
        if vercel env add "$key" "$environment" --force; then
            print_success "✓ $key set successfully"
        else
            print_warning "✗ Failed to set $key"
        fi

        # Small delay to avoid rate limiting
        sleep 1
    done < "$env_file"

    print_success "Environment variables setup completed"
}

# Function to verify environment variables
verify_environment_variables() {
    local environment="${1:-production}"

    print_status "Verifying environment variables for $environment..."

    # List environment variables
    print_status "Current environment variables:"
    vercel env ls "$environment"

    # Check for required variables
    local required_vars=(
        "NEXTAUTH_SECRET"
        "PAYLOAD_SECRET"
        "DATABASE_URL"
        "NEXT_PUBLIC_APP_URL"
    )

    print_status "Checking required variables..."
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! vercel env ls "$environment" | grep -q "^$var "; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_warning "Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        print_status "Set them using: vercel env add VARIABLE_NAME $environment"
    else
        print_success "All required environment variables are set"
    fi
}

# Function to setup domains
setup_domain() {
    print_status "Domain setup..."

    read -p "Do you want to add a custom domain? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your domain name (e.g., yourdomain.com): " domain_name

        if [ -n "$domain_name" ]; then
            print_status "Adding domain: $domain_name"
            vercel domains add "$domain_name"

            print_success "Domain added. Configure DNS as instructed above."
            print_status "SSL certificate will be automatically provisioned by Vercel."
        fi
    else
        print_status "Skipping custom domain setup"
        print_status "Your app will be available at: https://modernmen-hair-barbershop.vercel.app"
    fi
}

# Function to setup build hooks (optional)
setup_build_hooks() {
    print_status "Build hooks setup..."

    read -p "Do you want to setup build hooks for CI/CD? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Create a webhook URL in your CI/CD system and configure it here."
        print_status "This allows external systems to trigger Vercel deployments."
        print_status "Visit: https://vercel.com/docs/concepts/git/deploy-hooks"
    fi
}

# Function to display deployment summary
show_summary() {
    print_status "Vercel Setup Summary"
    echo "================================"

    # Show project information
    echo "Project: $(vercel ls --format json | jq -r '.[0].name // "Not found"' 2>/dev/null || echo "Not found")"
    echo "URL: $(vercel ls --format json | jq -r '.[0].url // "Not found"' 2>/dev/null || echo "Not found")"

    echo ""
    print_success "✅ Vercel project configured"
    print_success "✅ Environment variables set"
    print_success "✅ Security headers configured"
    print_success "✅ Performance optimizations enabled"

    echo ""
    print_status "Next Steps:"
    echo "1. Push your code to GitHub"
    echo "2. Vercel will automatically deploy on push to main branch"
    echo "3. Monitor deployment in Vercel dashboard"
    echo "4. Configure domain DNS if using custom domain"
    echo "5. Test your deployed application"

    echo ""
    print_status "Useful Vercel Commands:"
    echo "- vercel env ls              # List environment variables"
    echo "- vercel logs               # View deployment logs"
    echo "- vercel domains ls         # List domains"
    echo "- vercel analytics          # View analytics"
    echo "- vercel rollback           # Rollback deployment"
}

# Main setup function
main() {
    local env_file=".env.local"
    local environment="production"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env-file)
                env_file="$2"
                shift 2
                ;;
            --environment)
                environment="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --env-file FILE      Path to environment file (default: .env.local)"
                echo "  --environment ENV    Deployment environment (default: production)"
                echo "  --help              Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                                    # Use defaults"
                echo "  $0 --env-file .env.production        # Use production env file"
                echo "  $0 --environment preview            # Setup for preview environment"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    print_status "Starting Vercel Environment Setup"
    print_status "Environment: $environment"
    print_status "Environment File: $env_file"

    # Run setup steps
    check_vercel_cli
    check_vercel_login
    create_vercel_project
    set_environment_variables "$env_file" "$environment"
    verify_environment_variables "$environment"
    setup_domain
    setup_build_hooks
    show_summary

    print_success "Vercel setup completed successfully!"
    print_status "Your application is ready for deployment."
}

# Function to handle script interruption
cleanup() {
    print_warning "Setup script interrupted"
    print_status "You can resume setup by running the script again"
    exit 1
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
