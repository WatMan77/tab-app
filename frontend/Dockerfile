FROM oven/bun:alpine

WORKDIR /app

COPY common ./common
COPY frontend ./frontend

WORKDIR /app/frontend

RUN bun install --trusted
RUN bun run build

CMD ["bun", "run", "preview", "--", "--host"]