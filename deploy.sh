#!/bin/bash

# Deployment script for Video Processing SaaS

echo "Starting deployment..."

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Deployment completed!"
echo "To start the application, run: npm start"