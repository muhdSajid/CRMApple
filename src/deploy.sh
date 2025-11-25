#!/bin/bash

##############################################################################
# React Inventory UI Deployment Script
# Deploy React app to Nginx
# Location: /home/it-admin/react/deploy.sh
# App Location: /home/it-admin/react/inventory-ui
##############################################################################

# Configuration
APP_NAME="inventory-ui"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}/inventory-ui"
BUILD_DIR="${APP_DIR}/dist"
WEB_ROOT="/var/www/${APP_NAME}"
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
SERVER_IP="27.34.245.92"
BACKEND_PORT="8081"  # Spring Boot backend port

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }

echo "========================================================================="
echo "  React Inventory UI Deployment"
echo "  Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================================="
echo ""

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    log_error "App directory not found: $APP_DIR"
    exit 1
fi

# Change to app directory
cd ${APP_DIR} || exit 1
log_success "Changed to app directory: ${APP_DIR}"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Not a valid Node.js project."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log_warning "node_modules not found. Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
else
    log_success "node_modules found"
fi
echo ""

# Build the React app
log_info "Building React application..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Build failed"
    exit 1
fi
log_success "Build completed successfully"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build directory not found: $BUILD_DIR"
    exit 1
fi

# Show build stats
log_info "Build Statistics:"
FILE_COUNT=$(find ${BUILD_DIR} -type f | wc -l)
DIR_SIZE=$(du -sh ${BUILD_DIR} 2>/dev/null | cut -f1)
echo "  Build directory: ${BUILD_DIR}"
echo "  Total files: ${FILE_COUNT}"
echo "  Total size: ${DIR_SIZE}"

# List main files
echo "  Main files:"
ls -lh ${BUILD_DIR}/index.html 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
ls -lh ${BUILD_DIR}/assets/*.js 2>/dev/null | head -3 | awk '{print "    " $9 " (" $5 ")"}'
ls -lh ${BUILD_DIR}/assets/*.css 2>/dev/null | head -3 | awk '{print "    " $9 " (" $5 ")"}'
echo ""

# Create web root directory
log_info "Creating web root directory: ${WEB_ROOT}"
sudo mkdir -p ${WEB_ROOT}

# Backup existing files (if any)
if [ -d "${WEB_ROOT}" ] && [ "$(sudo ls -A ${WEB_ROOT} 2>/dev/null)" ]; then
    log_warning "Existing deployment found, creating backup..."
    BACKUP_DIR="${WEB_ROOT}_backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r ${WEB_ROOT} ${BACKUP_DIR}
    log_success "Backup created: ${BACKUP_DIR}"
    echo ""
fi

# Copy build files
log_info "Deploying build files to ${WEB_ROOT}..."
sudo rm -rf ${WEB_ROOT}/*
sudo cp -r ${BUILD_DIR}/* ${WEB_ROOT}/

if [ $? -eq 0 ]; then
    log_success "Files deployed successfully"
else
    log_error "Failed to copy files"
    exit 1
fi
echo ""

# Set permissions
log_info "Setting permissions..."
sudo chown -R nginx:nginx ${WEB_ROOT}
sudo chmod -R 755 ${WEB_ROOT}
sudo find ${WEB_ROOT} -type f -exec chmod 644 {} \;
log_success "Permissions set"
echo ""

# Check SELinux
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    if [ "$SELINUX_STATUS" != "Disabled" ]; then
        log_info "SELinux is ${SELINUX_STATUS}, setting context..."
        sudo chcon -R -t httpd_sys_content_t ${WEB_ROOT}
        log_success "SELinux context set"
        echo ""
    fi
fi

# Create Nginx configuration
log_info "Creating Nginx configuration..."
sudo tee ${NGINX_CONF} > /dev/null <<NGINXCONF
# Inventory UI - React Frontend
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Deployed from: ${APP_DIR}

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_IP} localhost;

    root ${WEB_ROOT};
    index index.html;

    # Logging
    access_log /var/log/nginx/${APP_NAME}-access.log;
    error_log /var/log/nginx/${APP_NAME}-error.log warn;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types 
        text/plain 
        text/css 
        text/xml 
        text/javascript 
        application/x-javascript 
        application/javascript 
        application/xml+rss 
        application/json
        image/svg+xml;
    gzip_disable "MSIE [1-6]\.";

    # API proxy to Spring Boot backend
    # MUST COME BEFORE location / to take precedence
    location /api/ {
        # IMPORTANT: Remove trailing slash to avoid double /api/ paths
        # /api/v1/users -> http://localhost:8081/api/v1/users (NOT /api/api/v1/users)
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Original-URL \$scheme://\$http_host\$request_uri;
        proxy_set_header Authorization \$http_authorization;
        
        # WebSocket support (if needed)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Handle OPTIONS requests (CORS preflight)
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept' always;
            add_header 'Access-Control-Max-Age' '3600' always;
            add_header 'Content-Length' '0' always;
            return 204;
        }
        
        # CORS headers for all requests
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length, Content-Range' always;
    }

    # React Router - Handle client-side routing
    # This should come AFTER /api/ location block
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache control for HTML
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Static assets - Long cache
    location /assets/ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Cache JavaScript and CSS files
    location ~* \.(?:js|css)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Cache images and fonts
    location ~* \.(?:jpg|jpeg|gif|png|ico|svg|webp|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK - Inventory UI - $(date '+%Y-%m-%d %H:%M:%S')\n";
        add_header Content-Type text/plain;
    }

    # Nginx status (optional, for monitoring)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Disable server tokens
    server_tokens off;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINXCONF

if [ $? -eq 0 ]; then
    log_success "Nginx configuration created: ${NGINX_CONF}"
else
    log_error "Failed to create Nginx configuration"
    exit 1
fi
echo ""

# Disable default config (if exists)
if [ -f /etc/nginx/conf.d/default.conf ]; then
    log_info "Disabling default Nginx config..."
    sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled 2>/dev/null || true
    log_success "Default config disabled"
    echo ""
fi

# Test Nginx configuration
log_info "Testing Nginx configuration..."
if sudo nginx -t 2>&1 | tee /tmp/nginx-test.log; then
    log_success "Nginx configuration is valid"
else
    log_error "Nginx configuration test failed:"
    cat /tmp/nginx-test.log
    exit 1
fi
echo ""

# Reload Nginx
log_info "Reloading Nginx..."
if sudo systemctl reload nginx; then
    log_success "Nginx reloaded successfully"
else
    log_error "Failed to reload Nginx. Checking status..."
    sudo systemctl status nginx --no-pager -l
    exit 1
fi
echo ""

# Verify deployment
echo "========================================================================="
echo "  Verifying Deployment"
echo "========================================================================="
echo ""

# Check files
if [ -f "${WEB_ROOT}/index.html" ]; then
    INDEX_SIZE=$(sudo stat -c%s "${WEB_ROOT}/index.html")
    log_success "index.html found (${INDEX_SIZE} bytes)"
else
    log_error "index.html not found"
fi

if [ -d "${WEB_ROOT}/assets" ]; then
    ASSET_COUNT=$(sudo find ${WEB_ROOT}/assets -type f | wc -l)
    ASSET_SIZE=$(sudo du -sh ${WEB_ROOT}/assets 2>/dev/null | cut -f1)
    log_success "Assets directory found (${ASSET_COUNT} files, ${ASSET_SIZE})"
else
    log_warning "Assets directory not found"
fi

# Check permissions
OWNER=$(sudo stat -c '%U:%G' ${WEB_ROOT})
PERMS=$(sudo stat -c '%a' ${WEB_ROOT})
log_info "Directory owner: ${OWNER}, permissions: ${PERMS}"
echo ""

# Test HTTP response
log_info "Testing HTTP response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    log_success "HTTP response: ${HTTP_CODE} OK"
    
    # Get content type
    CONTENT_TYPE=$(curl -s -I http://localhost 2>&1 | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r\n')
    log_info "Content-Type: ${CONTENT_TYPE}"
    
    # Get content length
    CONTENT_LENGTH=$(curl -s -I http://localhost 2>&1 | grep -i "content-length" | cut -d' ' -f2- | tr -d '\r\n')
    log_info "Content-Length: ${CONTENT_LENGTH} bytes"
else
    log_warning "HTTP response: ${HTTP_CODE}"
fi
echo ""

# Test health endpoint
log_info "Testing health endpoint..."
HEALTH_CHECK=$(curl -s http://localhost/health 2>&1)
if [[ "$HEALTH_CHECK" == *"OK - Inventory UI"* ]]; then
    log_success "Health check passed: ${HEALTH_CHECK}"
else
    log_warning "Health check response: ${HEALTH_CHECK}"
fi
echo ""

# Test a sample asset
log_info "Testing asset file..."
SAMPLE_JS=$(sudo find ${WEB_ROOT}/assets -name "*.js" -type f | head -1)
if [ ! -z "$SAMPLE_JS" ]; then
    ASSET_NAME=$(basename $SAMPLE_JS)
    ASSET_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/assets/${ASSET_NAME} 2>&1)
    if [ "$ASSET_HTTP" = "200" ]; then
        log_success "Asset test passed: /assets/${ASSET_NAME} (${ASSET_HTTP})"
    else
        log_warning "Asset test: /assets/${ASSET_NAME} returned ${ASSET_HTTP}"
    fi
fi
echo ""

# Test API connectivity to backend
log_info "Testing backend API connectivity..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT}/api/v1/locations 2>&1)
if [ "$BACKEND_RESPONSE" = "200" ] || [ "$BACKEND_RESPONSE" = "401" ] || [ "$BACKEND_RESPONSE" = "403" ]; then
    log_success "Backend API is reachable (HTTP ${BACKEND_RESPONSE})"
elif [ "$BACKEND_RESPONSE" = "000" ]; then
    log_error "Cannot reach backend on port ${BACKEND_PORT}"
    log_error "Ensure Spring Boot backend is running!"
    log_info "To check: sudo netstat -tlnp | grep ${BACKEND_PORT}"
else
    log_warning "Backend returned unexpected status: HTTP ${BACKEND_RESPONSE}"
fi

# Test API proxy through Nginx
log_info "Testing API proxy through Nginx..."
PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/locations 2>&1)
if [ "$PROXY_RESPONSE" = "200" ] || [ "$PROXY_RESPONSE" = "401" ] || [ "$PROXY_RESPONSE" = "403" ]; then
    log_success "API proxy working correctly (HTTP ${PROXY_RESPONSE})"
else
    log_error "API proxy not working (HTTP ${PROXY_RESPONSE})"
    log_warning "Check Nginx error log: sudo tail -f /var/log/nginx/${APP_NAME}-error.log"
fi

echo ""
if [ -f /var/log/nginx/${APP_NAME}-access.log ]; then
    LOG_COUNT=$(sudo wc -l < /var/log/nginx/${APP_NAME}-access.log)
    log_info "Access log has ${LOG_COUNT} entries"
fi

if [ -f /var/log/nginx/${APP_NAME}-error.log ] && [ -s /var/log/nginx/${APP_NAME}-error.log ]; then
    ERROR_COUNT=$(sudo wc -l < /var/log/nginx/${APP_NAME}-error.log)
    log_warning "Error log has ${ERROR_COUNT} entries"
    echo "  Recent errors:"
    sudo tail -n 5 /var/log/nginx/${APP_NAME}-error.log | sed 's/^/    /'
fi

echo ""
echo "========================================================================="
echo "  Deployment Summary"
echo "========================================================================="
echo ""
echo "Application: Inventory Management UI"
echo "Deployment ID: $(date '+%Y%m%d-%H%M%S')"
echo ""
echo "Paths:"
echo "  Source: ${APP_DIR}"
echo "  Build: ${BUILD_DIR}"
echo "  Web Root: ${WEB_ROOT}"
echo "  Nginx Config: ${NGINX_CONF}"
echo "  Deploy Script: ${SCRIPT_DIR}/deploy.sh"
echo ""
echo "Server:"
echo "  IP: ${SERVER_IP}"
echo "  Backend API: http://localhost:${BACKEND_PORT}/api/"
echo ""
echo "Access URLs:"
echo "  Local: http://localhost"
echo "  Server: http://${SERVER_IP} (once NAT is configured)"
echo "  Health: http://localhost/health"
echo ""
echo "Logs:"
echo "  Access: sudo tail -f /var/log/nginx/${APP_NAME}-access.log"
echo "  Error: sudo tail -f /var/log/nginx/${APP_NAME}-error.log"
echo ""
echo "Quick Commands:"
echo "  Deploy: ~/react/deploy.sh"
echo "  Test: curl http://localhost"
echo "  Logs: sudo tail -f /var/log/nginx/${APP_NAME}-access.log"
echo "  Rebuild: cd ~/react/inventory-ui && npm run build"
echo "  Nginx reload: sudo systemctl reload nginx"
echo "  Nginx status: sudo systemctl status nginx"
echo ""
echo "========================================================================="
log_success "Deployment completed successfully!"
echo "========================================================================="
# Make executable
chmod +x /home/it-admin/react/deploy.sh

echo "Deployment script created: /home/it-admin/react/deploy.sh"