# Quick Deployment Guide

This is a quick reference for deploying the School ERP application to production.

## 🚀 Quick Start (5 Steps)

### 1. Setup Database (Neon DB)
```bash
# Create a Neon DB project at https://neon.tech
# Copy your connection string (should end with ?sslmode=require)
```

### 2. Setup EC2 Instance
```bash
# Launch Ubuntu 22.04/24.04 instance
# Allow ports: 22, 80, 443 in Security Group
# Connect via SSH
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# Clone repository
git clone https://github.com/av512406/erp.git /srv/school-erp
cd /srv/school-erp
```

### 3. Configure Environment
```bash
# Create .env file
nano .env
```

Paste this (replace with your values):
```env
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://av512406.github.io
DOMAIN_NAME=api.yourschool.com
JWT_SECRET=$(openssl rand -base64 32)
```

**Verify configuration:**
```bash
./scripts/verify-env.sh
```

### 4. Initialize SSL
```bash
# Make sure your domain DNS points to this EC2 IP first!
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh
```

### 5. Configure GitHub Pages
```bash
# Go to: https://github.com/av512406/erp/settings/variables/actions
# Add Variable: VITE_API_BASE_URL
# Value: https://api.yourschool.com
```

Then push to trigger deployment:
```bash
git push origin main  # or PROD branch
```

## ✅ Verification

### Backend Health Check
```bash
curl https://api.yourschool.com/healthz
# Should return: {"ok":true,"timestamp":"..."}

curl https://api.yourschool.com/api/health
# Should return: {"ok":true,"db":true,"timestamp":"..."}
```

### Frontend Check
Visit: `https://av512406.github.io/erp/`
- Should load without errors
- Check browser console (F12) - no errors
- Try logging in - should work without 307 errors

## 🔧 Common Commands

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs nginx
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart nginx
```

### Update Code
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Check Status
```bash
docker compose -f docker-compose.prod.yml ps
```

## 🐛 Troubleshooting

### 307 Redirect Error
**Problem**: Login fails with 307 error

**Solution**:
1. Ensure SSL is working: `curl -I https://api.yourschool.com`
2. Check VITE_API_BASE_URL uses `https://` (not `http://`)
3. Verify DOMAIN_NAME in .env matches your actual domain
4. Restart: `docker compose -f docker-compose.prod.yml restart`

### CORS Error
**Problem**: "Blocked by CORS policy"

**Solution**:
1. Check `.env`: `CORS_ORIGIN=https://av512406.github.io` (exact match, no trailing slash)
2. Restart backend: `docker compose -f docker-compose.prod.yml restart backend`

### SSL Certificate Error
**Problem**: Certificate invalid or not found

**Solution**:
1. Check DNS: `nslookup api.yourschool.com` (should point to EC2 IP)
2. Re-run: `./scripts/init-ssl.sh`
3. Check logs: `docker compose -f docker-compose.prod.yml logs certbot`

### Backend Not Responding
**Problem**: 502/503 errors

**Solution**:
1. Check logs: `docker compose -f docker-compose.prod.yml logs backend`
2. Verify database: Check DATABASE_URL in .env
3. Restart all: `docker compose -f docker-compose.prod.yml restart`

## 📚 Full Documentation

- **Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Environment Variables**: See [.env.example](./.env.example)

## 🔐 Security Notes

- Never commit `.env` file to git
- Keep JWT_SECRET secure and random (32+ characters)
- Use strong passwords for database
- Regularly update dependencies
- Monitor logs for suspicious activity

## 📞 Support

If you encounter issues not covered here:
1. Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Check Docker logs for specific errors
4. Verify all environment variables with `./scripts/verify-env.sh`
