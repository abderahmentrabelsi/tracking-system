# Use Node.js 14 as the base image
FROM node:20.9.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy all files from the current directory to the working directory inside the container
COPY . .

# Build your Vite React app
RUN npm run build

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the production server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
