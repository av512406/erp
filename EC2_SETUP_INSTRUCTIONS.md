# EC2 Setup Instructions for school-erp.duckdns.org

## ✅ Configuration Ready!

Your environment has been configured for domain: **school-erp.duckdns.org**

## 📋 What to Do on EC2

### Step 1: Upload Files to EC2

You need to get the updated configuration files to your EC2 instance. Choose one method:

#### Method A: Using Git (Recommended)

```bash
# On your local machine
cd /mnt/sda7/23_nov_antigravity/erp-frontend-git
git add .
git commit -m "Configure for school-erp.duckdns.org"
git push origin main

# On EC2
ssh -i "your-key.pem" ubuntu@13.233.95.247
cd /srv/school-erp
git pull origin main
```

#### Method B: Using SCP

```bash
# On your local machine
cd /mnt/sda7/23_nov_antigravity/erp-frontend-git

# Copy environment file
scp -i "your-key.pem" temp_prod_updated.env ubuntu@13.233.95.247:/srv/school-erp/.env

# Copy scripts
scp -i "your-key.pem" scripts/configure-ec2.sh ubuntu@13.233.95.247:/srv/school-erp/scripts/
scp -i "your-key.pem" scripts/init-ssl.sh ubuntu@13.233.95.247:/srv/school-erp/scripts/
```

### Step 2: Run Configuration Script on EC2

```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@13.233.95.247

# Navigate to project directory
cd /srv/school-erp

# Run the automated configuration script
./scripts/configure-ec2.sh
```

**The script will:**
1. ✅ Update your .env file with the domain
2. ✅ Verify DNS configuration
3. ✅ Check environment variables
4. ✅ Set up SSL certificates with Let's Encrypt
5. ✅ Start Docker services
6. ✅ Test the backend

**Expected output:**
```
✓ DNS is configured correctly!
✓ SSL setup completed successfully!
✓ Backend is responding via HTTPS!
```

### Step 3: Verify Backend is Working

Test the backend health endpoint:

```bash
curl https://school-erp.duckdns.org/healthz
```

**Expected response:**
```json
{"ok":true,"timestamp":"2025-11-24T..."}
```

If you see this, **your backend is working with HTTPS!** ✅

## 🌐 Update GitHub Configuration

### Step 1: Set Repository Variable

1. Go to: https://github.com/av512406/erp/settings/variables/actions
2. Click "New repository variable" (or edit if exists)
3. Set:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://school-erp.duckdns.org`
4. Click "Add variable"

**IMPORTANT**: Make sure to use `https://` (not `http://`)!

### Step 2: Rebuild Frontend

1. Go to: https://github.com/av512406/erp/actions
2. Find your workflow (e.g., "Frontend GitHub Pages Deploy")
3. Click "Run workflow"
4. Select branch (main or PROD)
5. Click "Run workflow"
6. Wait for green checkmark (usually 2-3 minutes)

## 🧪 Test Login

1. **Open**: https://av512406.github.io/erp/
2. **Open DevTools**: Press F12 → Go to Console tab
3. **Try logging in**:
   - Email: `admin@school.edu`
   - Password: `admin123`
4. **Check Console**: Should see **NO Mixed Content errors**
5. **Login should work!** ✅

## 🔧 Troubleshooting

### If SSL Setup Fails

**Error**: "Failed to obtain certificate"

**Solution**:
```bash
# Wait 2-3 minutes for DNS to propagate
sleep 180

# Try again
export DOMAIN_NAME=school-erp.duckdns.org
./scripts/init-ssl.sh
```

### If Backend Not Responding

**Error**: `curl: (7) Failed to connect`

**Solution**:
```bash
# Check Docker services
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs nginx

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### If DNS Not Resolving

**Error**: `nslookup` shows wrong IP

**Solution**:
1. Go back to https://www.duckdns.org/
2. Verify IP is set to: `13.233.95.247`
3. Click "Update IP"
4. Wait 1-2 minutes
5. Try again: `nslookup school-erp.duckdns.org`

### If Login Still Shows Mixed Content Error

**Problem**: Frontend still tries to use HTTP

**Solution**:
1. Verify GitHub variable is set to `https://school-erp.duckdns.org`
2. Rebuild frontend (see Step 2 above)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+Shift+R)
5. Try login again

## 📊 Verification Checklist

- [ ] DuckDNS subdomain created: `school-erp.duckdns.org`
- [ ] DNS points to: `13.233.95.247`
- [ ] Files uploaded to EC2
- [ ] Configuration script executed successfully
- [ ] SSL certificates installed
- [ ] Backend health check works: `curl https://school-erp.duckdns.org/healthz`
- [ ] GitHub variable `VITE_API_BASE_URL` set to `https://school-erp.duckdns.org`
- [ ] Frontend rebuilt and deployed
- [ ] Login page loads without errors
- [ ] Login works without Mixed Content errors

## 🎯 Quick Commands Reference

```bash
# View backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# View nginx logs
docker compose -f docker-compose.prod.yml logs -f nginx

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Check service status
docker compose -f docker-compose.prod.yml ps

# Test backend health
curl https://school-erp.duckdns.org/healthz
curl https://school-erp.duckdns.org/api/health
```

## 📁 Files Updated

1. **temp_prod_updated.env** - Domain configured to `school-erp.duckdns.org`
2. **scripts/configure-ec2.sh** - Automated setup script (NEW)

## ✨ What You'll Get

✅ Backend accessible at: `https://school-erp.duckdns.org`  
✅ Free SSL certificate (auto-renews every 90 days)  
✅ HTTPS working on backend  
✅ Login working without errors  
✅ Professional deployment setup  

---

**Ready to proceed?** Run the configuration script on your EC2 instance!
