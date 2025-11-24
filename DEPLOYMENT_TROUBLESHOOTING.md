# Deployment Troubleshooting Guide

This document contains all issues encountered during EC2 deployment and their solutions for future reference.

---

## Issue 1: Alpine Linux + bcrypt Native Module Crashes (SIGSEGV)

### Problem
Backend crashed with `SIGSEGV` (segmentation fault) errors when using `bcrypt` on Alpine Linux base image.

### Root Cause
- Alpine Linux uses `musl` libc instead of `glibc`
- Native Node modules like `bcrypt` have binary compatibility issues with Alpine
- The `bcrypt.compare()` and `bcrypt.hash()` functions caused crashes

### Solution
**Option A: Use Debian/Ubuntu base image** (Recommended)
```dockerfile
FROM node:20  # Instead of node:20-alpine
```

**Option B: Rebuild bcrypt in container**
```bash
docker exec <container> npm rebuild bcrypt
```

**Option C: Use bcryptjs** (Pure JavaScript, no native dependencies)
```bash
npm uninstall bcrypt @types/bcrypt
npm install bcryptjs @types/bcryptjs
```

### Prevention
- Avoid Alpine Linux for applications with native Node modules
- Test native modules in production-like environment before deployment

---

## Issue 2: CORS Configuration with Multiple Origins

### Problem
Backend returned `Error: Not allowed by CORS` even though `CORS_ORIGIN` environment variable was set correctly.

### Root Cause
Environment variable contained comma-separated origins:
```bash
CORS_ORIGIN=https://school-erp.duckdns.org,https://3.111.41.254
```

But backend code treated it as a single string:
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN,  // This is ONE string with comma!
];
```

### Solution
Split the environment variable by comma:
```typescript
const corsOriginEnv = process.env.CORS_ORIGIN || '';
const corsOrigins = corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean);
const allowedOrigins = [
  'http://localhost:5173',
  'https://av512406.github.io',
  ...corsOrigins,  // Spread the array
].filter(Boolean);
```

### Prevention
- Always handle environment variables that may contain multiple values
- Document expected format in `.env.example`
- Add validation/logging for CORS origins on startup

---

## Issue 3: Frontend API URL Mismatch

### Problem
Frontend built with `VITE_API_BASE_URL=https://school-erp.duckdns.org` but domain still pointed to old IP, causing all API requests to fail.

### Root Cause
- DNS propagation takes 15-30 minutes
- Frontend was built before DNS updated
- Browser cached the old DNS resolution

### Solution
**Temporary:** Use IP address directly
```bash
# frontend/.env.production
VITE_API_BASE_URL=https://3.111.41.254
```

**Permanent:** Wait for DNS propagation, then use domain
```bash
# Verify DNS updated
dig +short school-erp.duckdns.org

# Should return new IP
3.111.41.254

# Then rebuild frontend
VITE_API_BASE_URL=https://school-erp.duckdns.org
npm run build
```

### Prevention
- Update DNS BEFORE building frontend
- Use environment-specific build processes
- Add health check to verify API connectivity before deployment

---

## Issue 4: Docker Compose Environment Variables Not Loaded

### Problem
Environment variables in `.env` file weren't being passed to containers.

### Root Cause
- Docker Compose reads `.env` file automatically
- But variables must be explicitly mapped in `docker-compose.yml`
- Missing `JWT_SECRET` in environment section

### Solution
Update `docker-compose.prod.yml`:
```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - PORT=3000
      - CORS_ORIGIN=${CORS_ORIGIN}
      - JWT_SECRET=${JWT_SECRET}  # Add all required vars
```

Verify variables are loaded:
```bash
docker exec <container> env | grep CORS
```

### Prevention
- Explicitly list ALL required environment variables in docker-compose
- Add startup validation to check required env vars
- Use `env_file` directive for cleaner configuration

---

## Issue 5: Nginx Configuration Redirect Loop

### Problem
Nginx returned `500 Internal Server Error` with "rewrite or internal redirection cycle" error.

### Root Cause
Incorrect `try_files` directive caused infinite redirect:
```nginx
location / {
    try_files $uri $uri/ /index.html;  # Missing =404
}
```

### Solution
Add `=404` to prevent redirect loop:
```nginx
location / {
    try_files $uri $uri/ /index.html =404;
}
```

Or use more specific location blocks:
```nginx
# API requests
location /api/ {
    proxy_pass http://backend:3000;
}

# Frontend SPA
location / {
    root /var/www/html;
    try_files $uri $uri/ /index.html;
}
```

### Prevention
- Test nginx configuration before deployment: `nginx -t`
- Use specific location blocks for different routes
- Monitor nginx error logs during deployment

---

## Issue 6: SSL Certificate Path Issues

### Problem
Nginx failed to start with "cannot load certificate" error.

### Root Cause
- Certificate files didn't exist yet (before Let's Encrypt setup)
- Nginx tried to load certificates on startup

### Solution
**Temporary:** Create dummy self-signed certificate
```bash
mkdir -p data/certbot/conf/live/school-erp.duckdns.org
openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
  -keyout data/certbot/conf/live/school-erp.duckdns.org/privkey.pem \
  -out data/certbot/conf/live/school-erp.duckdns.org/fullchain.pem \
  -subj '/CN=school-erp.duckdns.org'
```

**Permanent:** Get Let's Encrypt certificate
```bash
docker-compose -f docker-compose.prod.yml run --rm --entrypoint \
  "certbot certonly --webroot -w /var/www/certbot \
  --email admin@school-erp.duckdns.org --agree-tos --no-eff-email \
  -d school-erp.duckdns.org" certbot
```

### Prevention
- Always create dummy certificates before first nginx start
- Use init scripts to handle certificate setup
- Consider using Certbot's nginx plugin for automatic configuration

---

## Issue 7: Docker Volume Mount Not Working

### Problem
Frontend files uploaded to EC2 but not visible in nginx container.

### Root Cause
- Volume mount added to `docker-compose.yml` after container creation
- Docker Compose doesn't update volumes on `restart`

### Solution
Recreate containers to apply volume changes:
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Prevention
- Use `docker-compose up -d` (not `restart`) after config changes
- Verify mounts: `docker inspect <container> | grep Mounts -A 10`
- Document which changes require container recreation

---

## Issue 8: Browser Cache Preventing Frontend Updates

### Problem
Users see old frontend even after deploying new version.

### Root Cause
- Browser caches JavaScript bundles
- Vite generates new hash in filename, but browser may cache HTML

### Solution
**User side:** Hard refresh
- Chrome/Firefox: `Ctrl + Shift + R`
- Safari: `Cmd + Shift + R`

**Server side:** Add cache headers
```nginx
location / {
    root /var/www/html;
    
    # Don't cache HTML
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Cache assets with hash in filename
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Prevention
- Implement proper cache headers
- Use service workers for cache management
- Add version number to deployment process

---

## Issue 9: DNS Propagation Delays

### Problem
Domain doesn't resolve to new IP immediately after updating DNS.

### Root Cause
- DNS changes take 5-30 minutes to propagate globally
- Different DNS servers cache records for different durations
- TTL (Time To Live) settings affect propagation speed

### Solution
**Check propagation:**
```bash
# Check from your location
dig +short school-erp.duckdns.org

# Check from multiple locations
# Use online tools: whatsmydns.net
```

**Speed up future updates:**
- Lower TTL before making changes (e.g., 300 seconds)
- Wait for TTL period to expire
- Make DNS change
- Restore higher TTL after propagation

### Prevention
- Plan DNS changes in advance
- Use IP addresses for initial testing
- Implement health checks that work with both IP and domain

---

## Deployment Checklist

Use this checklist for future deployments:

### Pre-Deployment
- [ ] Update DNS to point to new server IP
- [ ] Wait 30 minutes for DNS propagation
- [ ] Verify DNS: `dig +short your-domain.com`
- [ ] Prepare `.env` file with all required variables
- [ ] Test `.env` format (no spaces around `=`, proper escaping)

### EC2 Setup
- [ ] Install Docker and Docker Compose
- [ ] Create project directory: `/srv/school-erp`
- [ ] Upload codebase (exclude `node_modules`, `.git`, `dist`)
- [ ] Upload `.env` file
- [ ] Set proper permissions: `chown -R ubuntu:ubuntu /srv/school-erp`

### SSL Setup
- [ ] Create dummy certificates first
- [ ] Start services: `docker-compose up -d`
- [ ] Verify nginx is running
- [ ] Run Let's Encrypt setup
- [ ] Restart nginx to load real certificates

### Application Deployment
- [ ] Build frontend with correct `VITE_API_BASE_URL`
- [ ] Upload frontend to `frontend-dist/`
- [ ] Verify docker-compose.yml has all environment variables
- [ ] Build and start containers
- [ ] Check logs: `docker-compose logs -f`

### Verification
- [ ] Test health endpoint: `curl https://your-domain.com/healthz`
- [ ] Test CORS: `curl -H "Origin: https://your-domain.com" https://your-domain.com/api/healthz`
- [ ] Test login API with curl
- [ ] Test login from browser
- [ ] Verify dashboard loads
- [ ] Check browser console for errors

### Post-Deployment
- [ ] Document admin credentials securely
- [ ] Set up monitoring/logging
- [ ] Configure automated backups
- [ ] Update documentation with new URLs

---

## Common Commands

### Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs backend -f
docker logs school_erp_backend --tail 50
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend

# Or rebuild inside running container
docker exec school_erp_backend npm run build
docker restart school_erp_backend
```

### Check Environment Variables
```bash
docker exec school_erp_backend env
docker exec school_erp_backend env | grep CORS
```

### Test API Endpoints
```bash
# Health check
curl -k https://your-ip/healthz

# Login test
curl -k -X POST https://your-ip/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-ip" \
  -d '{"email":"admin@school.edu","password":"admin123"}'
```

---

## Key Lessons Learned

1. **Use Debian-based images** for Node.js apps with native modules
2. **Always split comma-separated environment variables** in code
3. **Wait for DNS propagation** before building frontend
4. **Explicitly map all environment variables** in docker-compose
5. **Create dummy SSL certificates** before first nginx start
6. **Recreate containers** after volume mount changes
7. **Test CORS configuration** with curl before browser testing
8. **Document everything** for future deployments
9. **Verify each step** before moving to the next
10. **Keep deployment logs** for troubleshooting

---

## Emergency Rollback

If deployment fails:

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore from backup (if available)
# Or redeploy previous working version

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl https://your-domain.com/healthz
```

---

**Last Updated:** 2025-11-24  
**Deployment:** EC2 (3.111.41.254) + Neon DB + school-erp.duckdns.org
