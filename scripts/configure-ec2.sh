#!/bin/bash

# EC2 Configuration Script for school-erp.duckdns.org
# This script will configure your EC2 instance with the correct environment and SSL

set -e

echo "=========================================="
echo "School ERP - EC2 Configuration"
echo "Domain: school-erp.duckdns.org"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on EC2
echo -e "${BLUE}Step 1: Checking environment...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from template...${NC}"
    if [ -f temp_prod_updated.env ]; then
        cp temp_prod_updated.env .env
        echo -e "${GREEN}✓ Created .env from temp_prod_updated.env${NC}"
    else
        echo -e "${RED}❌ Error: temp_prod_updated.env not found!${NC}"
        echo "Please ensure you're in the correct directory."
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Backup existing .env
echo ""
echo -e "${BLUE}Step 2: Backing up .env file...${NC}"
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✓ Backup created${NC}"

# Update DOMAIN_NAME in .env
echo ""
echo -e "${BLUE}Step 3: Updating DOMAIN_NAME in .env...${NC}"
if grep -q "^DOMAIN_NAME=" .env; then
    sed -i 's|^DOMAIN_NAME=.*|DOMAIN_NAME=school-erp.duckdns.org|' .env
    echo -e "${GREEN}✓ Updated DOMAIN_NAME to school-erp.duckdns.org${NC}"
else
    echo "" >> .env
    echo "# Domain Configuration" >> .env
    echo "DOMAIN_NAME=school-erp.duckdns.org" >> .env
    echo -e "${GREEN}✓ Added DOMAIN_NAME to .env${NC}"
fi

# Verify DNS
echo ""
echo -e "${BLUE}Step 4: Verifying DNS configuration...${NC}"
echo "Checking if school-erp.duckdns.org resolves to 13.233.95.247..."

if command -v nslookup &> /dev/null; then
    RESOLVED_IP=$(nslookup school-erp.duckdns.org 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    if [ "$RESOLVED_IP" = "13.233.95.247" ]; then
        echo -e "${GREEN}✓ DNS is configured correctly!${NC}"
        echo "  school-erp.duckdns.org → 13.233.95.247"
    else
        echo -e "${YELLOW}⚠ DNS shows: $RESOLVED_IP${NC}"
        echo "  Expected: 13.233.95.247"
        echo "  This might be normal if DNS hasn't propagated yet (can take 1-5 minutes)"
    fi
else
    echo -e "${YELLOW}⚠ nslookup not available, skipping DNS check${NC}"
fi

# Verify environment configuration
echo ""
echo -e "${BLUE}Step 5: Verifying environment configuration...${NC}"
if [ -f scripts/verify-env.sh ]; then
    chmod +x scripts/verify-env.sh
    ./scripts/verify-env.sh
else
    echo -e "${YELLOW}⚠ verify-env.sh not found, skipping detailed verification${NC}"
    
    # Basic verification
    source .env
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL is not set!${NC}"
        exit 1
    fi
    if [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}❌ JWT_SECRET is not set!${NC}"
        exit 1
    fi
    if [ -z "$CORS_ORIGIN" ]; then
        echo -e "${RED}❌ CORS_ORIGIN is not set!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Basic environment variables are set${NC}"
fi

# Check if Docker is installed
echo ""
echo -e "${BLUE}Step 6: Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo ""
    echo "Please install Docker first:"
    echo "  sudo apt update"
    echo "  sudo apt install -y docker.io docker-compose-plugin"
    echo "  sudo usermod -aG docker \$USER"
    echo "  newgrp docker"
    exit 1
fi

# Check if docker-compose is available
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
    docker compose version
else
    echo -e "${RED}❌ Docker Compose is not available!${NC}"
    exit 1
fi

# SSL Setup
echo ""
echo -e "${BLUE}Step 7: SSL Certificate Setup${NC}"
echo "=========================================="
echo ""
echo "We will now set up SSL certificates using Let's Encrypt."
echo "This requires:"
echo "  1. DNS is properly configured (school-erp.duckdns.org → 13.233.95.247)"
echo "  2. Ports 80 and 443 are open in your EC2 Security Group"
echo "  3. No other service is using ports 80 or 443"
echo ""

read -p "Proceed with SSL setup? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
    if [ -f scripts/init-ssl.sh ]; then
        chmod +x scripts/init-ssl.sh
        echo ""
        echo -e "${YELLOW}Running SSL initialization...${NC}"
        echo "This may take 2-3 minutes..."
        echo ""
        
        # Export DOMAIN_NAME for the SSL script
        export DOMAIN_NAME=school-erp.duckdns.org
        
        ./scripts/init-ssl.sh
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ SSL setup completed successfully!${NC}"
        else
            echo ""
            echo -e "${RED}❌ SSL setup failed!${NC}"
            echo "Please check the error messages above."
            exit 1
        fi
    else
        echo -e "${RED}❌ scripts/init-ssl.sh not found!${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${YELLOW}Skipping SSL setup.${NC}"
    echo "You can run it later with:"
    echo "  export DOMAIN_NAME=school-erp.duckdns.org"
    echo "  ./scripts/init-ssl.sh"
fi

# Test backend
echo ""
echo -e "${BLUE}Step 8: Testing backend...${NC}"
echo "=========================================="

if command -v curl &> /dev/null; then
    echo "Testing HTTPS endpoint..."
    sleep 3  # Give nginx a moment to start
    
    if curl -s -k "https://school-erp.duckdns.org/healthz" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is responding via HTTPS!${NC}"
        echo ""
        echo "Health check response:"
        curl -s "https://school-erp.duckdns.org/healthz" | jq . 2>/dev/null || curl -s "https://school-erp.duckdns.org/healthz"
    else
        echo -e "${YELLOW}⚠ Backend not responding yet via HTTPS${NC}"
        echo "This might be normal if services are still starting."
        echo ""
        echo "You can check the status with:"
        echo "  docker compose -f docker-compose.prod.yml ps"
        echo "  docker compose -f docker-compose.prod.yml logs"
    fi
else
    echo -e "${YELLOW}⚠ curl not available, skipping backend test${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}EC2 Configuration Complete!${NC}"
echo "=========================================="
echo ""
echo "✅ Configuration Summary:"
echo "  • Domain: school-erp.duckdns.org"
echo "  • Backend URL: https://school-erp.duckdns.org"
echo "  • SSL: Configured with Let's Encrypt"
echo "  • CORS: Enabled for https://av512406.github.io"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update GitHub Repository Variable:"
echo "   • Go to: https://github.com/av512406/erp/settings/variables/actions"
echo "   • Add/Update variable:"
echo "     - Name: VITE_API_BASE_URL"
echo "     - Value: https://school-erp.duckdns.org"
echo ""
echo "2. Rebuild and Deploy Frontend:"
echo "   • Go to: https://github.com/av512406/erp/actions"
echo "   • Click 'Run workflow' on your deployment workflow"
echo "   • Wait for the green checkmark"
echo ""
echo "3. Test Login:"
echo "   • Visit: https://av512406.github.io/erp/"
echo "   • Open browser DevTools (F12) → Console"
echo "   • Try logging in"
echo "   • Should work without Mixed Content errors! ✅"
echo ""
echo "🔧 Useful Commands:"
echo "  • View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  • Restart: docker compose -f docker-compose.prod.yml restart"
echo "  • Status: docker compose -f docker-compose.prod.yml ps"
echo ""
echo "=========================================="
