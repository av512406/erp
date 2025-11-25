# CORS and Login Fixes Summary

**Date:** 2025-11-25
**Issue:** User unable to login due to CORS errors falling back to `localhost`.

## 1. The Issue
The login request was failing with a CORS error. The browser console showed:
> Allowed Origin: http://localhost:5173

This indicated that the backend was not correctly configured for the production domain (`https://school-erp.duckdns.org`) and was falling back to the default development configuration.

## 2. Root Causes Identified

### A. Environment Variable Mismatch
- **Problem:** The `docker-compose.prod.yml` file was passing the environment variable `FRONTEND_ORIGIN` to the backend container.
- **Conflict:** The backend code (`backend/index.ts`) expects the variable `CORS_ORIGIN`.
- **Result:** The backend didn't see `CORS_ORIGIN`, so it defaulted to `localhost`.

### B. Duplicate CORS Configuration
- **Problem:** Both `backend/index.ts` and `backend/routes.ts` were attempting to configure CORS.
- **Conflict:** `routes.ts` had a simpler configuration that was overriding the more robust logic in `index.ts`.

## 3. Fixes Applied

### ✅ 1. Corrected Docker Compose Configuration
Updated `docker-compose.prod.yml` to map the environment variable correctly:

```yaml
# Before
- FRONTEND_ORIGIN=${CORS_ORIGIN}

# After
- CORS_ORIGIN=${CORS_ORIGIN}
```

### ✅ 2. Removed Duplicate Configuration
Removed the conflicting CORS setup from `backend/routes.ts` to ensure `backend/index.ts` handles all CORS logic centrally.

### ✅ 3. Enhanced Backend Logic (Debug)
Updated `backend/index.ts` to include debug logging for CORS checks. This helps verify exactly which origins are being allowed or blocked.

```typescript
console.log('Checking CORS origin:', origin);
console.log('Allowed origins:', allowedOrigins);
```

## 4. Verification
We verified the fix by simulating a login request directly on the server using `curl` from the Nginx container:

```bash
docker exec school_erp_nginx curl -v -X POST http://backend:3000/api/auth/login \
  -H 'Origin: https://school-erp.duckdns.org' \
  ...
```

**Result:**
- Status: `200 OK`
- Header: `Access-Control-Allow-Origin: https://school-erp.duckdns.org`

## 5. Deployment Steps (For Future Reference)
If you need to redeploy these changes:

1.  **Update Code:**
    ```bash
    git pull
    ```
2.  **Rebuild Backend:**
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build backend
    ```
3.  **Verify Logs:**
    ```bash
    docker logs school_erp_backend | grep "Allowed origins"
    ```
