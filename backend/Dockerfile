# Build stage
FROM golang:1.21-alpine AS builder

# Install protoc and dependencies
RUN apk add --no-cache git protobuf-dev

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Install protoc-gen-go
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Copy proto files and generate
COPY ../proto /app/proto
RUN mkdir -p pkg/pb
RUN protoc --go_out=./pkg/pb --go_opt=paths=source_relative \
    --go-grpc_out=./pkg/pb --go-grpc_opt=paths=source_relative \
    proto/portfolio.proto

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/server .

# Expose gRPC port
EXPOSE 50051

CMD ["./server"]