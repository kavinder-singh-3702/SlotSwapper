# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

CMD ["npm", "start"]
