FROM oven/bun:alpine

WORKDIR /frontend

COPY . .

RUN bun install && bun install lodash && bun run build

CMD ["bun", "run", "preview", "--", "--host"]