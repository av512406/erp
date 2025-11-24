FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build shared library first
RUN npm run build --workspace=@erp/shared

# Build backend
RUN npm run build --workspace=@erp/backend



# Expose port
EXPOSE 3000

# Start backend
CMD ["npm", "start", "--workspace=@erp/backend"]
