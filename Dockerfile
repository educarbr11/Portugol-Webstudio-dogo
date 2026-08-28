# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches
COPY packages/antlr/package.json ./packages/antlr/package.json
COPY packages/ide/package.json ./packages/ide/package.json
COPY packages/parser/package.json ./packages/parser/package.json
COPY packages/resources/package.json ./packages/resources/package.json
COPY packages/runner/package.json ./packages/runner/package.json
COPY packages/runtime/package.json ./packages/runtime/package.json
COPY packages/worker/package.json ./packages/worker/package.json

RUN npm ci

COPY . .

RUN npm run deploy:build

FROM nginx:1.28-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/ide/dist/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

