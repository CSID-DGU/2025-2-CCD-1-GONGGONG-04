# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# Copy application files
COPY . .

# Generate Prisma Client (if needed in future)
# RUN pnpm prisma:generate

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install curl for healthcheck and pnpm
RUN apk add --no-cache curl && \
    npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --prod --frozen-lockfile; else pnpm install --prod; fi

# Copy built application from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env.example ./.env.example

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "src/index.js"]
