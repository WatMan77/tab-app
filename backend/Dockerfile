FROM node:20.11

WORKDIR /backend

COPY . .

RUN npm ci && npm run tsc

EXPOSE 3000

CMD ["node", "./dist/index.js"]