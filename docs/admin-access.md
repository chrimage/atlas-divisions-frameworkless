# Admin Access Configuration Guide

## Overview

This system supports two authentication methods for the admin panel:

1. **Cloudflare Access** (Recommended) - Enterprise-grade authentication with OTP, SSO, etc.
2. **Basic Email Validation** - Simple email-based access control

## Option 1: Cloudflare Access (Recommended)

### Setup Cloudflare Access

1. **Go to Cloudflare Dashboard** → **Zero Trust** → **Access** → **Applications**
2. **Add Application**:
   - **Application name**: `Contact Form Admin`
   - **Application domain**: `your-worker-name.your-subdomain.workers.dev`
   - **Path**: `/admin*`
3. **Create Policy**:
   - **Policy name**: `Admin Team`
   - **Action**: `Allow`
   - **Include**: Email addresses in list
   - **Email list**: Add your admin emails

### How Users Access Admin Panel

1. Go to: `https://your-worker-name.your-subdomain.workers.dev/admin`
2. Cloudflare Access will intercept and show authentication options
3. Choose authentication method (email OTP, Google, etc.)
4. Complete authentication
5. Access granted to admin panel

### Configuration in Code & Environment

1.  **Enable Cloudflare Access in `src/config/contact.ts` (or main `src/config.ts`):**
    ```typescript
    // In CONTACT_CONFIG or feature flags section of main CONFIG
    contactFeatures: { // or 'features' in older config structure
      enableCloudflareAccess: true,
      enableAdminAuth: true // Should also be true to enable any admin auth check
    }
    ```
2.  **Set `CLOUDFLARE_ACCESS_TEAM_NAME` Environment Variable:**
    *   Set this environment variable (e.g., in `wrangler.jsonc` for deployments or `.env`/`.dev.vars` for local development) to your Cloudflare Access team name (e.g., "your-team" if your Access URL is `your-team.cloudflareaccess.com`). This is crucial for JWT signature validation.

## Option 2: Basic Email Validation

### Configuration in Code & Environment

1.  **Disable Cloudflare Access and Enable Basic Auth in `src/config/contact.ts` (or main `src/config.ts`):**
    ```typescript
    // In CONTACT_CONFIG or feature flags section of main CONFIG
    contactFeatures: { // or 'features' in older config structure
      enableCloudflareAccess: false,
      enableAdminAuth: true
    }
    ```
2.  **Set `ALLOWED_ADMIN_EMAILS` Environment Variable:**
    *   Set this environment variable to a comma-separated list of email addresses that are allowed admin access (e.g., `"admin1@example.com,superadmin@example.com"`).

### How It Works

- System checks the JWT token from Cloudflare for the user's email (this JWT is usually present if the user has authenticated with Cloudflare for any application on the domain).
- If the user's email is in the list provided by the `ALLOWED_ADMIN_EMAILS` environment variable, access is granted.
- If not, access is denied.

### Adding New Admin Users

1. Update the `ALLOWED_ADMIN_EMAILS` environment variable (e.g., in `wrangler.jsonc` or via `wrangler secret put ALLOWED_ADMIN_EMAILS`).
2. Redeploy the worker if you changed `wrangler.jsonc` vars. Secrets update automatically.

## Option 3: Disable Authentication (Not Recommended)

For development or internal use only:

```typescript
features: {
  enableCloudflareAccess: false,
  enableAdminAuth: false
}
```

**⚠️ Warning**: This makes the admin panel publicly accessible!

## Troubleshooting

### Cloudflare Access Issues
- **No authentication prompt?** Check application domain and path settings
- **Access denied after auth?** Verify user email is in the policy
- **Stuck in redirect loop?** Check if path includes `/admin*`

### Basic Email Validation Issues
- **Access denied?** Check if email is in `allowedAdminEmails` array
- **No JWT token?** User may need to authenticate through Cloudflare first
- **Token expired?** User needs to refresh the page

### General Issues
- **404 on /admin?** Check worker deployment and routes
- **Can't see submissions?** Check database connection and schema
- **Page won't load?** Check worker logs: `wrangler tail`

## Security Best Practices

1. **Always use Cloudflare Access** for production deployments
2. **Limit admin emails** to only those who need access
3. **Monitor access logs** in Cloudflare dashboard
4. **Regular review** of admin user list
5. **Use strong authentication** methods (2FA, SSO)

## Emergency Access

If you're locked out of admin panel:

1. **Check Cloudflare Access logs** in dashboard
2. **Update configuration** in `src/config.ts` and redeploy
3. **Use Wrangler CLI** to check database directly:
   ```bash
   wrangler d1 execute your-contact-db --command="SELECT * FROM submissions;" --remote
   ```
4. **Contact your team** for configuration changes

## Next Steps

After setting up admin access:

1. **Test the authentication flow** thoroughly
2. **Document your chosen method** for your team
3. **Set up monitoring** for failed access attempts
4. **Consider backup access methods** for emergencies
