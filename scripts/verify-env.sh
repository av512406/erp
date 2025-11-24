#!/bin/bash

# School ERP - Environment Verification Script
# This script checks if all required environment variables are set

set -e

echo "=========================================="
echo "School ERP - Environment Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ ERROR: .env file not found!${NC}"
    echo "Please create a .env file in the project root."
    echo "You can copy from .env.example: cp .env.example .env"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"
echo ""

# Load .env file
export $(cat .env | grep -v '^#' | xargs)

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_required=$2
    
    if [ -z "$var_value" ]; then
        if [ "$is_required" = "required" ]; then
            echo -e "${RED}❌ MISSING (REQUIRED): $var_name${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠ OPTIONAL (not set): $var_name${NC}"
            return 0
        fi
    else
        # Mask sensitive values
        if [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"DATABASE_URL"* ]]; then
            echo -e "${GREEN}✓ $var_name: [HIDDEN]${NC}"
        else
            echo -e "${GREEN}✓ $var_name: $var_value${NC}"
        fi
        return 0
    fi
}

# Track if all required vars are set
all_required_set=true

echo "Checking required environment variables:"
echo "----------------------------------------"

check_var "DATABASE_URL" "required" || all_required_set=false
check_var "NODE_ENV" "required" || all_required_set=false
check_var "PORT" "required" || all_required_set=false
check_var "CORS_ORIGIN" "required" || all_required_set=false
check_var "DOMAIN_NAME" "required" || all_required_set=false
check_var "JWT_SECRET" "required" || all_required_set=false

echo ""
echo "Checking optional environment variables:"
echo "----------------------------------------"

check_var "FRONTEND_ORIGIN" "optional"
check_var "BACKEND_PUBLIC_URL" "optional"

echo ""
echo "=========================================="

if [ "$all_required_set" = false ]; then
    echo -e "${RED}❌ FAILED: Some required variables are missing!${NC}"
    echo ""
    echo "Please update your .env file with all required variables."
    echo "See .env.example for reference."
    exit 1
fi

echo -e "${GREEN}✓ SUCCESS: All required variables are set!${NC}"
echo ""

# Additional checks
echo "Additional Checks:"
echo "----------------------------------------"

# Check if CORS_ORIGIN uses HTTPS
if [[ "$CORS_ORIGIN" == https://* ]]; then
    echo -e "${GREEN}✓ CORS_ORIGIN uses HTTPS${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: CORS_ORIGIN should use HTTPS for GitHub Pages${NC}"
    echo "  Current value: $CORS_ORIGIN"
fi

# Check if DOMAIN_NAME is not the default
if [[ "$DOMAIN_NAME" == "your-domain.com" ]] || [[ "$DOMAIN_NAME" == "api.yourschool.com" ]]; then
    echo -e "${YELLOW}⚠ WARNING: DOMAIN_NAME appears to be a placeholder${NC}"
    echo "  Please update with your actual domain name"
else
    echo -e "${GREEN}✓ DOMAIN_NAME is customized${NC}"
fi

# Check if JWT_SECRET is strong enough
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠ WARNING: JWT_SECRET is too short (should be 32+ characters)${NC}"
    echo "  Generate a new one with: openssl rand -base64 32"
else
    echo -e "${GREEN}✓ JWT_SECRET is strong (${#JWT_SECRET} characters)${NC}"
fi

# Check if DATABASE_URL contains sslmode
if [[ "$DATABASE_URL" == *"sslmode=require"* ]]; then
    echo -e "${GREEN}✓ DATABASE_URL includes SSL mode${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: DATABASE_URL should include sslmode=require for Neon DB${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Environment verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure your domain DNS points to this server's IP"
echo "2. Run SSL initialization: ./scripts/init-ssl.sh"
echo "3. Start services: docker compose -f docker-compose.prod.yml up -d"
echo "=========================================="
