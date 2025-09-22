FROM node:20-bookworm

# Build deps for node-gyp / gpt4all
RUN apt-get update && apt-get install -y \
  python3 build-essential cmake pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first (better cache)
COPY package*.json ./
RUN npm ci || npm install

# Copy the rest of the backend
COPY ./models /app/models
COPY . .

EXPOSE 4000
CMD ["npm","run","dev"]
