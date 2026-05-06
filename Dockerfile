# Stage 1: Build the Vite application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy the source code
COPY . .

# Only set non-sensitive build arguments
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_APP_VERSION
ARG VITE_SENTRY_DSN

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/quiz-forge

# Change ownership of Nginx directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Expose the unprivileged port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]