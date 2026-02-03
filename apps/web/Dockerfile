FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/auth/package.json ./packages/auth/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/paddleocr-vl-ts/package.json ./packages/paddleocr-vl-ts/
RUN bun install --ignore-scripts
COPY . .
WORKDIR /app/apps/web
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/apps/web/server.ts ./apps/web/server.ts
COPY --from=builder /app/packages ./packages
WORKDIR /app/apps/web
ENV PORT=3001
EXPOSE 3001
CMD ["bun", "run", "./server.ts"]
