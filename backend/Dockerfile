# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 4000

USER node

CMD ["npm", "start"]
