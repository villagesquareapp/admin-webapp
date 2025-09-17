# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

# set working directory
WORKDIR /app

# ensure CA certs for fetching packages on alpine
RUN apk add --no-cache ca-certificates

# copy only lock + manifest for efficient layer caching
COPY package*.json ./

# Install all deps (dev + prod) for build using locked versions
RUN npm ci

# copy source
COPY . .

# build the Next.js app (produces .next)
RUN npm run build

# --- Stage 2: Runner (production) ---
FROM node:18-alpine AS runner

WORKDIR /app

# set production env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# install only production deps from lockfile
COPY package*.json ./
RUN npm ci --only=production

# copy built assets and public files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# copy any Next config files if present
COPY --from=builder /app/next.config.* ./

# If your app imports other top-level files (e.g. server.js), copy them:
COPY --from=builder /app/next.config.js ./next.config.js || true

# expose port
EXPOSE 3000

# start the app in production mode
CMD ["npm", "start"]

