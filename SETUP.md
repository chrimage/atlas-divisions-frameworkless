# Contact Form & Admin Panel Setup Guide

This guide walks you through setting up the contact form and admin panel system on Cloudflare Workers, for both local development and production deployment.

## 🚀 Overview

This system provides:
- **Contact Form**: For customer inquiries.
- **Admin Panel**: Secure dashboard to manage submissions.
- **Email Notifications**: Via Mailgun (configured with secrets).
- **Database Storage**: Submissions stored in Cloudflare D1.

## 📋 Prerequisites

- **Cloudflare Account** (free tier generally sufficient).
- **Domain registered with Cloudflare** (for email sending via Mailgun and potentially for custom worker domains).
- **Mailgun Account** (for sending email notifications).
- **Node.js 18+** installed locally.
- **Git** for cloning the repository.

## 🛠️ Part 1: Initial Project Setup (Common for Local & Prod)

1.  **Clone the Repository:**
    ```bash
    git clone <your-repo-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Wrangler CLI Globally:**
    ```bash
    npm install -g wrangler
    ```

4.  **Login to Cloudflare with Wrangler:**
    ```bash
    wrangler login
    ```
    This will open a browser window for you to authorize Wrangler.

5.  **Identify Your Cloudflare Account ID:**
    Run `wrangler whoami`. Note your Account ID.
    **Recommended:** Set this as an environment variable for your terminal session or CI/CD environment:
    ```bash
    export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
    # Add to your shell profile (e.g., .bashrc, .zshrc) to make it permanent
    ```
    If set, Wrangler will automatically use it, and you can omit `account_id` from `wrangler.jsonc`.

## ⚙️ Part 2: Configuration Files

This project uses `wrangler.jsonc` for worker configuration and `.dev.vars` for local development secrets.

1.  **Copy `wrangler.example.jsonc` to `wrangler.jsonc`:**
    ```bash
    cp wrangler.example.jsonc wrangler.jsonc
    ```
    - Review `wrangler.jsonc`. You will need to update `database_name` and `database_id` later.
    - The `vars` section in `wrangler.jsonc` can be left as is for local development if you use `.dev.vars`, or you can fill them for local use if you prefer (but **do not commit secrets**). For production, these `vars` will be ignored in favor of secrets set via `wrangler secret put`.

2.  **Create `.dev.vars` for Local Development Secrets:**
    Create a file named `.dev.vars` in the project root. This file is gitignored.
    Add your local development secrets/variables here. For example:
    ```ini
    # .dev.vars (for local development with wrangler dev)
    FROM_EMAIL="localtest@yourdomain.com"
    ADMIN_EMAIL="localadmin@example.com"
    MG_DOMAIN="sandboxYOUR_MG_DOMAIN.mailgun.org" # Use your Mailgun sandbox or a test domain
    MG_API_KEY="key-yourlocalsandboxapikey"       # Your Mailgun API key (sandbox or real)
    ALLOWED_ADMIN_EMAILS="localadmin@example.com"
    CLOUDFLARE_ACCESS_TEAM_NAME="" # If testing Access locally, your team name here
    CORS_ALLOWED_ORIGINS="http://localhost:8787" # Adjust if your local frontend runs elsewhere
    ENVIRONMENT="development"
    ```
    `wrangler dev` will automatically load variables from `.dev.vars` into your worker's environment.

## 💾 Part 3: Database Setup

You'll need a D1 database for storing submissions. You can create separate databases for local development and production.

### For Local Development (Optional, but Recommended)

1.  **Create a Local D1 Database:**
    Choose a name (e.g., `your-contact-db-dev`).
    ```bash
    wrangler d1 create your-contact-db-dev
    ```
    Note the `database_id` output.

2.  **Update `wrangler.jsonc` for Local D1:**
    In `wrangler.jsonc`, update the `d1_databases` section with your local DB details:
    ```json
    "d1_databases": [
      {
        "binding": "DB", // Keep this binding name
        "database_name": "your-contact-db-dev",
        "database_id": "YOUR_LOCAL_D1_DATABASE_ID_HERE"
        // Optional: "preview_database_id": "YOUR_PREVIEW_D1_ID_HERE"
      }
    ],
    ```

3.  **Apply Schema to Local D1:**
    ```bash
    wrangler d1 execute your-contact-db-dev --file=schema.sql --local
    ```

### For Production Deployment

1.  **Create a Production D1 Database:**
    Choose a name (e.g., `your-contact-db-prod`).
    ```bash
    wrangler d1 create your-contact-db-prod
    ```
    Note the `database_id` output. This ID is a **production secret**.

2.  **Update `wrangler.jsonc` for Production D1:**
    If you are using a single `wrangler.jsonc` and overriding for environments, ensure the `database_id` for your production environment is correctly referenced (e.g., within an `env.production` block or by having a separate `wrangler.prod.jsonc`).
    For a simple setup, you might directly edit your main `wrangler.jsonc` before a production deploy to point to the production `database_id`.
    Example for `wrangler.jsonc` (if not using env blocks for D1):
    ```json
    "d1_databases": [
      {
        "binding": "DB",
        "database_name": "your-contact-db-prod", // Production DB name
        "database_id": "YOUR_PRODUCTION_D1_DATABASE_ID_HERE"
      }
    ],
    ```

3.  **Apply Schema to Production D1 (during deployment steps):**
    This is typically done *after* the first deployment or as part of the deployment process.
    ```bash
    # This command will be run later, in the deployment section
    # wrangler d1 execute your-contact-db-prod --file=schema.sql --remote
    ```

## 📧 Part 4: Email Setup (Mailgun & Cloudflare)

This project uses Mailgun for reliable email sending.

1.  **Configure Mailgun:**
    - Sign up for a Mailgun account.
    - Add and verify a domain you own (e.g., `mg.yourdomain.com`) for sending emails. Follow Mailgun's instructions for DNS records (MX, TXT for SPF/DKIM).
    - Note your Mailgun Domain and your Private API Key. These are **production secrets**.

2.  **Cloudflare Email Routing (for Receiving Replies - Optional but Recommended):**
    If you want replies to notification emails (`FROM_EMAIL`) to go to a specific inbox:
    - In Cloudflare Dashboard: **Email** → **Email Routing**.
    - Configure a destination address (e.g., `support@yourdomain.com`) and verify it.
    - Ensure your `FROM_EMAIL` (used in secrets) is an address on a domain with Email Routing enabled if you expect replies to be routed by Cloudflare.

## 🔐 Part 5: Production Secrets Configuration

For production, all sensitive variables **MUST** be set as secrets using Wrangler.
These include: `FROM_EMAIL`, `ADMIN_EMAIL`, `MG_DOMAIN`, `MG_API_KEY`, `ALLOWED_ADMIN_EMAILS`, `CLOUDFLARE_ACCESS_TEAM_NAME` (if used), and `ENVIRONMENT` (set to "production").

```bash
# Run these commands in your terminal, replacing placeholders with your actual values:
wrangler secret put FROM_EMAIL # (e.g., noreply@mg.yourdomain.com)
wrangler secret put ADMIN_EMAIL # (e.g., admin@yourcompany.com)
wrangler secret put MG_DOMAIN # (e.g., mg.yourdomain.com)
wrangler secret put MG_API_KEY # (Paste your Mailgun Private API Key)
wrangler secret put ALLOWED_ADMIN_EMAILS # (e.g., "admin1@example.com,admin2@example.com")
wrangler secret put CLOUDFLARE_ACCESS_TEAM_NAME # (If using CF Access, e.g., "your-team-name")
wrangler secret put CORS_ALLOWED_ORIGINS # (e.g., "https://yourfrontenddomain.com,https://anotherdomain.com")
wrangler secret put ENVIRONMENT # (Set to "production")

# For a specific environment (e.g., staging), use --env flag:
# wrangler secret put MG_API_KEY --env staging
```
**Important:** `CLOUDFLARE_ACCOUNT_ID` should be set as an environment variable in your CI/CD system or deployment shell. The D1 `database_id` for production needs to be in the `wrangler.jsonc` used for the production deployment.

## 🖥️ Part 6: Local Development & Testing

1.  **Ensure Local D1 is Configured:** Your `wrangler.jsonc` should point to your local D1 DB ID, and schema should be applied.
2.  **Ensure `.dev.vars` is populated** with your local Mailgun settings (sandbox or test keys) and other variables.
3.  **Start the Local Development Server:**
    ```bash
    npm run dev
    # This is typically: wrangler dev --local --persist --ip 0.0.0.0
    ```
    - Worker accessible at `http://localhost:8787` (or as specified).
    - Test contact form submission. Check console for database logs and Mailgun for email logs (if using real test keys).
    - Test admin panel at `http://localhost:8787/admin`.

## 🚀 Part 7: Production Deployment

1.  **Ensure `wrangler.jsonc` is Correct for Production:**
    - `account_id` is set (or `CLOUDFLARE_ACCOUNT_ID` env var is available).
    - `d1_databases` section points to your **production** `database_name` and `database_id`.
    - Worker `name` is appropriate for production.

2.  **Deploy the Worker:**
    You can specify a name for the worker if it's different from `wrangler.jsonc`:
    ```bash
    npm run deploy
    # This is typically: wrangler deploy src/index.ts --name your-production-worker-name
    ```
    If your `wrangler.jsonc` is fully configured for production (name, D1 prod ID), then `wrangler deploy` is enough.

3.  **Apply/Verify Database Schema to Production D1:**
    (If not already applied, or to ensure it's up-to-date)
    ```bash
    wrangler d1 execute your-contact-db-prod --file=schema.sql --remote
    ```
    Replace `your-contact-db-prod` with your actual production D1 database name.

4.  **Set up Cloudflare Access for Admin Panel (Recommended):**
    - Go to Cloudflare Dashboard → **Zero Trust** → **Access** → **Applications**.
    - Add a "Self-hosted" application:
        - **Application name**: e.g., `Contact Form Admin`
        - **Session duration**: e.g., `24 hours`
        - **Application domain**: Your worker's production URL (e.g., `your-worker-name.your-account.workers.dev`)
        - **Path**: `/admin*`
    - Create an Access Policy:
        - **Policy name**: e.g., `Admin Access`
        - **Action**: `Allow`
        - **Configure rules**: Include based on Email, Email ending in, Okta group, etc.
    - Ensure `CLOUDFLARE_ACCESS_TEAM_NAME` secret is set to your Cloudflare Access team name/domain.
    - Update `src/config/security.ts` (or equivalent config file) to enable Cloudflare Access: `enableCloudflareAccess: true`. Re-deploy if you change this code.

5.  **Alternative: Basic Email Protection for Admin Panel:**
    If not using Cloudflare Access:
    - Ensure `ALLOWED_ADMIN_EMAILS` secret contains the correct comma-separated list of admin emails.
    - In `src/config/security.ts` (or equivalent): `enableCloudflareAccess: false`, `enableAdminAuth: true`. Re-deploy if you change this code.

## 🧪 Part 8: Post-Deployment Testing

- **Contact Form:** Test submission on the live URL.
- **Email Notifications:** Verify admin receives email via Mailgun. Check Mailgun logs.
- **Admin Panel:** Test access (including auth flow), submission visibility, and status updates.
- **Security:** Double-check that no secrets are in your Git repository. Review `DEPLOYMENT_CHECKLIST.md` for critical security checks.

## 🔧 Part 9: Customization & Advanced Configuration

### Non-Sensitive Configuration
Edit files in `src/config/` (e.g., `brand.ts`, `contact.ts`, `website.ts`) to customize:
- Company name, tagline
- Service types for the contact form
- UI text, branding colors (if defined in TS)

### HTML Templates & Styling
Modify HTML templates directly (often within `.ts` files generating HTML strings) or referenced static HTML/CSS files for:
- Page titles, logos, layout
- Form fields (if not dynamically generated from TS config)

### Multiple Environments (e.g., Staging)
- Use the `env` block in `wrangler.jsonc` to define configurations for different environments (e.g., `staging`).
  ```json
  // In wrangler.jsonc
  "env": {
    "staging": {
      "name": "your-contact-form-staging",
      "vars": { "ENVIRONMENT": "staging" }, // Other vars via `wrangler secret put VAR --env staging`
      "d1_databases": [{
          "binding": "DB",
          "database_name": "your-contact-db-staging",
          "database_id": "YOUR_STAGING_D1_ID_HERE"
      }]
    }
  }
  ```
- Deploy with `wrangler deploy --env staging`.
- Set secrets for this environment: `wrangler secret put SOME_VAR --env staging`.

### Custom Domain
- Configure in Cloudflare Dashboard: Select your Worker → Triggers → Custom Domains.
- Point your desired domain/subdomain (e.g., `contactapi.yourdomain.com`) to the worker.

### Customizing `package.json` Scripts
The `package.json` file contains helper scripts for deployment and database operations (e.g., `deploy:prod`, `db:prod:seed`). You **MUST** customize these scripts with your actual production/staging worker names and D1 database names. For example:
```json
// Example snippet from package.json scripts:
"deploy:prod": "wrangler deploy src/index.ts --name your-atlas-contact-prod && npm run db:prod:seed",
"db:prod:seed": "wrangler d1 execute YOUR_PROD_D1_DB_NAME --file=./schema.sql --remote",
```
Replace `your-atlas-contact-prod` with your chosen production worker name, and `YOUR_PROD_D1_DB_NAME` with your actual production D1 database name. Do similarly for staging or other environments.

## 🐛 Troubleshooting

(Troubleshooting section remains largely the same as original, ensure it's still relevant)
... (keep existing troubleshooting content) ...

## 🔐 Security Best Practices

(This section should also be reviewed and updated to strongly reflect the new secret management)

### Configuration File Security
1.  **NEVER commit sensitive configuration files or values** to your repository.
    - `wrangler.jsonc` should not contain production secrets. Use it for structural config; runtime secrets are injected by Cloudflare from `wrangler secret put`.
    - `.dev.vars` is for local development secrets ONLY and MUST be in `.gitignore`.
    - Template files (`wrangler.example.jsonc`, `.env.example`) are safe.
2.  **Use `wrangler secret put VAR_NAME` for ALL production runtime variables/secrets.**
    - This includes API keys, email addresses, domain names specific to services, etc.
    - For CI/CD, ensure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set as secure environment variables in the CI system.
3.  **Regularly audit `.gitignore`** to ensure no sensitive files are accidentally tracked.
    ```bash
    git status --ignored | grep -E "(wrangler\.jsonc|\.env$|\.dev\.vars)"
    # Ensure actual wrangler.jsonc (if it ever holds temp secrets) & .dev.vars appear here
    ```
... (keep and refine other security best practices: Access Control, Operational, Development Security) ...

## 💰 Cost Estimation
... (keep existing cost estimation) ...

## 📞 Support
... (keep existing support section) ...

## 🚀 Next Steps
... (keep existing next steps) ...

---

**Congratulations!** 🎉 You now have a more streamlined process for deploying your contact form and admin panel.