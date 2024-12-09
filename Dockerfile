FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npx prisma generate

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]