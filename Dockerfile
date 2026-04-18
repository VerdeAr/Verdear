FROM oven/bun:alpine AS build

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

FROM oven/bun:alpine AS run

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/src ./src

EXPOSE 3000

CMD ["bun", "run", "src/app.js"]
