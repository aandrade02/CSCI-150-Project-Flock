# Node 22 LTS Alpine image for lightweight containerization
FROM node:22-alpine

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source files
COPY . .

# Expose Vite server port
EXPOSE 5173

# Start the web app bound to 0.0.0.0
CMD ["npm", "run", "dev"]
