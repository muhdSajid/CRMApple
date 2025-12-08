#!/bin/bash

# Deployment script for Inventory UI
# This script builds and deploys the React application to production server

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="it-admin"
SERVER_IP="27.34.245.92"
SERVER_STAGING_PATH="/home/it-admin/react/inventory-ui/dist"
SERVER_WEB_ROOT="/var/www/inventory-ui"
LOCAL_DIST_PATH="/Users/raneeshak/Documents/TCS/csr_project/inventory-ui-v2/dist"

echo -e "${BLUE}=== Starting Deployment Process ===${NC}\n"

# Step 1: Build the application
echo -e "${YELLOW}Step 1: Building React application...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed successfully${NC}\n"

# Step 2: Add server to known hosts
echo -e "${YELLOW}Step 2: Adding server to known hosts...${NC}"
ssh-keyscan -H $SERVER_IP >> ~/.ssh/known_hosts 2>&1 || true
echo -e "${GREEN}✓ Server added to known hosts${NC}\n"

# Step 3: Copy files to staging directory
echo -e "${YELLOW}Step 3: Copying files to server staging directory...${NC}"
scp -o ConnectTimeout=10 -r $LOCAL_DIST_PATH/* $SERVER_USER@$SERVER_IP:$SERVER_STAGING_PATH/
echo -e "${GREEN}✓ Files copied to staging directory${NC}\n"

# Step 4: Move files to web root and set permissions
echo -e "${YELLOW}Step 4: Moving files to web root and setting permissions...${NC}"
ssh -t $SERVER_USER@$SERVER_IP "sudo cp -r /home/it-admin/react/inventory-ui/dist/* /var/www/inventory-ui/ && sudo chown -R nginx:nginx /var/www/inventory-ui/ && echo '✓ Files moved and permissions set'"
echo -e "${GREEN}✓ Files deployed to web root${NC}\n"

# Step 5: Reload Nginx
echo -e "${YELLOW}Step 5: Reloading Nginx...${NC}"
ssh -t $SERVER_USER@$SERVER_IP "sudo systemctl reload nginx && echo '✓ Nginx reloaded successfully'"
echo -e "${GREEN}✓ Nginx reloaded${NC}\n"

# Step 6: Verification
echo -e "${YELLOW}Step 6: Verifying deployment...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    echo "=== DEPLOYMENT VERIFICATION ==="
    echo ""
    echo "1. React App Status:"
    curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost
    echo ""
    echo "2. API Proxy Status:"
    curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost/api/v1/locations
    echo ""
    echo "3. Files Check:"
    ls -lh /var/www/inventory-ui/ | grep -E "index.html|assets"
    echo ""
    echo "4. File Timestamps:"
    stat -c '%y %n' /var/www/inventory-ui/index.html
EOF
echo ""

echo -e "${GREEN}=== ✓ DEPLOYMENT COMPLETE ===${NC}"
echo -e "${BLUE}Application is now live at http://$SERVER_IP${NC}"
