
FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 5001

CMD ["node", "dist/main.js"]
