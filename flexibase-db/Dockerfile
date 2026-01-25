# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies needed for build
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# Stage 2: Runtime
FROM node:22-alpine AS runner
WORKDIR /app

# Install runtime dependencies (openssl is required by Prisma on Alpine)
RUN apk add --no-cache openssl

# Set environment to production
ENV NODE_ENV=production

# Copy built artifacts and production dependencies
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Use a non-root user for security (Node.js alpine image comes with 'node' user)
USER node

EXPOSE ${FLEXIBASE_DB_EXPOSE_PORT}

CMD ["node", "dist/app.js"]
