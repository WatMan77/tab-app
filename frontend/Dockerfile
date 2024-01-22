FROM node:20.11

WORKDIR /frontend

COPY . .

RUN npm ci && npm run build

CMD ["npm", "run", "preview", "--", "--host"]