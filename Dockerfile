# --- Stage 1: Build stage ---
    FROM node:22.12.0 AS build

    LABEL maintainer="Rahimullah Khadim Hussain rkhadim-hussain@myseneca.ca"
    LABEL description="Fragments Node.js Microservice"
    
    ENV PORT=8080
    ENV NPM_CONFIG_LOGLEVEL=warn
    ENV NPM_CONFIG_COLOR=false
    
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm ci
    
    # Copy all source code explicitly
    COPY ./src ./src
    COPY ./src/model ./src/model         
    COPY ./tests/.htpasswd ./tests/.htpasswd
    
    # --- Stage 2: Production image (smaller) ---
    FROM node:22.12.0-slim
    
    WORKDIR /app
    
    # Only copy what is needed to run the app
    COPY --from=build /app /app
    
    EXPOSE 8080
    
    CMD ["npm", "start"]
    