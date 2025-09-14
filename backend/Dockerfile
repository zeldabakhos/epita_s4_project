# production-ready image; for dev see the compose section below
FROM node:20-alpine

WORKDIR /app

# install only what's needed
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000
CMD ["node", "index.js"]
