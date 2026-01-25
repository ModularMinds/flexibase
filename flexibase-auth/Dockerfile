# Stage 1: Builder
FROM node:22-alpine3.20 AS builder
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

# Copy source and build
COPY tsconfig.json .
COPY src ./src/

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript to dist
RUN yarn build

# Stage 2: Runner
FROM node:22-alpine3.20 AS runner
WORKDIR /app

# Install production dependencies only
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built assets and prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/server.js"]
