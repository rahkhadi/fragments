# Dockerfile for Fragments microservice

# Use a specific Node.js version that matches local dev environment
FROM node:22.12.0

# Metadata about the image
LABEL maintainer="Rahimullah Khadim Hussain rkhadim-hussain@myseneca.ca"
LABEL description="Fragments Node.js Microservice"

# Environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to use Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Expose the app port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
