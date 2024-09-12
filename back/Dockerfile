# Use the official Golang image as the base image
FROM golang:latest as builder

# Set GIN_MODE to release
# ENV GIN_MODE=release

# Set the working directory inside the container
WORKDIR /app

# Copy the Go modules and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main main.go

COPY cred.json .

# Expose the port that the application will run on
EXPOSE 8383

# Command to run the application
CMD ["./main"]