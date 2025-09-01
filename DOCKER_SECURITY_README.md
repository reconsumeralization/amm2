# Docker Security Enhancements for Modern Men Hair BarberShop

This document outlines the comprehensive security enhancements implemented for the Docker deployment of the Modern Men Hair BarberShop application.

## 🚀 Overview

The Docker setup has been enhanced with enterprise-grade security features including vulnerability scanning, monitoring, least privilege principles, and production-ready configurations.

## 🛡️ Security Features

### 1. **Container Security**
- **Non-root user execution**: All containers run as non-privileged users
- **Security profiles**: AppArmor and SELinux policies implemented
- **Minimal attack surface**: Only essential packages and dependencies included
- **Read-only root filesystem**: Prevents unauthorized modifications

### 2. **Vulnerability Management**
- **Automated scanning**: Trivy integration for container vulnerability scanning
- **Dependency auditing**: Security audits during build process
- **Regular updates**: Base images updated with latest security patches
- **Build-time security**: Security checks integrated into CI/CD pipeline

### 3. **Network Security**
- **Network isolation**: Services run in isolated networks
- **Firewall rules**: Nginx reverse proxy with security headers
- **Rate limiting**: Protection against DDoS and brute force attacks
- **SSL/TLS encryption**: HTTPS enforcement with secure cipher suites

### 4. **Monitoring & Logging**
- **Comprehensive monitoring**: Prometheus + Grafana stack
- **Log aggregation**: Loki for centralized logging
- **Real-time alerts**: Automated alerting for security incidents
- **Audit trails**: Complete audit logs for compliance

## 📁 Project Structure

```
├── docker-compose.yml              # Development environment
├── docker-compose.prod.yml         # Production environment
├── Dockerfile                      # Enhanced security Dockerfile
├── env.production.example         # Production environment template
├── nginx/
│   └── nginx.conf                 # Reverse proxy configuration
├── monitoring/
│   ├── prometheus.yml            # Monitoring configuration
│   ├── loki-config.yml          # Log aggregation config
│   └── promtail-config.yml      # Log shipping config
├── security/
│   ├── apparmor-profile          # AppArmor security profile
│   └── selinux-policy.te         # SELinux policy
├── scripts/docker/
│   ├── deploy.sh                 # Automated deployment script
│   ├── security-scan.sh          # Security scanning script
│   └── monitor.sh                # Monitoring script
└── redis.conf                     # Redis security configuration
```

## 🚀 Quick Start

### Development Setup
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down
```

### Production Deployment
```bash
# Copy environment template
cp env.production.example .env.production

# Edit environment variables
nano .env.production

# Run deployment script
bash scripts/docker/deploy.sh --environment production --push
```

## 🔧 Security Configuration

### Environment Variables
Configure the following security-related environment variables:

```bash
# Authentication
NEXTAUTH_SECRET=your-secure-random-secret
PAYLOAD_SECRET=your-secure-payload-secret

# Database
POSTGRES_USER=modernmen_user
POSTGRES_PASSWORD=your-secure-database-password

# Monitoring
GRAFANA_ADMIN_PASSWORD=your-secure-grafana-password

# Redis Admin (Development only)
REDIS_COMMANDER_USER=admin
REDIS_COMMANDER_PASSWORD=your-secure-redis-password
```

### Security Headers
The application includes comprehensive security headers:

```nginx
# Security headers in nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=63072000" always;
```

## 🔍 Security Scanning

### Automated Vulnerability Scanning
```bash
# Run security scan
bash scripts/docker/security-scan.sh --all

# Scan specific image
bash scripts/docker/security-scan.sh --image modernmen-hair-barbershop:latest

# Scan running container
bash scripts/docker/security-scan.sh --container modernmen-app-prod
```

### Trivy Integration
The deployment script automatically runs Trivy scans:

```bash
# Manual Trivy scan
trivy image --exit-code 1 --format json --output security/trivy-results.json modernmen-hair-barbershop:latest
```

## 📊 Monitoring & Alerting

### Monitoring Stack
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation
- **Promtail**: Log shipping from containers

### Accessing Monitoring
```bash
# Grafana (admin/password)
open http://localhost:3001

# Prometheus
open http://localhost:9090

# Application metrics
curl http://localhost:3000/api/metrics
```

### Monitoring Script
```bash
# Continuous monitoring
bash scripts/docker/monitor.sh --continuous

# Generate monitoring report
bash scripts/docker/monitor.sh --report

# Cleanup old logs
bash scripts/docker/monitor.sh --cleanup
```

## 🚀 Deployment Process

### Automated Deployment
```bash
# Full production deployment with security scanning
bash scripts/docker/deploy.sh --environment production --push

# Skip security scan (not recommended)
bash scripts/docker/deploy.sh --environment production --push --skip-scan

# Skip post-deployment tests
bash scripts/docker/deploy.sh --environment production --push --skip-tests
```

### Manual Deployment Steps
```bash
# 1. Build and scan
docker build --target production -t modernmen-hair-barbershop:latest .
bash scripts/docker/security-scan.sh --image modernmen-hair-barbershop:latest

# 2. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify
bash scripts/docker/monitor.sh --report
```

## 🔒 Security Best Practices

### Container Security
1. **Run as non-root**: All containers use non-privileged users
2. **Minimal base images**: Use Alpine Linux for smaller attack surface
3. **Security profiles**: AppArmor/SELinux policies applied
4. **Resource limits**: CPU and memory limits enforced
5. **Read-only filesystems**: Prevent unauthorized modifications

### Network Security
1. **Network segmentation**: Services isolated in separate networks
2. **Reverse proxy**: Nginx handles all external traffic
3. **Rate limiting**: Protection against abuse
4. **SSL/TLS**: Encrypted communications
5. **Firewall rules**: Restrictive network policies

### Monitoring & Compliance
1. **Comprehensive logging**: All activities logged and aggregated
2. **Real-time monitoring**: Metrics collected and visualized
3. **Automated alerts**: Security incidents trigger notifications
4. **Audit trails**: Complete audit logs for compliance
5. **Regular backups**: Automated backup procedures

## 🚨 Incident Response

### Security Incident Handling
```bash
# 1. Isolate affected services
docker-compose -f docker-compose.prod.yml stop app

# 2. Investigate logs
docker-compose -f docker-compose.prod.yml logs app

# 3. Check monitoring alerts
# Access Grafana dashboard for incident details

# 4. Rollback if necessary
bash scripts/docker/deploy.sh --rollback

# 5. Update and redeploy
bash scripts/docker/deploy.sh --environment production --push
```

### Emergency Contacts
- **Security Team**: security@modernmen.com
- **DevOps Team**: devops@modernmen.com
- **Monitoring Alerts**: alerts@modernmen.com

## 📋 Maintenance Tasks

### Regular Security Tasks
```bash
# Weekly tasks
bash scripts/docker/security-scan.sh --all
bash scripts/docker/monitor.sh --report

# Monthly tasks
docker system prune -a --volumes
docker image prune -f

# Update base images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Log Management
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# View all service logs
docker-compose -f docker-compose.prod.yml logs -f

# Export logs for analysis
docker-compose -f docker-compose.prod.yml logs > logs-$(date +%Y%m%d).txt
```

## 🔧 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs app

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Validate environment variables
docker-compose -f docker-compose.prod.yml config
```

#### Security Scan Failures
```bash
# Review scan results
cat security/trivy-results.json

# Update vulnerable packages in package.json
npm audit fix

# Rebuild and redeploy
bash scripts/docker/deploy.sh --environment production --push
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor with Grafana
open http://localhost:3001

# Scale services if needed
docker-compose -f docker-compose.prod.yml up -d --scale app=2
```

## 📚 Additional Resources

### Security Documentation
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Prometheus Monitoring](https://prometheus.io/docs/)

### Tools & Technologies
- **Trivy**: Container vulnerability scanner
- **Prometheus**: Monitoring and alerting
- **Grafana**: Visualization platform
- **Loki**: Log aggregation system
- **Nginx**: Reverse proxy and load balancer

## 🤝 Contributing

When contributing to the Docker security setup:

1. **Follow security best practices**
2. **Update security documentation**
3. **Test security enhancements**
4. **Run security scans before merging**
5. **Update monitoring configurations**

## 📞 Support

For security-related issues or questions:
- **Email**: security@modernmen.com
- **Documentation**: Check this README and related docs
- **Issues**: Create GitHub issues with "security" label

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Security Level**: Enterprise
