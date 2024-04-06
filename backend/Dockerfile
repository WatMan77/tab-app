FROM oven/bun:latest

WORKDIR /backend

COPY . .

RUN bun install

EXPOSE 3000

CMD ["bun", "index.ts"]