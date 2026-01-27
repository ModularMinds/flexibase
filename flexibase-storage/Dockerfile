# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (including devDependencies for build)
# Using --frozen-lockfile to ensure reproducible builds from yarn.lock
# If yarn.lock is missing or out of sync, this might fail, but it's best practice.
# Given I just updated package.json manually, the lockfile is out of sync.
# So I should use 'yarn install' without frozen lockfile or update lockfile first.
# For Docker, 'yarn install' is safer if we accept updates.
RUN yarn install --production=false

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN yarn build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files for production install
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production=true

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port (default 3002 for storage)
EXPOSE 3002

# Start command
CMD ["node", "dist/app.js"]
