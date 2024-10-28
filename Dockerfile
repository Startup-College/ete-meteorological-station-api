FROM node:20.12.0-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
COPY src ./src
RUN npm run build

FROM node:20.12.0-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN apk add --no-cache git  # Adicionar o Git no segundo estágio

# Remove temporariamente o script prepare
RUN npm pkg delete scripts.prepare
RUN npm install --omit=dev

EXPOSE 3333

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
