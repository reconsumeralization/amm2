#!/bin/bash

# Docker Security Scanning Script
# This script performs comprehensive security scans on Docker images and containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or not accessible"
        exit 1
    fi
    print_success "Docker is running"
}

# Function to scan image with Trivy
scan_image_trivy() {
    local image_name=$1
    local output_file="./security/trivy-${image_name//\//-}.json"

    print_status "Scanning image: $image_name with Trivy"

    if command -v trivy >/dev/null 2>&1; then
        trivy image \
            --format json \
            --output "$output_file" \
            --exit-code 1 \
            --no-progress \
            --security-checks vuln \
            "$image_name"

        if [ $? -eq 0 ]; then
            print_success "Trivy scan completed successfully"
        else
            print_warning "Trivy scan found vulnerabilities"
        fi
    else
        print_warning "Trivy not found. Install Trivy for better vulnerability scanning"
        print_status "You can install Trivy from: https://aquasecurity.github.io/trivy/"
    fi
}

# Function to scan image with Docker Scout (if available)
scan_image_scout() {
    local image_name=$1

    print_status "Scanning image: $image_name with Docker Scout"

    if docker scout --help >/dev/null 2>&1; then
        docker scout cves "$image_name"

        if [ $? -eq 0 ]; then
            print_success "Docker Scout scan completed"
        else
            print_warning "Docker Scout scan found issues"
        fi
    else
        print_warning "Docker Scout not available"
    fi
}

# Function to check container security
check_container_security() {
    local container_name=$1

    print_status "Checking security configuration for container: $container_name"

    # Check if container is running as root
    local user_info=$(docker exec "$container_name" whoami 2>/dev/null || echo "unknown")
    if [ "$user_info" = "root" ]; then
        print_warning "Container is running as root user"
    else
        print_success "Container is running as non-root user: $user_info"
    fi

    # Check capabilities
    local capabilities=$(docker inspect "$container_name" --format '{{.HostConfig.CapAdd}}' 2>/dev/null || echo "unknown")
    if [ "$capabilities" != "[]" ] && [ "$capabilities" != "<no value>" ]; then
        print_warning "Container has additional capabilities: $capabilities"
    else
        print_success "Container has minimal capabilities"
    fi

    # Check security options
    local security_opts=$(docker inspect "$container_name" --format '{{.HostConfig.SecurityOpt}}' 2>/dev/null || echo "unknown")
    if [ "$security_opts" != "[]" ] && [ "$security_opts" != "<no value>" ]; then
        print_success "Container has security options: $security_opts"
    else
        print_warning "Container has no security options configured"
    fi
}

# Function to check Docker daemon security
check_docker_daemon() {
    print_status "Checking Docker daemon security configuration"

    # Check if Docker daemon is running with TLS
    if docker version --format '{{.Server.Version}}' >/dev/null 2>&1; then
        print_success "Docker daemon is accessible"
    fi

    # Check Docker daemon configuration
    if [ -f "/etc/docker/daemon.json" ]; then
        print_status "Docker daemon configuration found"
        if grep -q "tls" /etc/docker/daemon.json 2>/dev/null; then
            print_success "TLS is configured for Docker daemon"
        else
            print_warning "TLS is not configured for Docker daemon"
        fi
    else
        print_warning "Docker daemon configuration file not found"
    fi
}

# Function to generate security report
generate_report() {
    local report_file="./security/security-report-$(date +%Y%m%d-%H%M%S).txt"

    print_status "Generating security report: $report_file"

    {
        echo "Docker Security Scan Report"
        echo "Generated on: $(date)"
        echo "========================================"
        echo ""

        echo "Docker Images:"
        docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

        echo ""
        echo "Running Containers:"
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

        echo ""
        echo "Docker Networks:"
        docker network ls

        echo ""
        echo "Security Recommendations:"
        echo "1. Ensure all containers run as non-root users"
        echo "2. Use read-only root filesystems where possible"
        echo "3. Implement resource limits (CPU, memory)"
        echo "4. Use security profiles (AppArmor/SELinux)"
        echo "5. Regularly scan for vulnerabilities"
        echo "6. Keep base images updated"
        echo "7. Use multi-stage builds to reduce attack surface"
        echo "8. Implement proper secrets management"

    } > "$report_file"

    print_success "Security report generated: $report_file"
}

# Main function
main() {
    local image_name=""
    local container_name=""
    local scan_all=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --image)
                image_name="$2"
                shift 2
                ;;
            --container)
                container_name="$2"
                shift 2
                ;;
            --all)
                scan_all=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --image IMAGE     Scan specific Docker image"
                echo "  --container NAME  Check security of specific container"
                echo "  --all            Scan all running containers and images"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    print_status "Starting Docker Security Scan"
    check_docker

    if [ "$scan_all" = true ]; then
        # Scan all images
        print_status "Scanning all Docker images"
        docker images --format "{{.Repository}}:{{.Tag}}" | while read -r img; do
            if [ "$img" != "<none>:<none>" ]; then
                scan_image_trivy "$img"
                scan_image_scout "$img"
            fi
        done

        # Check all running containers
        print_status "Checking all running containers"
        docker ps --format "{{.Names}}" | while read -r container; do
            check_container_security "$container"
        done
    else
        # Scan specific image or container
        if [ -n "$image_name" ]; then
            scan_image_trivy "$image_name"
            scan_image_scout "$image_name"
        fi

        if [ -n "$container_name" ]; then
            check_container_security "$container_name"
        fi
    fi

    # Always check Docker daemon security
    check_docker_daemon

    # Generate security report
    generate_report

    print_success "Docker Security Scan completed"
}

# Run main function
main "$@"
