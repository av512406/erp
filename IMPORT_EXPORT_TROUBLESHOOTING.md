# Import/Export Functionality Issues & Fixes

## Current Status
- ✅ Login working
- ❌ Download template not working
- ❌ Import students not working  
- ❌ Export students not working

## Common Issues & Solutions

### Issue 1: CORS Headers for File Downloads

**Problem:** Browser blocks file downloads from API due to missing CORS headers.

**Solution:** The backend already has CORS configured, but verify the response headers include:
```
Access-Control-Allow-Origin: https://3.111.41.254
Access-Control-Expose-Headers: Content-Disposition
```

### Issue 2: Authentication Token Not Sent

**Problem:** Export/import endpoints require authentication but token isn't being sent.

**Check:** Frontend should send token in requests. Verify in browser DevTools > Network tab.

**Fix if needed:** Update frontend API client to include credentials:
```typescript
// In frontend/src/lib/api.ts
fetch(url, {
  credentials: 'include',  // Send cookies
  headers: {
    'Authorization': `Bearer ${token}`  // Or use Bearer token
  }
})
```

### Issue 3: Content-Type for File Downloads

**Problem:** Excel files not downloading properly.

**Backend should send:**
```typescript
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
```

### Issue 4: ExcelJS Library Missing

**Problem:** Backend crashes when trying to generate Excel files.

**Check:** Look for errors in backend logs:
```bash
docker logs school_erp_backend 2>&1 | grep -i excel
```

**Fix:** ExcelJS should already be installed, but verify:
```bash
docker exec school_erp_backend npm list exceljs
```

## Testing Steps

### 1. Test Export Endpoint Directly
```bash
# Get a valid token first by logging in
TOKEN="your-jwt-token-here"

# Test export
curl -k "https://3.111.41.254/api/export/students/excel" \
  -H "Authorization: Bearer $TOKEN" \
  -o students.xlsx

# Check if file was created
ls -lh students.xlsx
```

### 2. Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to export/import
4. Look for errors (CORS, 401, 500, etc.)

### 3. Check Network Tab
1. Open DevTools > Network tab
2. Try to download template
3. Click on the request
4. Check:
   - Status code (should be 200)
   - Response headers
   - Response body

## Quick Fixes

### Fix 1: Add CORS Headers to Export Routes

If exports are failing due to CORS, add this to backend routes:

```typescript
app.get('/api/export/students/excel', async (req, res) => {
  // Add CORS headers explicitly
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  
  // ... rest of the code
});
```

### Fix 2: Frontend Download Handler

Ensure frontend properly handles blob downloads:

```typescript
// Correct way to download files
const response = await fetch('/api/export/students/excel', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'students.xlsx';
a.click();
window.URL.revokeObjectURL(url);
```

### Fix 3: Template Download Endpoint

Add a simple template download endpoint if missing:

```typescript
app.get('/api/students/template', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="student_import_template.xlsx"');
  
  // Create empty template with headers
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');
  
  worksheet.columns = [
    { header: 'Admission Number', key: 'admissionNumber', width: 20 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Father Name', key: 'fatherName', width: 30 },
    // ... add all required columns
  ];
  
  res.send(await workbook.xlsx.writeBuffer());
});
```

## Debugging Commands

```bash
# Check backend logs for errors
ssh -i ../../18Nov_erp_frontend_git/linux_av.pem ubuntu@ec2-3-111-41-254.ap-south-1.compute.amazonaws.com \
  "docker logs school_erp_backend --tail 100"

# Test import endpoint
curl -k -X POST "https://3.111.41.254/api/students/import" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "students": [{
      "admissionNumber": "TEST001",
      "name": "Test Student",
      "dateOfBirth": "2010-01-01",
      "admissionDate": "2024-01-01"
    }],
    "strategy": "skip"
  }'

# Check if exceljs is installed
docker exec school_erp_backend npm list | grep excel
```

## Next Steps

1. **Check browser console** for specific error messages
2. **Test export endpoint** with curl to verify it works
3. **Verify authentication** - token is being sent correctly
4. **Check backend logs** for any errors during export/import
5. **Test with simple data** to isolate the issue

## Need More Help?

Provide:
1. Screenshot of browser console errors
2. Screenshot of Network tab showing failed request
3. Backend logs during the failed operation
4. Which specific feature isn't working (template download, import, or export)
