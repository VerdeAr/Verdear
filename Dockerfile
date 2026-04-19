FROM oven/bun:alpine AS build
WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

RUN bunx prisma generate 

FROM oven/bun:alpine AS run
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/prisma ./prisma 
COPY start.sh .

RUN chmod +x start.sh

EXPOSE 3000
CMD ["./start.sh"]
