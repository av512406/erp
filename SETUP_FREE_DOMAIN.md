# Setup Free Domain with SSL - Quick Fix Guide

This guide will help you set up a **free subdomain** with SSL to fix the Mixed Content Error.

## Why This is Needed

Your frontend (GitHub Pages) uses HTTPS, but your backend uses HTTP. Browsers block this for security. You need HTTPS on your backend too.

**Current**: `http://ec2-13-233-95-247.ap-south-1.compute.amazonaws.com` ❌  
**Needed**: `https://yourname.duckdns.org` ✅

## Step 1: Get a Free Subdomain (5 minutes)

### Using DuckDNS (Recommended - Free Forever)

1. **Go to**: https://www.duckdns.org/
2. **Sign in** with GitHub, Google, or Reddit
3. **Create a subdomain**:
   - Enter a name (e.g., `schoolerp`, `myschool`, etc.)
   - Your domain will be: `yourname.duckdns.org`
   - In the IP field, enter: `13.233.95.247` (your EC2 IP)
   - Click "Add domain"
4. **Copy your token** (you'll need this later)

**Example**: If you choose `schoolerp`, your domain will be `schoolerp.duckdns.org`

## Step 2: Update EC2 Configuration (10 minutes)

SSH into your EC2 instance:

```bash
ssh -i "your-key.pem" ubuntu@13.233.95.247
cd /srv/school-erp
```

### Update .env file:

```bash
nano .env
```

Update the `DOMAIN_NAME` line:
```env
DOMAIN_NAME=yourname.duckdns.org
```

Replace `yourname` with the subdomain you created in Step 1.

**Full .env example**:
```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_zqAVcWu8t0vF@ep-winter-frost-a1c9l5vv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Application Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
CORS_ORIGIN=https://av512406.github.io

# Domain Configuration
DOMAIN_NAME=schoolerp.duckdns.org

# JWT Secret
JWT_SECRET=TCM0KQAWhm+CjZiWKeSuI9zdrOiDGcALCMu906oVNuY=
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 3: Initialize SSL (5 minutes)

Run the SSL initialization script:

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh
```

**What this does**:
- Creates a temporary certificate
- Starts Nginx
- Requests a real SSL certificate from Let's Encrypt
- Configures HTTPS

**Expected output**:
```
### Creating dummy certificate...
### Starting nginx...
### Requesting Let's Encrypt certificate...
Successfully received certificate.
```

## Step 4: Verify Backend is Working

Test your backend with HTTPS:

```bash
curl https://yourname.duckdns.org/healthz
```

**Expected response**:
```json
{"ok":true,"timestamp":"2025-11-24T..."}
```

If you see this, **SSL is working!** ✅

## Step 5: Update GitHub Repository Variable (2 minutes)

1. Go to: https://github.com/av512406/erp/settings/variables/actions
2. Look for `VITE_API_BASE_URL` variable:
   - If it exists, click "Edit"
   - If not, click "New repository variable"
3. Set:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://yourname.duckdns.org` (replace with your DuckDNS domain)
4. Click "Add variable" or "Update variable"

**IMPORTANT**: Make sure to use `https://` (not `http://`)!

## Step 6: Rebuild and Deploy Frontend (5 minutes)

### Option A: Trigger via GitHub UI
1. Go to: https://github.com/av512406/erp/actions
2. Click on your workflow (e.g., "Frontend GitHub Pages Deploy")
3. Click "Run workflow" → Select branch → "Run workflow"
4. Wait for the green checkmark (usually 2-3 minutes)

### Option B: Push a commit
```bash
# On your local machine
cd /mnt/sda7/23_nov_antigravity/erp-frontend-git
git add .
git commit -m "Update API URL to use HTTPS domain" --allow-empty
git push origin main  # or PROD, depending on your workflow
```

## Step 7: Test Login (1 minute)

1. Go to: https://av512406.github.io/erp/
2. Open browser DevTools (F12) → Console tab
3. Try to login with credentials:
   - Email: `admin@school.edu`
   - Password: `admin123`
4. Check the Console - should see **NO Mixed Content errors**
5. Login should work! ✅

## Verification Checklist

- [ ] DuckDNS subdomain created and pointing to `13.233.95.247`
- [ ] `.env` file updated with `DOMAIN_NAME=yourname.duckdns.org`
- [ ] SSL initialization completed successfully
- [ ] Backend health check works: `curl https://yourname.duckdns.org/healthz`
- [ ] GitHub variable `VITE_API_BASE_URL` set to `https://yourname.duckdns.org`
- [ ] Frontend rebuilt and deployed via GitHub Actions
- [ ] Login page loads without errors
- [ ] Login works without Mixed Content errors

## Troubleshooting

### SSL Certificate Fails
**Error**: "Failed to obtain certificate"

**Solution**:
1. Wait 2-3 minutes for DNS to propagate
2. Verify DNS: `nslookup yourname.duckdns.org` (should show `13.233.95.247`)
3. Try again: `./scripts/init-ssl.sh`

### Backend Still Shows HTTP Error
**Problem**: Frontend still tries to use HTTP

**Solution**:
1. Verify GitHub variable is set correctly (with `https://`)
2. Rebuild frontend (Step 6)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

### DuckDNS Domain Not Resolving
**Problem**: `nslookup yourname.duckdns.org` fails

**Solution**:
1. Go back to DuckDNS website
2. Verify IP is set to `13.233.95.247`
3. Click "Update IP" button
4. Wait 1-2 minutes and try again

## Alternative: Use No-IP (Another Free Option)

If DuckDNS doesn't work, try **No-IP**:

1. Go to: https://www.noip.com/
2. Sign up for free account
3. Create a hostname (e.g., `yourname.ddns.net`)
4. Point to IP: `13.233.95.247`
5. Follow Steps 2-7 above with your No-IP domain

## Total Time Required

- **Setup**: ~30 minutes
- **DNS Propagation**: 1-5 minutes
- **Testing**: 5 minutes

**Total**: ~40 minutes to get login working with HTTPS

## What You Get

✅ Free subdomain (e.g., `schoolerp.duckdns.org`)  
✅ Free SSL certificate (from Let's Encrypt)  
✅ HTTPS working on backend  
✅ Login working without errors  
✅ Automatic certificate renewal (every 90 days)

## Next Steps After Setup

Once everything is working:
1. Consider buying a custom domain for production (more professional)
2. Update documentation with your domain name
3. Set up monitoring for SSL certificate expiration
4. Configure automatic DuckDNS IP updates (if your EC2 IP changes)

---

**Need Help?** If you get stuck at any step, let me know which step and what error you're seeing!
