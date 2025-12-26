FROM oven/bun:alpine

WORKDIR /frontend

COPY . .

RUN bun install && bun run build

CMD ["bun", "run", "preview", "--", "--host"]