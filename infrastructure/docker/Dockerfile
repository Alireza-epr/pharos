# =====================================================================
# Shared multi-stage build for the PHAROS monorepo.
# `deps` and `packages` are built once and reused by both services.
# docker-compose selects the final image via `build.target`.
# =====================================================================

# ---------- deps: install all workspace deps once ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Manifests only — this layer is cached unless dependencies change
COPY package.json package-lock.json ./
COPY packages/enum/package.json    ./packages/enum/
COPY packages/types/package.json   ./packages/types/
COPY packages/utils/package.json   ./packages/utils/
COPY apps/backend/package.json     ./apps/backend/
COPY apps/frontend/package.json    ./apps/frontend/

RUN npm install

# ---------- packages: build shared packages once ----------
FROM deps AS packages
COPY packages ./packages
RUN npm run packages:build

# ---------- backend ----------
FROM packages AS backend
RUN apk add --no-cache curl
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build
# Commit SHA for export provenance — the image has no .git or git binary.
# Supplied by docker-compose as a build arg; defaults to N/A when not passed.
# Declared after the build so changing it doesn't invalidate the compile layer.
ARG GIT_COMMIT_SHA=N/A
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}
EXPOSE 1370
# Run node directly (not via npm) so it is PID 1 and receives SIGTERM
# for clean, fast shutdown. Equivalent to the package.json "start" script.
CMD ["node", "dist/src/core/server.js"]

# ---------- frontend-builder ----------
FROM packages AS frontend-builder
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN npm run build

# ---------- frontend (nginx serve) ----------
FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
