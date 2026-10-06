FROM oven/bun:alpine

WORKDIR /app

COPY common ./common
COPY frontend ./frontend

WORKDIR /app/frontend

# Vite inlines VITE_* into the bundle during `bun run build`, so it has to be present at build
# time. The root env files are deliberately not in the build context, so it arrives as a build
# argument from docker-compose.yml.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun install --trusted
RUN bun run build

CMD ["bun", "run", "preview", "--", "--host"]