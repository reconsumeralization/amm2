# Use latest Node.js Alpine LTS with security updates
FROM node:20-alpine

# Security: Add security labels and metadata
LABEL maintainer="Modern Men Hair BarberShop Team"
LABEL description="Modern Men Hair BarberShop - Production Container"
LABEL version="1.0.0"
LABEL security.scan="enabled"

# Security: Install security updates and required packages
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pango-dev \
    freetype-dev \
    fontconfig-dev \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Security: Create non-root user for running the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Security: Change ownership of working directory
RUN chown -R nextjs:nodejs /app

# Copy package files with proper ownership
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs pnpm-lock.yaml ./

# Switch to non-root user for dependency installation
USER nextjs

# Install pnpm globally with specific version for security
RUN npm install -g pnpm@9.12.4

# Install dependencies with security audit
RUN pnpm install --frozen-lockfile && \
    pnpm audit --audit-level moderate

# Copy source code with proper ownership
COPY --chown=nextjs:nodejs . .

# Build the application
RUN pnpm run build

# Security: Remove development dependencies and sensitive files
RUN rm -rf node_modules/.cache && \
    rm -rf .git && \
    rm -rf .env* && \
    rm -rf scripts/ && \
    rm -rf tests/ && \
    rm -rf docs/

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

# Security: Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Health check with security considerations
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f --max-time 10 http://localhost:3000/api/healthcheck || exit 1

# Start the application with proper user
CMD ["pnpm", "start"]