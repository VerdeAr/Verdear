FROM node:20-alpine AS build

COPY package*.json ./

RUN npm ci

COPY . .

FROM node:20-alpine AS run

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=build package*.json ./
COPY --from=build node_modules ./node_modules
COPY --from=build src ./src

EXPOSE 3000

CMD ["node", "src/app.js"]