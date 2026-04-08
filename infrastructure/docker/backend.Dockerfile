# ---------- Base ----------
FROM node:20-alpine

# ---------- App root ----------
WORKDIR /app

# ---------- Copy root config ----------
COPY package.json package-lock.json ./

# ---------- Copy workspaces ----------
COPY packages ./packages
COPY apps/backend ./apps/backend

# ---------- Install dependencies ----------
RUN npm install

# ---------- Build shared packages ----------
RUN npm run packages:build

# ---------- Install curl ----------
RUN apk add --no-cache curl

# ---------- Build backend ----------
WORKDIR /app/apps/backend
RUN npm run build

# ---------- Back to root ----------
WORKDIR /app

# ---------- Expose default port ----------
EXPOSE 1370

# ---------- Start backend ----------
CMD ["npm", "--prefix", "apps/backend", "run", "start"]