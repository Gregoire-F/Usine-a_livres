FROM node:22-alpine
WORKDIR /app

# 1. Les dépendances d'abord (cache Docker : réinstallées seulement si package*.json change)
COPY package.json package-lock.json ./
COPY api/package.json api/
RUN npm ci -w api

# 2. Puis le code
COPY api/ api/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx", "-w", "api", "tsx", "src/server.ts"]