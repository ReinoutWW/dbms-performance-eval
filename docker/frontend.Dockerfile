FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/frontend ./apps/frontend
COPY libs ./libs

# Run sync during build to avoid runtime issues
RUN npx nx sync

EXPOSE 5173

# Start development server
CMD ["npx", "nx", "serve", "frontend", "--host", "0.0.0.0"] 