# Quick Fix Summary - Free Domain Setup

## Problem
Login fails with Mixed Content Error because:
- Frontend uses HTTPS (GitHub Pages)
- Backend uses HTTP (EC2)
- Browsers block HTTP requests from HTTPS pages

## Solution
Set up a **free DuckDNS subdomain** with SSL certificate.

## Quick Steps (30 minutes total)

### 1. Get Free Domain (5 min)
1. Go to https://www.duckdns.org/
2. Sign in (GitHub/Google/Reddit)
3. Create subdomain (e.g., `schoolerp`)
4. Set IP to: `13.233.95.247`
5. Your domain: `schoolerp.duckdns.org`

### 2. Configure EC2 (10 min)
```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@13.233.95.247
cd /srv/school-erp

# Run automated setup
./scripts/setup-duckdns.sh
```

The script will:
- Update your `.env` file with the domain
- Verify configuration
- Set up SSL certificates
- Test the backend

### 3. Update GitHub (2 min)
1. Go to: https://github.com/av512406/erp/settings/variables/actions
2. Add variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://schoolerp.duckdns.org` (your domain)

### 4. Redeploy Frontend (5 min)
1. Go to: https://github.com/av512406/erp/actions
2. Click "Run workflow"
3. Wait for green checkmark

### 5. Test Login (1 min)
1. Visit: https://av512406.github.io/erp/
2. Try logging in
3. Should work! ✅

## Files Created

1. **SETUP_FREE_DOMAIN.md** - Detailed step-by-step guide
2. **scripts/setup-duckdns.sh** - Automated setup script

## What You Get

✅ Free subdomain (e.g., `schoolerp.duckdns.org`)
✅ Free SSL certificate (auto-renews)
✅ HTTPS on backend
✅ Login working without errors

## Alternative Options

If you prefer not to use DuckDNS:
- **No-IP**: https://www.noip.com/ (also free)
- **Buy domain**: ~$10-15/year (more professional)
- **AWS Route 53**: Integrated with AWS (costs money)

## Need Help?

Run the automated script on your EC2 instance:
```bash
./scripts/setup-duckdns.sh
```

It will guide you through each step!
