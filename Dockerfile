# --- Stage 1: Build stage ---
    FROM node:22.12.0 AS build

    LABEL maintainer="Rahimullah Khadim Hussain <rkhadim-hussain@myseneca.ca>"
    LABEL description="Fragments Node.js Microservice"
    
    ENV PORT=8080
    ENV NPM_CONFIG_LOGLEVEL=warn
    ENV NPM_CONFIG_COLOR=false
    
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm ci
    
    # Copy source code
    COPY ./src ./src
    COPY ./tests/.htpasswd /app/tests/.htpasswd
    
    # --- Stage 2: Slim runtime ---
    FROM node:22.12.0-slim
    
    WORKDIR /app
    
    COPY --from=build /app /app
    
    # Defensive copy of .htpasswd again
    COPY ./tests/.htpasswd /app/tests/.htpasswd
    
    EXPOSE 8080
    
    CMD ["npm", "start"]
    