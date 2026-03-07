FROM oven/bun:alpine AS build

WORKDIR /app

#COPY package.json ./
COPY common ./common
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 3000
RUN bun install

CMD ["bun", "index.ts"]