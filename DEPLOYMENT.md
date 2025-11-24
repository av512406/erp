# School ERP — Production Deployment Guide

This document provides a step-by-step guide to deploy the School ERP application using **Neon DB** (Database), **GitHub Pages** (Frontend), and **AWS EC2** (Backend).

## Prerequisites
- GitHub Account
- Neon DB Account (https://neon.tech)
- AWS Account (https://aws.amazon.com)
- Domain Name (e.g., `api.yourschool.com`) pointing to your EC2 IP.

## 1. Database Setup (Neon DB)
1.  Log in to Neon Console.
2.  Create a new project (e.g., `school-erp`).
3.  Copy the **Connection String** (Postgres URL). It looks like: `postgres://user:password@ep-xyz.region.neon.tech/neondb?sslmode=require`.
4.  **Important**: Neon requires SSL. Ensure your connection string ends with `?sslmode=require`.

## 2. Backend Deployment (AWS EC2)

### 2.1 Launch Instance
1.  Go to AWS Console -> EC2 -> Launch Instance.
2.  Name: `school-erp-backend`.
3.  OS: **Ubuntu Server 24.04 LTS** (or 22.04).
4.  Instance Type: `t2.micro` or `t3.micro` (Free Tier eligible).
5.  Key Pair: Create new or use existing (save the `.pem` file).
6.  Security Group: Allow SSH (22), HTTP (80), HTTPS (443).

### 2.2 Connect and Setup
1.  Connect to your instance:
    ```bash
    chmod 400 your-key.pem
    ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
    ```
2.  Install Docker and Docker Compose:
    ```bash
    # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update

    # Install Docker packages:
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group (avoid sudo):
    sudo usermod -aG docker $USER
    newgrp docker
    ```

### 2.3 Deploy Code
1.  Clone your repo:
    ```bash
    git clone https://github.com/YOUR_USER/YOUR_REPO.git /srv/school-erp
    cd /srv/school-erp
    ```
2.  Create `.env` file:
    ```bash
    nano .env
    ```
    Add the following content (replace with your actual values):
    ```env
    # Database Configuration
    DATABASE_URL=your_neon_connection_string
    
    # Application Configuration
    NODE_ENV=production
    PORT=3000
    
    # CORS Configuration (MUST be HTTPS for GitHub Pages)
    CORS_ORIGIN=https://YOUR_GITHUB_USERNAME.github.io
    
    # Domain Configuration (REQUIRED for SSL setup)
    # This should be your backend API domain (e.g., api.yourschool.com)
    DOMAIN_NAME=api.yourschool.com
    
    # JWT Secret (REQUIRED for authentication)
    # Generate a secure random secret with: openssl rand -base64 32
    JWT_SECRET=your_generated_jwt_secret_here
    ```
    
    **Important Notes:**
    - Replace `your_neon_connection_string` with your actual Neon DB connection string
    - Replace `YOUR_GITHUB_USERNAME` with your GitHub username (e.g., av512406)
    - Replace `api.yourschool.com` with your actual domain name
    - Generate a secure JWT_SECRET by running: `openssl rand -base64 32`
    - Ensure your domain DNS A record points to your EC2 instance's public IP

### 2.4 Initialize SSL (Important!)
Run the initialization script to generate SSL certificates. This is required for the backend to work with GitHub Pages (HTTPS).

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh
```
*Follow the prompts. This will generate certificates and start the services.*

### 2.5 Start Services
If the script didn't start everything or you need to restart:
```bash
docker compose -f docker-compose.prod.yml up -d
```

## 3. Frontend Deployment (GitHub Pages)
1.  **Configure Repository**:
    *   Go to GitHub Repo -> Settings -> Pages.
    *   Source: **GitHub Actions**.
2.  **Set Secrets**:
    *   Go to Settings -> Secrets and variables -> Actions.
    *   Add `VITE_API_BASE_URL`: `https://api.yourschool.com/api` (Must be HTTPS!).
3.  **Push Code**:
    *   Commit and push your changes.
    *   The `.github/workflows/deploy.yml` action will automatically build and deploy.
4.  **Verify**:
    *   Visit your GitHub Pages URL.
    *   Login should now work without 307 errors.

## 4. Maintenance
-   **Logs**: `docker compose -f docker-compose.prod.yml logs -f`
-   **Update**: `git pull && docker compose -f docker-compose.prod.yml up -d --build`
-   **Renew Certs**: The `certbot` container handles this automatically.

## 5. Troubleshooting

### 307 Redirect Error on Login
**Symptom**: Login fails with 307 (Temporary Redirect) error.

**Cause**: HTTP/HTTPS mismatch. GitHub Pages uses HTTPS, but backend is on HTTP.

**Solution**:
1. Ensure SSL is properly initialized on EC2 (see section 2.4)
2. Verify `DOMAIN_NAME` is set in `.env` file
3. Check that your domain's DNS A record points to EC2 public IP
4. Confirm `VITE_API_BASE_URL` in GitHub secrets uses `https://` (not `http://`)
5. Restart services: `docker compose -f docker-compose.prod.yml restart`

### CORS Error
**Symptom**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Cause**: Backend CORS_ORIGIN doesn't match frontend origin.

**Solution**:
1. Check `.env` file: `CORS_ORIGIN=https://yourusername.github.io` (must match exactly)
2. Ensure no trailing slash in CORS_ORIGIN
3. Restart backend: `docker compose -f docker-compose.prod.yml restart backend`

### SSL Certificate Issues
**Symptom**: "NET::ERR_CERT_AUTHORITY_INVALID" or certificate errors

**Cause**: SSL certificate not properly generated or expired.

**Solution**:
1. Check certificate exists: `ls -la ./data/certbot/conf/live/your-domain.com/`
2. Re-run SSL initialization: `./scripts/init-ssl.sh`
3. Check certbot logs: `docker compose -f docker-compose.prod.yml logs certbot`

### GitHub Actions Build Fails
**Symptom**: Frontend deployment fails in GitHub Actions

**Cause**: Missing environment variables or build errors.

**Solution**:
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Ensure `VITE_API_BASE_URL` is set (use Variables, not Secrets)
3. Value should be: `https://api.yourschool.com` (your backend domain with HTTPS)
4. Check Actions logs for specific error messages

### Backend Not Responding
**Symptom**: API calls timeout or return 502/503 errors

**Cause**: Backend container not running or database connection issues.

**Solution**:
1. Check container status: `docker compose -f docker-compose.prod.yml ps`
2. View backend logs: `docker compose -f docker-compose.prod.yml logs backend`
3. Test database connection: `docker compose -f docker-compose.prod.yml exec backend node -e "require('./db.js')"`
4. Restart all services: `docker compose -f docker-compose.prod.yml restart`
