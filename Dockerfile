# Multi-stage Dockerfile for TechDV LMS

# --- Phase 1: Build Frontend ---
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Phase 2: Build Backend & Final Image ---
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Create uploads and logs directories
RUN mkdir -p uploads logs

# Copy frontend built assets to be served by backend (if needed) or for static hosting
COPY --from=frontend-build /app/frontend/dist ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
