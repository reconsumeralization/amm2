#!/bin/bash

# Docker Monitoring Script
# This script monitors Docker containers health, performance, and security

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONITOR_INTERVAL=30
LOG_FILE="./logs/docker-monitor-$(date +%Y%m%d).log"
ALERT_FILE="./logs/docker-alerts-$(date +%Y%m%d).log"

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

# Function to log messages
log_message() {
    local level=$1
    local message=$2
    echo "[$(date +%Y-%m-%d\ %H:%M:%S)] [$level] $message" >> "$LOG_FILE"
}

# Function to alert on critical issues
alert_critical() {
    local message=$1
    echo "[$(date +%Y-%m-%d\ %H:%M:%S)] [CRITICAL] $message" >> "$ALERT_FILE"
    print_error "CRITICAL: $message"
}

# Function to check container health
check_container_health() {
    print_status "Checking container health..."

    docker ps --filter "health=unhealthy" --format "{{.Names}}" | while read -r container; do
        if [ -n "$container" ]; then
            alert_critical "Container $container is unhealthy"
            log_message "ERROR" "Container $container is unhealthy"
        fi
    done

    docker ps --filter "status=exited" --format "{{.Names}}" | while read -r container; do
        if [ -n "$container" ]; then
            alert_critical "Container $container has exited"
            log_message "ERROR" "Container $container has exited"
        fi
    done
}

# Function to monitor resource usage
monitor_resources() {
    print_status "Monitoring resource usage..."

    # Get container stats
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | while read -r line; do
        if [[ $line != *"CONTAINER"* ]]; then
            local container=$(echo "$line" | awk '{print $1}')
            local cpu=$(echo "$line" | awk '{print $2}' | sed 's/%//')
            local mem=$(echo "$line" | awk '{print $3}')

            # Check CPU usage (alert if > 80%)
            if (( $(echo "$cpu > 80" | bc -l 2>/dev/null || echo "0") )); then
                print_warning "High CPU usage in $container: $cpu%"
                log_message "WARNING" "High CPU usage in $container: $cpu%"
            fi

            # Log resource usage
            log_message "INFO" "Container $container - CPU: $cpu%, Memory: $mem"
        fi
    done
}

# Function to check for security issues
check_security() {
    print_status "Checking security configuration..."

    # Check for containers running as root
    docker ps --format "{{.Names}}:{{.Image}}" | while IFS=':' read -r name image; do
        local user_info=$(docker exec "$name" whoami 2>/dev/null || echo "unknown")
        if [ "$user_info" = "root" ]; then
            alert_critical "Container $name is running as root user"
            log_message "SECURITY" "Container $name running as root"
        fi

        # Check for security options
        local security_opts=$(docker inspect "$name" --format '{{.HostConfig.SecurityOpt}}' 2>/dev/null || echo "unknown")
        if [ "$security_opts" = "[]" ] || [ "$security_opts" = "<no value>" ]; then
            print_warning "Container $name has no security options configured"
            log_message "SECURITY" "Container $name missing security options"
        fi
    done
}

# Function to monitor Docker events
monitor_events() {
    print_status "Monitoring Docker events..."

    # Get recent events (last 30 seconds)
    docker events --since "${MONITOR_INTERVAL}s" --until "0s" --format "{{.Time}}:{{.Type}}:{{.Action}}:{{.Actor.Attributes.name}}" 2>/dev/null | while read -r event; do
        if [ -n "$event" ]; then
            local timestamp=$(echo "$event" | cut -d: -f1)
            local type=$(echo "$event" | cut -d: -f2)
            local action=$(echo "$event" | cut -d: -f3)
            local name=$(echo "$event" | cut -d: -f4)

            case "$action" in
                "start")
                    print_success "Container $name started"
                    log_message "INFO" "Container $name started"
                    ;;
                "stop")
                    print_warning "Container $name stopped"
                    log_message "WARNING" "Container $name stopped"
                    ;;
                "die")
                    alert_critical "Container $name died"
                    log_message "ERROR" "Container $name died"
                    ;;
                "kill")
                    alert_critical "Container $name was killed"
                    log_message "ERROR" "Container $name was killed"
                    ;;
                "restart")
                    print_warning "Container $name restarted"
                    log_message "WARNING" "Container $name restarted"
                    ;;
            esac
        fi
    done
}

# Function to check Docker daemon health
check_daemon_health() {
    print_status "Checking Docker daemon health..."

    if ! docker info >/dev/null 2>&1; then
        alert_critical "Docker daemon is not responding"
        log_message "ERROR" "Docker daemon not responding"
        return 1
    fi

    # Check Docker daemon disk usage
    local disk_usage=$(docker system df --format "{{.Size}}" | tail -1)
    print_status "Docker disk usage: $disk_usage"
    log_message "INFO" "Docker disk usage: $disk_usage"
}

# Function to generate monitoring report
generate_report() {
    local report_file="./logs/monitoring-report-$(date +%Y%m%d-%H%M%S).txt"

    print_status "Generating monitoring report: $report_file"

    {
        echo "Docker Monitoring Report"
        echo "Generated on: $(date)"
        echo "========================================"
        echo ""

        echo "Running Containers:"
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

        echo ""
        echo "Container Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

        echo ""
        echo "Docker System Information:"
        docker system info --format "Containers: {{.Containers}}\nContainersRunning: {{.ContainersRunning}}\nContainersPaused: {{.ContainersPaused}}\nContainersStopped: {{.ContainersStopped}}"

        echo ""
        echo "Docker Disk Usage:"
        docker system df

        echo ""
        echo "Recent Docker Events:"
        docker events --since "1h" --format "{{.Time}}: {{.Type}} {{.Action}} {{.Actor.Attributes.name}}" | head -10

    } > "$report_file"

    print_success "Monitoring report generated: $report_file"
}

# Function to send alerts (placeholder for actual alerting)
send_alert() {
    local message=$1
    local level=$2

    # Here you could integrate with various alerting systems:
    # - Email alerts
    # - Slack notifications
    # - PagerDuty
    # - SMS alerts

    case "$level" in
        "CRITICAL")
            # Send critical alert
            print_error "CRITICAL ALERT: $message"
            ;;
        "WARNING")
            # Send warning alert
            print_warning "WARNING ALERT: $message"
            ;;
        "INFO")
            # Send info alert
            print_status "INFO ALERT: $message"
            ;;
    esac
}

# Function to cleanup old logs
cleanup_logs() {
    print_status "Cleaning up old log files..."

    # Remove log files older than 30 days
    find ./logs -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true
    find ./logs -name "*.txt" -type f -mtime +30 -delete 2>/dev/null || true

    print_success "Log cleanup completed"
}

# Main monitoring function
main() {
    local continuous=false
    local generate_report_only=false

    # Create log directory if it doesn't exist
    mkdir -p ./logs

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --continuous)
                continuous=true
                shift
                ;;
            --report)
                generate_report_only=true
                shift
                ;;
            --cleanup)
                cleanup_logs
                exit 0
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --continuous    Run continuous monitoring"
                echo "  --report       Generate monitoring report only"
                echo "  --cleanup      Clean up old log files"
                echo "  --help         Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    if [ "$generate_report_only" = true ]; then
        generate_report
        exit 0
    fi

    print_status "Starting Docker Monitoring"
    log_message "INFO" "Docker monitoring started"

    if [ "$continuous" = true ]; then
        print_status "Running in continuous monitoring mode (interval: ${MONITOR_INTERVAL}s)"

        while true; do
            check_daemon_health
            check_container_health
            monitor_resources
            check_security
            monitor_events

            sleep "$MONITOR_INTERVAL"
        done
    else
        # Single run mode
        check_daemon_health
        check_container_health
        monitor_resources
        check_security
        monitor_events
        generate_report

        print_success "Docker monitoring completed"
        log_message "INFO" "Docker monitoring completed"
    fi
}

# Function to handle script interruption
cleanup() {
    print_status "Monitoring script interrupted"
    log_message "INFO" "Monitoring script interrupted"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
