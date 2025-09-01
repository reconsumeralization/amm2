#!/bin/bash

# Supabase Setup Script for Vercel Deployment
# This script sets up Supabase locally and prepares it for production deployment

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

# Function to check if Supabase CLI is installed
check_supabase_cli() {
    print_status "Checking Supabase CLI..."

    if ! command -v supabase >/dev/null 2>&1; then
        print_error "Supabase CLI is not installed"
        print_status "Install Supabase CLI: npm install -g supabase"
        print_status "Or visit: https://supabase.com/docs/guides/cli/getting-started"
        exit 1
    fi

    print_success "Supabase CLI is installed"
}

# Function to check if Supabase project exists
check_supabase_project() {
    print_status "Checking Supabase project..."

    if [ ! -f "supabase/config.toml" ]; then
        print_error "Supabase config not found"
        print_status "Make sure you're in the project root directory"
        exit 1
    fi

    print_success "Supabase project found"
}

# Function to start Supabase locally
start_supabase_local() {
    print_status "Starting Supabase locally..."

    if supabase status >/dev/null 2>&1; then
        print_warning "Supabase is already running"
        return 0
    fi

    supabase start

    if [ $? -eq 0 ]; then
        print_success "Supabase started successfully"
        print_status "Local Supabase URL: http://127.0.0.1:54321"
        print_status "Supabase Studio: http://127.0.0.1:54323"
        print_status "PostgreSQL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    else
        print_error "Failed to start Supabase"
        exit 1
    fi
}

# Function to stop Supabase locally
stop_supabase_local() {
    print_status "Stopping Supabase locally..."

    supabase stop

    if [ $? -eq 0 ]; then
        print_success "Supabase stopped successfully"
    else
        print_warning "Failed to stop Supabase or it was not running"
    fi
}

# Function to reset Supabase database
reset_supabase_db() {
    print_status "Resetting Supabase database..."

    supabase db reset

    if [ $? -eq 0 ]; then
        print_success "Supabase database reset successfully"
    else
        print_error "Failed to reset Supabase database"
        exit 1
    fi
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."

    # Check if migrations directory exists
    if [ ! -d "supabase/migrations" ]; then
        print_error "Migrations directory not found"
        exit 1
    fi

    # Run migrations
    supabase db push

    if [ $? -eq 0 ]; then
        print_success "Migrations applied successfully"
    else
        print_error "Failed to apply migrations"
        exit 1
    fi
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."

    # Check if seed file exists
    if [ -f "supabase/seed.sql" ]; then
        supabase db reset --linked
        print_success "Database seeded successfully"
    else
        print_warning "No seed.sql file found, skipping seeding"
    fi
}

# Function to generate types
generate_types() {
    print_status "Generating TypeScript types..."

    supabase gen types typescript --local > src/types/supabase-generated.ts

    if [ $? -eq 0 ]; then
        print_success "TypeScript types generated successfully"
        print_status "Types saved to: src/types/supabase-generated.ts"
    else
        print_error "Failed to generate TypeScript types"
        exit 1
    fi
}

# Function to link remote Supabase project
link_remote_project() {
    print_status "Linking remote Supabase project..."

    # Check if SUPABASE_PROJECT_REF is set
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        print_warning "SUPABASE_PROJECT_REF not set"
        read -p "Enter your Supabase project reference (e.g., abcdefghijklmnopqrst): " project_ref
        if [ -n "$project_ref" ]; then
            export SUPABASE_PROJECT_REF="$project_ref"
        else
            print_error "Project reference is required"
            exit 1
        fi
    fi

    supabase link --project-ref "$SUPABASE_PROJECT_REF"

    if [ $? -eq 0 ]; then
        print_success "Remote Supabase project linked successfully"
    else
        print_error "Failed to link remote Supabase project"
        exit 1
    fi
}

# Function to deploy to remote Supabase
deploy_to_remote() {
    print_status "Deploying to remote Supabase..."

    # Check if linked
    if ! supabase status --output json | jq -e '.services[] | select(.name == "database") | .status == "running"' >/dev/null 2>&1; then
        print_error "Not linked to a remote Supabase project"
        print_status "Run: supabase link --project-ref YOUR_PROJECT_REF"
        exit 1
    fi

    # Deploy migrations
    supabase db push

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to remote Supabase"
    else
        print_error "Failed to deploy to remote Supabase"
        exit 1
    fi
}

# Function to show status
show_status() {
    print_status "Supabase Status:"
    echo "=================="

    supabase status

    echo ""
    print_status "Useful URLs:"
    echo "- Local API: http://127.0.0.1:54321"
    echo "- Studio: http://127.0.0.1:54323"
    echo "- PostgreSQL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    echo "- Inbucket (Email): http://127.0.0.1:54324"
}

# Function to setup for production
setup_production() {
    print_status "Setting up Supabase for production..."

    # Check if environment variables are set
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_warning "Supabase environment variables not set"
        print_status "Make sure to set:"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        print_status "You can find these in your Supabase project dashboard"
    fi

    # Link remote project if not linked
    if ! supabase projects list | grep -q "$SUPABASE_PROJECT_REF"; then
        link_remote_project
    fi

    # Deploy migrations
    deploy_to_remote

    # Generate types from remote
    print_status "Generating types from remote database..."
    supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > src/types/supabase-generated.ts

    print_success "Production setup completed"
}

# Main function
main() {
    local command="$1"

    case "$command" in
        "start")
            check_supabase_cli
            check_supabase_project
            start_supabase_local
            show_status
            ;;
        "stop")
            check_supabase_cli
            stop_supabase_local
            ;;
        "reset")
            check_supabase_cli
            check_supabase_project
            stop_supabase_local
            start_supabase_local
            reset_supabase_db
            run_migrations
            seed_database
            generate_types
            show_status
            ;;
        "migrate")
            check_supabase_cli
            check_supabase_project
            run_migrations
            ;;
        "seed")
            check_supabase_cli
            check_supabase_project
            seed_database
            ;;
        "types")
            check_supabase_cli
            check_supabase_project
            generate_types
            ;;
        "link")
            check_supabase_cli
            link_remote_project
            ;;
        "deploy")
            check_supabase_cli
            deploy_to_remote
            ;;
        "production")
            check_supabase_cli
            setup_production
            ;;
        "status")
            check_supabase_cli
            show_status
            ;;
        *)
            echo "Usage: $0 {start|stop|reset|migrate|seed|types|link|deploy|production|status}"
            echo ""
            echo "Commands:"
            echo "  start      - Start Supabase locally"
            echo "  stop       - Stop Supabase locally"
            echo "  reset      - Reset database and run migrations/seeds"
            echo "  migrate    - Run database migrations"
            echo "  seed       - Seed the database"
            echo "  types      - Generate TypeScript types"
            echo "  link       - Link to remote Supabase project"
            echo "  deploy     - Deploy to remote Supabase"
            echo "  production - Setup for production deployment"
            echo "  status     - Show Supabase status"
            echo ""
            echo "Examples:"
            echo "  $0 start                    # Start local development"
            echo "  $0 reset                    # Reset everything"
            echo "  $0 production               # Setup for production"
            exit 1
            ;;
    esac
}

# Function to handle script interruption
cleanup() {
    print_warning "Script interrupted"
    print_status "You can restart Supabase with: $0 start"
    exit 1
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
