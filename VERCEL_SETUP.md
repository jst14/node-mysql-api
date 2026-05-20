# Quick Vercel Deployment Fix

## Problem
The API returned 500 error because **environment variables are not set** in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click your project: `jslimos nero-ipt-2026-backend`

### Step 2: Go to Settings > Environment Variables

### Step 3: Add Each Variable

Copy-paste each of these exactly as shown:

**1. Database Host**
```
Name: DB_HOST
Value: [YOUR MYSQL SERVER HOST]
```
Example: `mysql.c9users.io` or `db.yourdomain.com`

**2. Database Port**
```
Name: DB_PORT
Value: 3306
```

**3. Database User**
```
Name: DB_USER
Value: [YOUR MYSQL USERNAME]
```
Example: `root` or `admin`

**4. Database Password**
```
Name: DB_PASSWORD
Value: [YOUR MYSQL PASSWORD]
```

**5. Database Name**
```
Name: DB_NAME
Value: node_mysql_api
```

**6. JWT Secret** (generate using this command in terminal)
```bash
openssl rand -hex 32
```
Then add:
```
Name: JWT_SECRET
Value: [paste the output from above]
```

**7. Email Settings**
```
Name: EMAIL_FROM
Value: noreply@example.com

Name: SMTP_HOST
Value: smtp.ethereal.email

Name: SMTP_PORT
Value: 587

Name: SMTP_USER
Value: fletcher94@ethereal.email

Name: SMTP_PASSWORD
Value: H1f4TPNGh52cAEPP68
```

### Step 4: Redeploy

1. Go back to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

### Step 5: Test

Visit: `https://jslimos nero-ipt-2026-backend.vercel.app`

You should see:
```json
{
  "message": "Node.js Sign-up and Verification API",
  "status": "running",
  "docs": "/api-docs"
}
```

### Step 6: View Swagger Docs

Visit: `https://jslimosnero-ipt-2026-backend.vercel.app/api-docs`

## Important Notes

⚠️ **Your Database Must Be Accessible from Vercel**
- If using localhost MySQL, you MUST use a cloud database (AWS RDS, DigitalOcean, etc.)
- If database is behind firewall, add Vercel's IP addresses to whitelist
- Vercel IPs: https://vercel.com/docs/concepts/edge-network/regions

⚠️ **Check Vercel Logs if Still Failing**
1. Go to Deployments
2. Click the deployment
3. Click "Function logs" 
4. Look for error messages about database connection

## Troubleshooting

### Still Getting 500 Error?
Check the function logs in Vercel to see what's happening:
- Database connection errors?
- Missing environment variables?
- Import path issues?

### Database Not Connecting?
```bash
# Test MySQL connection locally first with production credentials
mysql -h [DB_HOST] -u [DB_USER] -p [DB_PASSWORD]
```

### Email Not Working?
1. Verify SMTP credentials are correct
2. Test with Ethereal Email (free for testing)
3. Check email logs in SMTP provider

## Local Development (Optional)

Create `.env.local` file with same variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=node_mysql_api
JWT_SECRET=your_secret
...
```

Then run:
```bash
npm run start:dev
```
