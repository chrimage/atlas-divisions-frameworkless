# Deployment Verification Checklist ✅

This checklist is for verifying a production deployment AFTER following the instructions in `SETUP.md`.

## 📋 Pre-Requisites Verification (from `SETUP.md`)

### ✅ Cloudflare Account & Domain
- [ ] Cloudflare account is active.
- [ ] Domain is registered with Cloudflare and active.
- [ ] `CLOUDFLARE_ACCOUNT_ID` environment variable is set in the deployment environment (e.g., CI/CD).

### ✅ Mailgun Setup
- [ ] Mailgun account is active.
- [ ] Sending domain is configured and verified in Mailgun (with correct DNS records like SPF, DKIM).
- [ ] Mailgun Domain and API Key are noted for secret configuration.

### ✅ Project Code
- [ ] Latest stable version of the project code is checked out.
- [ ] `npm install` has been run successfully.
- [ ] Wrangler CLI is installed and logged in (`wrangler login`).

## ⚙️ Configuration Verification (Production)

### ✅ D1 Database (Production)
- [ ] Production D1 database created (`wrangler d1 create your-contact-db-prod`).
- [ ] Production D1 `database_id` is correctly configured in the `wrangler.jsonc` (or equivalent environment-specific config) used for deployment.
- [ ] Database schema applied to production D1 (`wrangler d1 execute your-contact-db-prod --file=schema.sql --remote`).

### ✅ 🔐 Production Secrets in Cloudflare
- [ ] All required production secrets are set using `wrangler secret put`:
    - [ ] `FROM_EMAIL` (e.g., `noreply@mg.yourdomain.com`)
    - [ ] `ADMIN_EMAIL` (notification recipient)
    - [ ] `MG_DOMAIN` (your Mailgun sending domain)
    - [ ] `MG_API_KEY` (your Mailgun private API key)
    - [ ] `ALLOWED_ADMIN_EMAILS` (if using basic auth for admin panel)
    - [ ] `CLOUDFLARE_ACCESS_TEAM_NAME` (if using Cloudflare Access for admin panel, e.g., "your-team.cloudflareaccess.com")
    - [ ] `ENVIRONMENT` (set to "production")
- [ ] **SECURITY CHECK:** No production secrets are present in `wrangler.jsonc`, `.dev.vars`, or any other committed file.

### ✅ `wrangler.jsonc` (Production Context)
- [ ] Worker `name` is correct for the production deployment.
- [ ] `account_id` is correctly set (or `CLOUDFLARE_ACCOUNT_ID` env var is used).
- [ ] `d1_databases` binding points to the correct production database name and ID.
- [ ] `compatibility_date` and `compatibility_flags` are appropriate.

### ✅ Application Code Configuration (`src/config/`)
- [ ] Non-sensitive configurations (company name, service types, UI text in `src/config/*.ts`) are correct for production.
- [ ] `src/config/security.ts` (or equivalent) correctly enables/disables Cloudflare Access (`enableCloudflareAccess`) and basic admin auth (`enableAdminAuth`) as per chosen method.

## 🔐 Admin Panel Security Verification

**Choose one path based on `SETUP.md` Part 7, Step 4 or 5:**

**Option A: Cloudflare Access (Recommended)**
- [ ] Cloudflare Access application created for the worker's production URL and `/admin*` path.
- [ ] Access policy correctly defines who can access (e.g., specific email addresses, groups).
- [ ] Authentication methods for Access are configured (e.g., Email OTP, Google).
- [ ] `CLOUDFLARE_ACCESS_TEAM_NAME` secret matches the Cloudflare Access team/auth domain.
- [ ] `enableCloudflareAccess: true` is set in the worker's code configuration (and deployed).

**Option B: Basic Email Validation**
- [ ] `ALLOWED_ADMIN_EMAILS` secret contains the correct, comma-separated list of admin email addresses.
- [ ] `enableCloudflareAccess: false` and `enableAdminAuth: true` are set in the worker's code configuration (and deployed).

**Option C: No Authentication (NOT FOR PRODUCTION)**
- [ ] **WARNING:** This should NOT be the case for a production deployment. Verify `enableAdminAuth: false` is NOT set for production.

## 🚀 Deployment Verification

### ✅ Worker Deployment
- [ ] Worker deployed successfully to production (`npm run deploy` or `wrangler deploy ...`).
- [ ] No deployment errors in Wrangler output.
- [ ] Production worker URL is accessible (e.g., `https://your-worker-name.your-account.workers.dev`).

## 🧪 Post-Deployment Testing (Critical Functionality)

### ✅ Contact Form
- [ ] Production contact form page loads correctly.
- [ ] Form submission with valid data results in a success message/page.
- [ ] Attempted submission with invalid data shows validation errors.

### ✅ Email Notification (via Mailgun)
- [ ] Successful form submission triggers an email to the `ADMIN_EMAIL` secret.
- [ ] Email is received within a reasonable timeframe (check Mailgun logs if delays).
- [ ] Email content is correct and well-formatted.
- [ ] "Reply-to" header in the email is sensible (if configured).

### ✅ Admin Panel Access & Functionality
- [ ] Admin panel URL (`/admin`) loads.
- [ ] Authentication flow (Cloudflare Access or basic JWT check) works as configured.
    - [ ] Unauthorized access attempts are blocked.
- [ ] New submissions from contact form tests appear in the admin panel.
- [ ] Status updates for submissions work correctly.
- [ ] Statistics (if any) display correctly.

### ✅ Critical Security Checks
- [ ] **CRITICAL:** Verify no production secrets have been committed to the repository.
  ```bash
  # Run these commands locally on your checked-out code
  git log --oneline --grep="secret\|password\|key\|token\|MG_API_KEY\|ACCOUNT_ID" --all
  git log --oneline -S "mg.yourdomain.com" --all # Replace with your actual MG domain
  # Add other sensitive placeholder checks if necessary
  ```
- [ ] **CRITICAL:** Confirm `wrangler.jsonc` (if ever containing temp local secrets), `.env` (if used), and `.dev.vars` are properly gitignored.
  ```bash
  git status --ignored | grep -E "(wrangler\.jsonc$|\.env$|\.dev\.vars$)"
  # Ensure these files (if they exist locally with secrets) are listed as ignored.
  ```
- [ ] CORS headers are correctly configured if the form is submitted from a different domain than the worker.
- [ ] No sensitive information is exposed in public-facing error messages.

## 📊 Monitoring & Logging (Initial Check)

### ✅ Observability
- [ ] Cloudflare Worker metrics are visible in the Cloudflare dashboard (Analytics & Monitoring -> Workers).
- [ ] Live logs can be viewed using `wrangler tail --format=pretty` (pointed at the production worker).

## ✅ Custom Domain (If Applicable)
- [ ] Custom domain (e.g., `contact.yourdomain.com`) is correctly configured in Cloudflare DNS.
- [ ] Custom domain route is active in Worker settings (Triggers -> Routes or Custom Domains).
- [ ] SSL certificate for the custom domain is active.
- [ ] Worker responds correctly on the custom domain.

---

**🎊 Congratulations!** Completing this checklist significantly increases confidence in your production deployment. Remember to consult `SETUP.md` for detailed instructions on *how* to achieve these states.