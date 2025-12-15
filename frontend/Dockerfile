# Build stage
FROM node:18-alpine AS builder

# Install protoc for proto generation
RUN apk add --no-cache protobuf-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy proto files and source
COPY ../proto /app/proto
COPY public ./public
COPY src ./src

# Generate proto files (requires grpc-web protoc plugin)
RUN npm install -g grpc-tools
# Note: In production, you'd generate these beforehand
# RUN npm run proto

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config for React Router
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]