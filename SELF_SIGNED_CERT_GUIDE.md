# How to Make Login Work with Self-Signed Certificate

## Current Status

✅ **Backend**: Running with HTTPS at `https://school-erp.duckdns.org`  
✅ **Frontend**: Configured to use HTTPS backend  
❌ **Login**: Failing with `ERR_CERT_AUTHORITY_INVALID`

## The Problem

The browser doesn't trust the self-signed SSL certificate, so it blocks all API requests to the backend.

**Error**: `Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID`

## Solution: Trust the Certificate (2 minutes)

### Step 1: Visit Backend Directly

Open a new tab and go to:
```
https://school-erp.duckdns.org/healthz
```

### Step 2: Accept the Security Warning

You'll see a warning page like:
- **Chrome/Brave**: "Your connection is not private" with `NET::ERR_CERT_AUTHORITY_INVALID`
- **Firefox**: "Warning: Potential Security Risk Ahead"
- **Safari**: "This Connection Is Not Private"

### Step 3: Proceed Anyway

Click:
- **Chrome/Brave**: "Advanced" → "Proceed to school-erp.duckdns.org (unsafe)"
- **Firefox**: "Advanced" → "Accept the Risk and Continue"
- **Safari**: "Show Details" → "visit this website"

### Step 4: Verify Backend Works

You should see:
```json
{"ok":true,"timestamp":"2025-11-24T..."}
```

This means your browser now trusts the certificate!

### Step 5: Test Login

1. Go back to: `https://av512406.github.io/erp/`
2. Try logging in again with:
   - Email: `admin@school.edu`
   - Password: `admin123`
3. **Login should work!** ✅

## Why This Happens

Self-signed certificates are not issued by a trusted Certificate Authority (CA). Browsers show warnings to protect users from potential security risks. Once you manually accept the certificate, the browser remembers your choice.

## Alternative: Get a Trusted Certificate

If you want to avoid the browser warning, you need a certificate from a trusted CA. The Let's Encrypt setup failed due to DNS issues with DuckDNS. Options:

### Option 1: Wait and Retry Let's Encrypt (Recommended)
Sometimes DNS propagation takes time. Wait 24 hours and try:
```bash
ssh -i "your-key.pem" ubuntu@ec2-13-233-95-247.ap-south-1.compute.amazonaws.com
cd /srv/school-erp
export DOMAIN_NAME=school-erp.duckdns.org
./scripts/init-ssl.sh
```

### Option 2: Use a Different Free Domain Service
- **No-IP**: https://www.noip.com/
- **FreeDNS**: https://freedns.afraid.org/
- **Dynu**: https://www.dynu.com/

These services might have better DNS propagation for Let's Encrypt.

### Option 3: Buy a Domain (~$10-15/year)
Most reliable option:
- Buy from Namecheap, GoDaddy, or Google Domains
- Point to your EC2 IP
- Let's Encrypt will work perfectly

## Quick Test Commands

### Test Backend Health (from terminal)
```bash
curl -k https://school-erp.duckdns.org/healthz
```

### Test Backend Health (from browser)
Visit: `https://school-erp.duckdns.org/healthz`

### Test API Login (from terminal)
```bash
curl -k -X POST https://school-erp.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"admin123"}'
```

## Summary

**Current Setup**:
- ✅ Backend running with HTTPS
- ✅ Self-signed certificate (365 days validity)
- ✅ Frontend configured correctly
- ⚠️ Browser warning (expected for self-signed certs)

**To Make Login Work**:
1. Visit `https://school-erp.duckdns.org/healthz`
2. Accept the security warning
3. Go back to login page
4. Login will work! ✅

**For Production** (no warnings):
- Get a trusted certificate from Let's Encrypt (retry in 24h)
- Or use a different domain service
- Or buy a custom domain

---

**The self-signed certificate is fully functional** - it just requires a one-time manual acceptance in your browser!
