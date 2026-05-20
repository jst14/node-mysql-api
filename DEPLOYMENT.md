# Vercel Deployment Guide

## Setup Steps

### 1. Update Your Git Repository
Make sure all changes are committed and pushed to your Git repository:

```bash
git add .
git commit -m "Add Vercel serverless deployment configuration"
git push
```

### 2. Set Up Vercel Environment Variables

Go to your Vercel project settings and add the following environment variables:

**Database Configuration:**
- `DB_HOST` - Your MySQL database host (e.g., `mysql.yourdomain.com`)
- `DB_PORT` - Your MySQL database port (default: `3306`)
- `DB_USER` - Your MySQL username
- `DB_PASSWORD` - Your MySQL password
- `DB_NAME` - Your database name (e.g., `node_mysql_api`)

**Security:**
- `JWT_SECRET` - A strong secret key for JWT token generation (e.g., use: `openssl rand -hex 32`)

**Email Configuration:**
- `EMAIL_FROM` - The sender email address (e.g., `noreply@yourdomain.com`)
- `SMTP_HOST` - Your SMTP server host
- `SMTP_PORT` - Your SMTP server port
- `SMTP_USER` - Your SMTP username
- `SMTP_PASSWORD` - Your SMTP password

### 3. Database Connection from Vercel

⚠️ **Important:** Make sure your MySQL database is accessible from Vercel's servers. You may need to:
- Whitelist Vercel's IP ranges
- Use a managed database service (AWS RDS, DigitalOcean, etc.)
- Enable public access with proper firewall rules

### 4. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on each push to main branch
3. Environment variables are already set in project settings

#### Option B: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### 5. Verify Deployment

After deployment, test your API:

```bash
# Health check
curl https://your-vercel-app.vercel.app/health

# Swagger docs
https://your-vercel-app.vercel.app/api-docs

# Test authentication endpoint
curl -X POST https://your-vercel-app.vercel.app/accounts/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Function Timeout
If you get "FUNCTION_INVOCATION_FAILED" errors:
- Check database connection from Vercel IP
- Verify all environment variables are set
- Review database query performance
- Increase Vercel function timeout (can go up to 60 seconds)

### Database Connection Errors
- Verify all `DB_*` environment variables are correct
- Check if database server is accessible from Vercel
- Review database firewall/security rules
- Test connection locally first with production credentials

### Email Not Sending
- Verify SMTP credentials in environment variables
- Check SMTP service isn't blocking Vercel IPs
- Review email logs in your SMTP provider
- Test with a simpler SMTP service first (e.g., Ethereal Email for testing)

### Swagger Documentation Issues
- Verify swagger.yaml is included in deployment
- Check that relative server URL `/` is working
- Test API endpoints directly in Swagger UI

## Local Development

For local development with the same environment setup:

Create a `.env.local` file:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=node_mysql_api
JWT_SECRET=your_secret
EMAIL_FROM=test@example.com
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_email@ethereal.email
SMTP_PASSWORD=your_ethereal_password
```

Then run:
```bash
npm run start:dev
```

## Files Changed for Deployment

- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless function handler
- `.vercelignore` - Files to ignore during deployment
- Updated `_helpers/db.ts` - Environment variable support
- Updated `_helpers/swagger.ts` - Better path handling
- Updated `accounts/account.service.ts` - JWT secret from env
- Updated `_middleware/authorize.ts` - JWT secret from env
- Updated `_helpers/send-email.ts` - SMTP config from env
- `swagger.yaml` - Updated server URLs for production
- `config.example.json` - Template showing all configurable options
