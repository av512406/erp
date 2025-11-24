# Production Deployment Checklist

Use this checklist to ensure your School ERP application is properly deployed and configured.

## ✅ Pre-Deployment Checklist

### Database (Neon DB)
- [ ] Neon DB project created
- [ ] Connection string copied (should end with `?sslmode=require`)
- [ ] Database is accessible from your EC2 instance

### Domain & DNS
- [ ] Domain name registered (e.g., `api.yourschool.com`)
- [ ] DNS A record created pointing to EC2 public IP
- [ ] DNS propagation complete (check with `nslookup api.yourschool.com`)

### AWS EC2 Instance
- [ ] EC2 instance launched (Ubuntu 22.04/24.04)
- [ ] Security Group allows ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] SSH key pair downloaded and secured (`chmod 400 your-key.pem`)
- [ ] Can connect to instance via SSH

### GitHub Repository
- [ ] Repository created and code pushed
- [ ] GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)

## ✅ Backend Deployment Checklist

### EC2 Setup
- [ ] Docker installed on EC2
- [ ] Docker Compose installed on EC2
- [ ] User added to docker group (`sudo usermod -aG docker $USER`)
- [ ] Repository cloned to `/srv/school-erp` (or your preferred location)

### Environment Configuration
- [ ] `.env` file created in project root
- [ ] `DATABASE_URL` set with Neon connection string
- [ ] `NODE_ENV=production` set
- [ ] `PORT=3000` set
- [ ] `CORS_ORIGIN` set to `https://yourusername.github.io` (exact match, no trailing slash)
- [ ] `DOMAIN_NAME` set to your backend domain (e.g., `api.yourschool.com`)
- [ ] `JWT_SECRET` generated and set (use `openssl rand -base64 32`)

### SSL Certificate Setup
- [ ] SSL initialization script exists (`scripts/init-ssl.sh`)
- [ ] Script has execute permissions (`chmod +x scripts/init-ssl.sh`)
- [ ] SSL initialization completed successfully (`./scripts/init-ssl.sh`)
- [ ] Certificates created in `./data/certbot/conf/live/your-domain.com/`

### Docker Services
- [ ] Backend container running (`docker compose -f docker-compose.prod.yml ps`)
- [ ] Nginx container running
- [ ] Certbot container running
- [ ] Backend accessible on port 3000 internally
- [ ] Nginx accessible on ports 80 and 443 externally

### Backend Verification
- [ ] Health check responds: `curl https://api.yourschool.com/healthz`
- [ ] API health check responds: `curl https://api.yourschool.com/api/health`
- [ ] HTTPS works (no certificate errors)
- [ ] HTTP redirects to HTTPS

## ✅ Frontend Deployment Checklist

### GitHub Configuration
- [ ] Repository Variables configured (Settings → Secrets and variables → Actions → Variables)
- [ ] `VITE_API_BASE_URL` set to `https://api.yourschool.com` (with HTTPS!)
- [ ] Variable value has NO trailing slash

### GitHub Actions
- [ ] Workflow file exists (`.github/workflows/frontend-pages.yml` or `deploy.yml`)
- [ ] Workflow triggers on push to correct branch (main or PROD)
- [ ] Latest workflow run succeeded (check Actions tab)
- [ ] Artifacts uploaded successfully
- [ ] Deployment to GitHub Pages succeeded

### Frontend Verification
- [ ] GitHub Pages site accessible: `https://yourusername.github.io/repo-name/`
- [ ] Frontend loads without errors
- [ ] No console errors in browser DevTools
- [ ] API calls use HTTPS (check Network tab)

## ✅ Integration Testing

### Authentication
- [ ] Login page loads
- [ ] Can submit login form
- [ ] No 307 redirect errors
- [ ] No CORS errors
- [ ] Successful login redirects to dashboard
- [ ] JWT token stored in browser

### API Communication
- [ ] Frontend can fetch data from backend
- [ ] All API endpoints respond correctly
- [ ] No mixed content warnings (HTTP/HTTPS)
- [ ] Network requests show 200/201 status codes

### Security
- [ ] All traffic uses HTTPS
- [ ] SSL certificate is valid (check browser padlock)
- [ ] CORS only allows your GitHub Pages origin
- [ ] JWT secret is secure and not exposed

## ✅ Post-Deployment

### Monitoring
- [ ] Backend logs accessible: `docker compose -f docker-compose.prod.yml logs -f`
- [ ] No error messages in logs
- [ ] Health endpoints responding

### Documentation
- [ ] `.env.example` updated with all required variables
- [ ] `DEPLOYMENT.md` reviewed and accurate
- [ ] Team members have access to necessary credentials

### Backup & Recovery
- [ ] Database backup strategy in place (Neon handles this)
- [ ] `.env` file backed up securely (NOT in git)
- [ ] SSL certificates backed up (in `./data/certbot/`)

## 🔧 Common Issues Reference

| Issue | Quick Fix |
|-------|-----------|
| 307 Redirect | Ensure backend uses HTTPS, check `VITE_API_BASE_URL` |
| CORS Error | Verify `CORS_ORIGIN` matches GitHub Pages URL exactly |
| SSL Error | Re-run `./scripts/init-ssl.sh`, check DNS |
| 502/503 Error | Check backend logs, verify database connection |
| Build Fails | Check GitHub Actions logs, verify `VITE_API_BASE_URL` |

## 📝 Notes

- **Domain Name**: ___________________________
- **EC2 Public IP**: ___________________________
- **GitHub Pages URL**: ___________________________
- **Deployment Date**: ___________________________
- **Last Updated**: ___________________________

---

**Need Help?** Check the Troubleshooting section in `DEPLOYMENT.md`
