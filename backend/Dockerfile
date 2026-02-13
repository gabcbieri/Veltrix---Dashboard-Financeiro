FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
EXPOSE 3333

CMD ["sh", "-c", "npm run start:prod"]
