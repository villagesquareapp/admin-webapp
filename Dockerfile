# Use Node.js 20 Alpine as the base image for the builder stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies using npm ci
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use Node.js 20 Alpine as the base image for the runner stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV production

# Copy necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

# Expose port 3000
EXPOSE 3000

# Command to start the Next.js application
CMD ["npm", "start"]