# Étape de build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY web/package.json web/
RUN npm ci -w web
COPY web/ web/
RUN npm run build -w web

# Étape de service
FROM nginx:alpine
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80