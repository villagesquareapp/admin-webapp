# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install CA certificates for fetching packages
RUN apk add --no-cache ca-certificates

# Copy package.json and lockfile first for caching
COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm ci

# Copy full source code
COPY . .

# Build Next.js production app
RUN npm run build

# --- Stage 2: Runner (production) ---
FROM node:18-alpine AS runner

WORKDIR /app

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built Next.js app and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy Next.js config if exists
COPY --from=builder /app/next.config.* ./

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

