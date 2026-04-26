# ── Stage: Serve static files with Nginx ──────────────────
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy app files
COPY index.html  /usr/share/nginx/html/
COPY style.css   /usr/share/nginx/html/
COPY app.js      /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx.conf  /etc/nginx/conf.d/default.conf

# Cloud Run listens on PORT env var (default 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
