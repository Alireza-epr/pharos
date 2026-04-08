# ---------- Base ----------
FROM node:20-alpine AS builder

# ---------- App root ----------
WORKDIR /app

# ---------- Copy root config ----------
COPY package.json package-lock.json ./

# ---------- Copy workspaces ----------
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# ---------- Install dependencies ----------
RUN npm install

# ---------- Build shared packages ----------
RUN npm run packages:build

# ---------- Build frontend ----------
WORKDIR /app/apps/frontend
RUN npm run build

# ---------- Serve frontend----------
FROM nginx:alpine

# ---------- Copy build output ----------
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# ---------- Expose default port ----------
EXPOSE 80

# ---------- Start nginx ----------
CMD ["nginx", "-g", "daemon off;"]
