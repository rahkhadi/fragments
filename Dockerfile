# --- Stage 1: deps (install prod deps only) -------------------------------
    FROM node:22.12.0 AS deps

    LABEL maintainer="Rahimullah Khadim Hussain <rkhadim-hussain@myseneca.ca>"
    LABEL description="Fragments Node.js Microservice"
    
    WORKDIR /app
    
    # 1) Copy only package manifests to leverage Docker layer caching
    COPY package*.json ./
    
    # 2) Install production deps only (includes sharp now)
    #    This builds sharp's native binary in a full Node image.
    RUN npm ci --omit=dev
    
    # --- Stage 2: build (copy source) ----------------------------------------
    FROM node:22.12.0 AS build
    WORKDIR /app
    
    # Bring in node_modules from deps stage so we don't reinstall
    COPY --from=deps /app/node_modules ./node_modules
    COPY package*.json ./
    COPY ./src ./src
    # (Keep .htpasswd only if you really need it at runtime)
    COPY ./tests/.htpasswd /app/tests/.htpasswd
    
    # --- Stage 3: slim runtime ------------------------------------------------
    FROM node:22.12.0-slim
    
    ENV NODE_ENV=production
    ENV PORT=8080
    
    WORKDIR /app
    
    # Copy just what we need to run (small image, faster pulls)
    COPY --from=build /app/package*.json ./
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/src ./src
    COPY --from=build /app/tests/.htpasswd /app/tests/.htpasswd
    
    EXPOSE 8080
    CMD ["npm", "start"]
    