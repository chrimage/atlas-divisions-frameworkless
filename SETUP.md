# Contact Form & Admin Panel Setup Guide

This guide will walk you through setting up your own deployment of this contact form and admin panel system on Cloudflare Workers.

## 🚀 Quick Start Overview

This system provides:
- **Contact Form**: Responsive form for customer inquiries
- **Admin Panel**: Secure dashboard to manage submissions
- **Email Notifications**: Automatic admin notifications via Cloudflare Email
- **Database Storage**: Submissions stored in Cloudflare D1

## 📋 Prerequisites

- **Cloudflare Account** (free tier works)
- **Domain on Cloudflare** (for email routing)
- **Node.js 18+** installed locally
- **Git** for cloning the repository

## 🛠️ Step 1: Initial Setup

### Clone and Install
```bash
git clone <your-repo-url>
cd intake-contact-form
npm install
```

### Install Wrangler CLI
```bash
npm install -g wrangler
```

### Login to Cloudflare
```bash
wrangler login
```

## 🏗️ Step 2: Cloudflare Configuration

### Get Your Account ID
```bash
wrangler whoami
```
Copy your Account ID for later use.

### Create D1 Database
```bash
wrangler d1 create your-contact-db
```

**Important**: Copy the `database_id` from the output - you'll need it in Step 3.

### Apply Database Schema
```bash
wrangler d1 execute your-contact-db --file=schema.sql
```

## 📧 Step 3: Email Routing Setup

### Enable Email Routing in Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Email** → **Email Routing**
2. Click **"Get started"** for your domain
3. Cloudflare will automatically configure MX and SPF records
4. **Add destination addresses** for admin notifications:
   - Go to **Destination addresses**
   - Click **"Add address"**
   - Enter your admin email (e.g., `admin@yourcompany.com`)
   - **Verify the email** by clicking the link sent to your inbox

### Verify DNS Configuration
Cloudflare should automatically add these DNS records:
```
Type: MX
Name: @
Content: route.mx.cloudflare.net
Priority: 10

Type: TXT  
Name: @
Content: v=spf1 include:_spf.mx.cloudflare.net ~all
```

## ⚙️ Step 4: Configure Your Deployment

### 🔐 Configure Your Deployment Securely

**CRITICAL SECURITY STEP:** Copy template files and update with your actual values. **NEVER commit these files to your repository.**

```bash
# Copy template configuration files
cp wrangler.example.jsonc wrangler.jsonc
cp .env.example .env
```

**Update `wrangler.jsonc` with your actual values:**

```jsonc
{
  "name": "your-contact-form",                    // Your worker name
  "account_id": "YOUR_ACCOUNT_ID_HERE",           // From Step 2
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-contact-db",         // Your D1 database name
      "database_id": "YOUR_DATABASE_ID_HERE"     // From Step 2
    }
  ],
  "vars": {
    "FROM_EMAIL": "contact@yourdomain.com",       // Your sending email
    "ADMIN_EMAIL": "admin@yourdomain.com",        // Where notifications go
    // TODO: Add ALLOWED_ADMIN_EMAILS and CLOUDFLARE_ACCESS_TEAM_NAME here
    // Example:
    // "ALLOWED_ADMIN_EMAILS": "admin1@example.com,admin2@example.com",
    // "CLOUDFLARE_ACCESS_TEAM_NAME": "your-team-name",
    "ENVIRONMENT": "production"
  },
  "send_email": [
    {
      "name": "EMAIL_SENDER",
      "allowed_destination_addresses": [
        "admin@yourdomain.com",                   // Must match verified addresses
        "support@yourdomain.com"                  // Add more as needed
      ]
    }
  ]
}
```

**Update `.env` file (optional, for additional security):**

```bash
# Your Cloudflare credentials
CLOUDFLARE_ACCOUNT_ID=your_actual_account_id
CLOUDFLARE_DATABASE_ID=your_actual_database_id

# Email configuration
FROM_EMAIL=contact@yourdomain.com # Sender for notification emails
ADMIN_EMAIL=admin@yourdomain.com # Recipient for notification emails
# MG_DOMAIN=your_mailgun_domain_here # Also in wrangler.jsonc if not using secrets
# MG_API_KEY=your_mailgun_api_key_here # Also in wrangler.jsonc if not using secrets

# Admin Access Configuration
# Comma-separated list of email addresses for basic admin access (if Cloudflare Access is not used or as a fallback).
# This is read by the worker from an environment variable.
ALLOWED_ADMIN_EMAILS="admin1@example.com,admin2@example.com"

# Your Cloudflare Access team name (e.g., "your-team" from "your-team.cloudflareaccess.com")
# Required for JWT signature validation if Cloudflare Access is enabled in the worker config.
# This is read by the worker from an environment variable.
CLOUDFLARE_ACCESS_TEAM_NAME="your-team-name"

# Environment
ENVIRONMENT=development # Set to 'production' for production secrets, 'development' for .dev.vars or .env
```

⚠️ **SECURITY WARNING:** The `.gitignore` file is configured to prevent `wrangler.jsonc` and `.env` files from being committed. Ensure your actual secrets are not in the repository. For production, prefer `wrangler secret put <VAR_NAME>` over `wrangler.jsonc` vars or `.env` files.

### Update Non-Sensitive Configuration Variables

Edit `src/config/brand.ts`, `src/config/contact.ts`, and `src/config/website.ts` (or the main `src/config.ts` for older versions) to customize non-sensitive aspects of your deployment like company name, service types, UI text, etc.
Sensitive values like `allowedAdminEmails` and `cloudflareAccessTeamName` are now managed via environment variables/secrets as described above and in `wrangler.example.jsonc` / `.env.example`.

Example of what you might customize in `src/config/brand.ts`:
```typescript
export const BRAND_CONFIG = {
  company: {
    name: "Atlas Divisions", // Your actual company name
    tagline: "Solutions That Outlast the Storm",
    // ... other brand details
  },
  // ... styling ...
};
```

## 🔐 Step 5: Secure Admin Panel with Cloudflare Access

### Set Up Cloudflare Access (Recommended)

1. **Go to Cloudflare Dashboard** → **Zero Trust** → **Access** → **Applications**

2. **Add an application:**
   - **Application name**: `Contact Form Admin`
   - **Session duration**: `24 hours` 
   - **Application domain**: `your-worker-name.your-subdomain.workers.dev`
   - **Path**: `/admin*`

3. **Create Access Policy:**
   - **Policy name**: `Admin Team`
   - **Action**: `Allow`
   - **Include**: Email addresses
   - **Email addresses**: Add your admin emails

4. **Authentication methods:**
   - ✅ **One-time PIN** (sends code to email)
   - ✅ **Google Workspace** (if applicable)
   - ✅ **Microsoft Azure AD** (if applicable)

### Alternative: Basic Email Protection

If you don't want to use Cloudflare Access (i.e., `features.enableCloudflareAccess` is `false` in `src/config/contact.ts` and `features.enableAdminAuth` is `true`), the system uses basic email-based protection.
Ensure the `ALLOWED_ADMIN_EMAILS` environment variable is set with a comma-separated list of authorized admin email addresses. These emails are checked against the `email` claim in the JWT provided by Cloudflare (e.g., from a general login to your domain, not necessarily a specific Access application).

## 🚀 Step 6: Deploy

### Test Locally First
```bash
npm run dev
# Visit http://localhost:8787
# Test the contact form
# Visit http://localhost:8787/admin
```

### Deploy to Production
```bash
npm run deploy
```

### Apply Database Schema to Production
```bash
wrangler d1 execute your-contact-db --file=schema.sql --remote
```

### Verify Email Setup
After deployment, test the email notifications:
1. Submit a test form
2. Check your admin email for notifications
3. Check the admin panel for the submission

## 📊 Step 7: Test Your Deployment

### Test Contact Form
1. Visit `https://your-worker-name.your-subdomain.workers.dev`
2. Fill out and submit the contact form
3. Verify you see the success message

### Test Admin Panel
1. Visit `https://your-worker-name.your-subdomain.workers.dev/admin`
2. If using Cloudflare Access, complete the authentication
3. Verify you can see submissions and update their status

### Test Email Notifications
1. Submit another test form
2. Check your admin email for the notification
3. Verify the email contains all form details

## 🎨 Step 8: Customize Your Deployment

### Update Branding
Edit the HTML templates in `src/index.ts`:
- Update page titles
- Change colors and styling
- Add your company logo
- Modify form fields as needed

### Add Custom Service Types
Update the service types in your config file to match your business needs.

### Customize Email Templates
Modify the email notification templates in the `sendAdminNotification` function.

## 🔧 Advanced Configuration

### Multiple Environments
Create separate `wrangler.jsonc` files for different environments:
- `wrangler.dev.jsonc` (development)
- `wrangler.staging.jsonc` (staging) 
- `wrangler.prod.jsonc` (production)

Deploy with: `wrangler deploy --config wrangler.prod.jsonc`

### Custom Domain
Set up a custom domain in Cloudflare Dashboard → Workers → your-worker → Settings → Triggers → Custom Domains

### Monitoring and Analytics
- Enable **Workers Analytics** in Cloudflare Dashboard
- Use `wrangler tail` to view real-time logs
- Set up **Logpush** for long-term log storage

## 🐛 Troubleshooting

### Common Issues

**"Not Found" on homepage**
- Check that you don't have conflicting routes
- Verify `main` field in `wrangler.jsonc` points to correct file

**Database connection errors**
- Verify `database_id` matches your D1 instance
- Run schema migration: `wrangler d1 execute DB_NAME --file=schema.sql --remote`

**Email not sending**
- Verify destination addresses are verified in Email Routing
- Check `FROM_EMAIL` is on a domain with Cloudflare Email Routing
- Ensure `allowed_destination_addresses` includes your admin email

**Admin panel not accessible**
- If using Cloudflare Access, verify the application and policy are configured
- Check your email is in the allowed list
- Try accessing in an incognito window

### Debug Commands
```bash
# View real-time logs
wrangler tail --format=pretty

# Check database contents
wrangler d1 execute your-contact-db --command="SELECT * FROM submissions;" --remote

# Test local development
curl -X POST http://localhost:8787/submit \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "service_type=General Inquiry" \
  -F "message=Test message"
```

## 🔐 Security Best Practices

### Configuration File Security
1. **NEVER commit sensitive configuration files** to your repository:
   - `wrangler.jsonc` contains account IDs and database IDs
   - `.env` files contain API keys and credentials
   - Always use template files (`wrangler.example.jsonc`, `.env.example`) in your repo

2. **Use environment variables for sensitive data:**
   ```bash
   # Set secrets using Wrangler CLI (recommended for production)
   wrangler secret put ADMIN_EMAIL
   wrangler secret put CLOUDFLARE_ACCOUNT_ID
   wrangler secret put CLOUDFLARE_DATABASE_ID
   wrangler secret put ALLOWED_ADMIN_EMAILS
   wrangler secret put CLOUDFLARE_ACCESS_TEAM_NAME
   wrangler secret put MG_API_KEY
   wrangler secret put MG_DOMAIN
   # etc. for other secrets
   ```

3. **Verify .gitignore protection:**
   ```bash
   # Check that sensitive files are ignored
   git status
   # Should NOT show wrangler.jsonc or .env files
   ```

### Access Control Security
4. **Always use HTTPS** (automatically enforced by Cloudflare)
5. **Secure admin access** via Cloudflare Access or email verification
6. **Limit admin emails** to only necessary personnel
7. **Use strong authentication methods** (prefer OAuth over email OTP)

### Operational Security
8. **Monitor for abuse** using Cloudflare Analytics
9. **Regular backups** of D1 database (export via dashboard)
10. **Keep dependencies updated** (`npm audit` regularly)
11. **Review access logs** periodically in Cloudflare Dashboard
12. **Rotate secrets** periodically (database IDs, API keys)

### Development Security
13. **Use separate environments** for development, staging, and production
14. **Never use production credentials** in development
15. **Test security controls** before going live
16. **Document security procedures** for your team

## 💰 Cost Estimation

**Free Tier Limits:**
- **Workers**: 100,000 requests/day
- **D1 Database**: 5GB storage, 5M reads/day
- **Email Routing**: Unlimited (no sending limits on contact forms)

**Typical Monthly Costs:**
- **Under 1,000 submissions/month**: $0 (free tier)
- **1,000-10,000 submissions/month**: $0-5
- **10,000+ submissions/month**: $5-20

## 📞 Support

If you run into issues:

1. **Check the troubleshooting section** above
2. **Review Cloudflare documentation**:
   - [Workers](https://developers.cloudflare.com/workers/)
   - [D1 Database](https://developers.cloudflare.com/d1/)
   - [Email Routing](https://developers.cloudflare.com/email-routing/)
3. **Contact your team** for deployment-specific questions

## 🚀 Next Steps

Once your basic deployment is working:

- **Customize the form fields** for your specific use case
- **Add file upload support** using Cloudflare R2
- **Integrate with your CRM** via webhooks or API
- **Add analytics** and reporting features
- **Set up automated testing** with your CI/CD pipeline

---

**Congratulations!** 🎉 You now have a fully functional contact form and admin panel running on Cloudflare's edge network.