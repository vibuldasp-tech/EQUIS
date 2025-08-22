FROM node:20-alpine AS base
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages/schemas/package.json packages/schemas/package.json
COPY services/passport-api/package.json services/passport-api/package.json
RUN npm install --workspaces

# Build schemas
COPY packages/schemas packages/schemas
RUN npm run -w @dpp/schemas build

# Build passport-api
COPY services/passport-api services/passport-api
WORKDIR /app/services/passport-api
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/services/passport-api/dist ./dist
COPY --from=base /app/services/passport-api/prisma ./prisma
ENV PORT=8081
EXPOSE 8081
CMD ["node", "dist/index.js"]