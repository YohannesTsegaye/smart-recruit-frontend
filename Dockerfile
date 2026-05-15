FROM node:20-alpine AS build
WORKDIR /app
COPY . .
# Add --include=dev to ensure build tools are installed
RUN npm install --include=dev 
# Force the build to run even if there are warnings
RUN npm install date-fns
RUN npm run build
