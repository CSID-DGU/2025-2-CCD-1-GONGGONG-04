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

# Generate Prisma Client
RUN pnpm prisma:generate

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

# Copy built application and node_modules from builder (includes Prisma Client)
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env.example ./.env.example
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules

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

# Start the application with ts-node
CMD ["npx", "ts-node", "src/index.js"]
