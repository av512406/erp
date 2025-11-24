#!/bin/bash

# DuckDNS Setup Helper Script
# This script helps configure your backend to use a DuckDNS domain with SSL

set -e

echo "=========================================="
echo "DuckDNS Domain Setup Helper"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you configure your backend to use a DuckDNS domain with SSL.${NC}"
echo ""

# Step 1: Get DuckDNS domain
echo -e "${YELLOW}Step 1: DuckDNS Domain Setup${NC}"
echo "----------------------------------------"
echo "1. Go to: https://www.duckdns.org/"
echo "2. Sign in with GitHub, Google, or Reddit"
echo "3. Create a subdomain (e.g., 'schoolerp')"
echo "4. Set the IP to: 13.233.95.247"
echo "5. Copy your token (you'll need it later)"
echo ""

read -p "Have you created your DuckDNS domain? (y/n): " duckdns_ready
if [ "$duckdns_ready" != "y" ] && [ "$duckdns_ready" != "Y" ]; then
    echo -e "${RED}Please create your DuckDNS domain first, then run this script again.${NC}"
    exit 1
fi

# Step 2: Get domain name
echo ""
read -p "Enter your DuckDNS subdomain (e.g., schoolerp): " subdomain
if [ -z "$subdomain" ]; then
    echo -e "${RED}Error: Subdomain cannot be empty.${NC}"
    exit 1
fi

DOMAIN_NAME="${subdomain}.duckdns.org"
echo -e "${GREEN}Your domain will be: $DOMAIN_NAME${NC}"

# Step 3: Verify DNS
echo ""
echo -e "${YELLOW}Step 2: Verifying DNS...${NC}"
echo "----------------------------------------"
echo "Checking if $DOMAIN_NAME resolves to 13.233.95.247..."

# Try to resolve the domain
if command -v nslookup &> /dev/null; then
    IP=$(nslookup $DOMAIN_NAME 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    if [ "$IP" = "13.233.95.247" ]; then
        echo -e "${GREEN}✓ DNS is configured correctly!${NC}"
    else
        echo -e "${YELLOW}⚠ DNS not yet propagated. Current IP: $IP${NC}"
        echo "This is normal. DNS can take 1-5 minutes to propagate."
        read -p "Continue anyway? (y/n): " continue_anyway
        if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
            echo "Please wait a few minutes and run this script again."
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠ nslookup not available, skipping DNS check${NC}"
fi

# Step 4: Update .env file
echo ""
echo -e "${YELLOW}Step 3: Updating .env file...${NC}"
echo "----------------------------------------"

if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file first. You can copy from temp_prod_updated.env"
    exit 1
fi

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✓ Backed up .env file${NC}"

# Update DOMAIN_NAME in .env
if grep -q "^DOMAIN_NAME=" .env; then
    # Replace existing DOMAIN_NAME
    sed -i "s|^DOMAIN_NAME=.*|DOMAIN_NAME=$DOMAIN_NAME|" .env
    echo -e "${GREEN}✓ Updated DOMAIN_NAME in .env${NC}"
else
    # Add DOMAIN_NAME
    echo "" >> .env
    echo "# Domain Configuration" >> .env
    echo "DOMAIN_NAME=$DOMAIN_NAME" >> .env
    echo -e "${GREEN}✓ Added DOMAIN_NAME to .env${NC}"
fi

# Step 5: Verify .env
echo ""
echo -e "${YELLOW}Step 4: Verifying configuration...${NC}"
echo "----------------------------------------"

if [ -f scripts/verify-env.sh ]; then
    chmod +x scripts/verify-env.sh
    ./scripts/verify-env.sh
else
    echo -e "${YELLOW}⚠ verify-env.sh not found, skipping verification${NC}"
fi

# Step 6: SSL Setup
echo ""
echo -e "${YELLOW}Step 5: SSL Certificate Setup${NC}"
echo "----------------------------------------"
echo "Now we'll set up SSL certificates using Let's Encrypt."
echo ""
read -p "Proceed with SSL setup? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
    if [ -f scripts/init-ssl.sh ]; then
        chmod +x scripts/init-ssl.sh
        echo "Running SSL initialization..."
        ./scripts/init-ssl.sh
    else
        echo -e "${RED}Error: scripts/init-ssl.sh not found!${NC}"
        exit 1
    fi
else
    echo "Skipping SSL setup. You can run it later with: ./scripts/init-ssl.sh"
fi

# Step 7: Test backend
echo ""
echo -e "${YELLOW}Step 6: Testing backend...${NC}"
echo "----------------------------------------"

if command -v curl &> /dev/null; then
    echo "Testing health endpoint..."
    if curl -s -k "https://$DOMAIN_NAME/healthz" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is responding!${NC}"
        echo ""
        echo "Response:"
        curl -s -k "https://$DOMAIN_NAME/healthz" | jq . 2>/dev/null || curl -s -k "https://$DOMAIN_NAME/healthz"
    else
        echo -e "${YELLOW}⚠ Backend not responding yet${NC}"
        echo "This might be normal if SSL setup is still in progress."
    fi
else
    echo -e "${YELLOW}⚠ curl not available, skipping backend test${NC}"
fi

# Step 8: Next steps
echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Update GitHub Repository Variable:"
echo "   - Go to: https://github.com/av512406/erp/settings/variables/actions"
echo "   - Add/Update variable: VITE_API_BASE_URL"
echo "   - Value: https://$DOMAIN_NAME"
echo ""
echo "2. Rebuild and deploy frontend:"
echo "   - Go to: https://github.com/av512406/erp/actions"
echo "   - Click 'Run workflow' on your deployment workflow"
echo ""
echo "3. Test login:"
echo "   - Visit: https://av512406.github.io/erp/"
echo "   - Try logging in"
echo "   - Check browser console for errors"
echo ""
echo "Your backend URL: https://$DOMAIN_NAME"
echo ""
echo "=========================================="
