FROM oven/bun:alpine AS build

WORKDIR /backend

COPY . .

RUN bun install && bun build ./index.ts --compile --outfile piikkiApp

FROM oven/bun:alpine AS prod
WORKDIR /backend
COPY --from=build /backend/piikkiApp /backend/piikkiApp
COPY --from=build /backend/.env.production /backend/.env.production

EXPOSE 3000

CMD ["./piikkiApp"]