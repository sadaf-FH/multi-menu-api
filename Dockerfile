# Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]
