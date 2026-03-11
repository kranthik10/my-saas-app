# Use Node.js 18 as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) for backend
COPY backend/package*.json ./backend/

# Change to backend directory and install dependencies
WORKDIR /app/backend
RUN npm install

# Go back to main directory and copy frontend package files
WORKDIR /app
COPY frontend/package*.json ./frontend/

# Change to frontend directory and install dependencies
WORKDIR /app/frontend
RUN npm install

# Go back to main directory and copy all other files
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Go back to backend directory to run the server
WORKDIR /app/backend

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]