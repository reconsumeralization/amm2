#!/bin/bash

# Docker Deployment Script for Modern Men Hair BarberShop
# This script handles secure deployment with vulnerability scanning

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="modernmen-hair-barbershop"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}"
ENVIRONMENT="${ENVIRONMENT:-production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

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

    # Check if Docker is installed and running
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker is not installed"
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running"
        exit 1
    fi

    # Check if Docker Compose is available
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available"
        exit 1
    fi

    # Check if required environment file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        print_error "Environment file .env.${ENVIRONMENT} not found"
        print_status "Please copy env.production.example to .env.${ENVIRONMENT} and configure your variables"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Function to validate environment variables
validate_environment() {
    print_status "Validating environment variables..."

    # Required environment variables
    required_vars=(
        "NEXTAUTH_SECRET"
        "PAYLOAD_SECRET"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "GRAFANA_ADMIN_PASSWORD"
    )

    missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        exit 1
    fi

    print_success "Environment validation passed"
}

# Function to run security scan
run_security_scan() {
    print_status "Running security scan..."

    # Create security directory if it doesn't exist
    mkdir -p security

    # Run Trivy scan if available
    if command -v trivy >/dev/null 2>&1; then
        print_status "Running Trivy vulnerability scan..."

        # Scan the built image
        if trivy image \
            --exit-code 1 \
            --no-progress \
            --format json \
            --output security/trivy-results.json \
            "${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}"; then
            print_success "Trivy scan passed"
        else
            print_error "Trivy scan found vulnerabilities"
            print_status "Review security/trivy-results.json for details"
            exit 1
        fi
    else
        print_warning "Trivy not found. Install Trivy for better security scanning"
        print_status "Visit: https://aquasecurity.github.io/trivy/"
    fi

    # Run Docker Scout if available
    if docker scout --help >/dev/null 2>&1; then
        print_status "Running Docker Scout analysis..."

        if docker scout cves "${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}"; then
            print_success "Docker Scout analysis completed"
        else
            print_warning "Docker Scout found issues"
        fi
    fi

    print_success "Security scan completed"
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image..."

    # Build with security options
    DOCKER_BUILDKIT=1 docker build \
        --target production \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --tag "${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}" \
        --tag "${DOCKER_REGISTRY}/${PROJECT_NAME}:latest" \
        .

    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to push image to registry
push_image() {
    if [ "${PUSH_IMAGE}" = "true" ]; then
        print_status "Pushing image to registry..."

        docker push "${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}"
        docker push "${DOCKER_REGISTRY}/${PROJECT_NAME}:latest"

        print_success "Image pushed to registry"
    else
        print_status "Skipping image push (--push not specified)"
    fi
}

# Function to backup current deployment
backup_current_deployment() {
    print_status "Creating backup of current deployment..."

    # Create backup directory
    backup_dir="backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    # Export current docker-compose configuration
    if [ -f "${COMPOSE_FILE}" ]; then
        cp "${COMPOSE_FILE}" "$backup_dir/"
    fi

    # Export environment files
    if [ -f ".env.${ENVIRONMENT}" ]; then
        cp ".env.${ENVIRONMENT}" "$backup_dir/"
    fi

    # Export current container configurations
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$backup_dir/containers.txt"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" > "$backup_dir/images.txt"

    print_success "Backup created in: $backup_dir"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application..."

    # Load environment variables
    set -a
    source ".env.${ENVIRONMENT}"
    set +a

    # Validate environment after loading
    validate_environment

    # Pull latest images
    print_status "Pulling latest images..."
    docker-compose -f "${COMPOSE_FILE}" pull

    # Start services
    print_status "Starting services..."
    docker-compose -f "${COMPOSE_FILE}" up -d

    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 30

    # Check service health
    check_service_health

    print_success "Application deployed successfully"
}

# Function to check service health
check_service_health() {
    print_status "Checking service health..."

    # Check main application
    if curl -f --max-time 30 http://localhost:3000/api/health >/dev/null 2>&1; then
        print_success "Main application is healthy"
    else
        print_error "Main application health check failed"
        exit 1
    fi

    # Check database
    if docker-compose -f "${COMPOSE_FILE}" exec -T postgres pg_isready -U "${POSTGRES_USER}" -d modernmen_prod >/dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_warning "Database health check failed"
    fi

    # Check Redis
    if docker-compose -f "${COMPOSE_FILE}" exec -T redis redis-cli ping | grep -q PONG; then
        print_success "Redis is healthy"
    else
        print_warning "Redis health check failed"
    fi
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    print_status "Running post-deployment tests..."

    # Basic functionality tests
    if curl -f --max-time 10 http://localhost:3000 >/dev/null 2>&1; then
        print_success "Basic connectivity test passed"
    else
        print_error "Basic connectivity test failed"
        exit 1
    fi

    # API endpoint test
    if curl -f --max-time 10 http://localhost:3000/api/health >/dev/null 2>&1; then
        print_success "API health test passed"
    else
        print_error "API health test failed"
        exit 1
    fi

    print_success "Post-deployment tests completed"
}

# Function to cleanup old resources
cleanup_resources() {
    print_status "Cleaning up old resources..."

    # Remove dangling images
    docker image prune -f

    # Remove unused volumes (be careful with this in production)
    # docker volume prune -f

    # Remove stopped containers older than 24 hours
    docker container prune --filter "until=24h" -f

    print_success "Cleanup completed"
}

# Function to generate deployment report
generate_deployment_report() {
    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).txt"

    print_status "Generating deployment report: $report_file"

    {
        echo "Docker Deployment Report"
        echo "Generated on: $(date)"
        echo "Environment: $ENVIRONMENT"
        echo "Image Tag: $IMAGE_TAG"
        echo "========================================"
        echo ""

        echo "Deployment Summary:"
        echo "- Project: $PROJECT_NAME"
        echo "- Registry: $DOCKER_REGISTRY"
        echo "- Compose File: $COMPOSE_FILE"
        echo "- Image: ${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}"
        echo ""

        echo "Service Status:"
        docker-compose -f "${COMPOSE_FILE}" ps
        echo ""

        echo "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        echo ""

        echo "Security Scan Results:"
        if [ -f "security/trivy-results.json" ]; then
            echo "- Trivy scan completed"
        else
            echo "- Security scan not performed"
        fi
        echo ""

        echo "Next Steps:"
        echo "1. Monitor application logs: docker-compose -f ${COMPOSE_FILE} logs -f"
        echo "2. Check monitoring dashboard: http://localhost:3001"
        echo "3. Verify application functionality"
        echo "4. Update DNS/load balancer if needed"

    } > "$report_file"

    print_success "Deployment report generated: $report_file"
}

# Function to rollback deployment
rollback_deployment() {
    print_status "Rolling back deployment..."

    # Find the most recent backup
    latest_backup=$(find backups -name "docker-compose.prod.yml" -type f | sort | tail -1)

    if [ -n "$latest_backup" ]; then
        backup_dir=$(dirname "$latest_backup")
        print_status "Rolling back to: $backup_dir"

        # Stop current services
        docker-compose -f "${COMPOSE_FILE}" down

        # Restore from backup
        cp "$backup_dir/docker-compose.prod.yml" "${COMPOSE_FILE}"
        cp "$backup_dir/.env.${ENVIRONMENT}" ".env.${ENVIRONMENT}"

        # Restart services
        docker-compose -f "${COMPOSE_FILE}" up -d

        print_success "Rollback completed"
    else
        print_error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment function
main() {
    local skip_scan=false
    local skip_tests=false
    local push_image=false
    local rollback=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --environment)
                ENVIRONMENT="$2"
                COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
                shift 2
                ;;
            --skip-scan)
                skip_scan=true
                shift
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --push)
                push_image=true
                shift
                ;;
            --rollback)
                rollback=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --environment ENV    Set deployment environment (default: production)"
                echo "  --skip-scan         Skip security scanning"
                echo "  --skip-tests        Skip post-deployment tests"
                echo "  --push              Push image to registry"
                echo "  --rollback          Rollback to previous deployment"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    print_status "Starting Docker deployment for $PROJECT_NAME"
    print_status "Environment: $ENVIRONMENT"
    print_status "Compose File: $COMPOSE_FILE"

    # Handle rollback
    if [ "$rollback" = true ]; then
        rollback_deployment
        exit 0
    fi

    # Run deployment steps
    check_prerequisites

    if [ "$skip_scan" = false ]; then
        run_security_scan
    else
        print_warning "Skipping security scan"
    fi

    backup_current_deployment
    build_image

    if [ "$push_image" = true ]; then
        push_image
    fi

    deploy_application

    if [ "$skip_tests" = false ]; then
        run_post_deployment_tests
    else
        print_warning "Skipping post-deployment tests"
    fi

    cleanup_resources
    generate_deployment_report

    print_success "Docker deployment completed successfully!"
    print_status "Application is running at: http://localhost:3000"
    print_status "Monitoring dashboard: http://localhost:3001"
    print_status "Grafana: http://localhost:3001 (admin/${GRAFANA_ADMIN_PASSWORD})"
}

# Function to handle script interruption
cleanup() {
    print_warning "Deployment script interrupted"
    print_status "You may need to manually cleanup partial deployments"
    exit 1
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
