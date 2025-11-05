# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY src ./src
COPY .env.example ./

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

CMD ["npm", "start"]
