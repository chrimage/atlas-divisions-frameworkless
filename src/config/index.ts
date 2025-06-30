/**
 * Main Configuration Index
 * Combines all configuration modules and provides environment overrides
 */

import { BRAND_CONFIG } from './brand.js';
import { CONTACT_CONFIG } from './contact.js';
import { WEBSITE_CONFIG } from './website.js';
import { SECURITY_CONFIG } from './security.js';

// Combined configuration object (maintains backwards compatibility)
export const CONFIG = {
  ...BRAND_CONFIG,
  ...CONTACT_CONFIG,
  ...WEBSITE_CONFIG,
  ...SECURITY_CONFIG,

  // Merge features for backwards compatibility
  features: {
    ...CONTACT_CONFIG.contactFeatures,
    ...WEBSITE_CONFIG.websiteFeatures
  },

  // Environment-specific overrides
  environments: {
    development: {
      company: {
        name: "Atlas Divisions (DEV)"
      },
      features: {
        enableEmailNotifications: false // Disable emails in dev
      }
    },
    staging: {
      company: {
        name: "Atlas Divisions (STAGING)"
      }
    }
  }
};

// Export individual configs for feature modules
export { BRAND_CONFIG } from './brand.js';
export { CONTACT_CONFIG } from './contact.js';
export { WEBSITE_CONFIG } from './website.js';
export { SECURITY_CONFIG } from './security.js';

import type { Env } from '../types/index.js'; // Import Env type

/**
 * Get configuration with environment-specific overrides applied
 */
export function getConfig(environment: string = "production", env?: Env): typeof CONFIG {
  let baseConfig = JSON.parse(JSON.stringify(CONFIG)); // Deep clone to avoid modifying original CONFIG

  // Apply environment-specific overrides from CONFIG.environments
  if (environment !== "production" && CONFIG.environments[environment as keyof typeof CONFIG.environments]) {
    const envOverrides = CONFIG.environments[environment as keyof typeof CONFIG.environments];
    baseConfig = mergeConfig(baseConfig, envOverrides);
  }

  // Populate security settings from environment variables if env is provided
  if (env) {
    if (env.ALLOWED_ADMIN_EMAILS) {
      baseConfig.security.allowedAdminEmails = env.ALLOWED_ADMIN_EMAILS.split(',').map(email => email.trim()).filter(email => email.length > 0);
    }
    if (env.CLOUDFLARE_ACCESS_TEAM_NAME) {
      baseConfig.security.cloudflareAccessTeamName = env.CLOUDFLARE_ACCESS_TEAM_NAME;
    }
    // Populate other env vars like API keys if they were part of the main config structure
    // For example, if MG_API_KEY was in CONFIG.email.mailgunApiKey
    if (env.MG_API_KEY) {
        // Assuming you might add this to your config structure later, e.g., baseConfig.email.mailgunApiKey = env.MG_API_KEY;
        // For now, MG_API_KEY is used directly from `env` in email.ts, which is fine.
    }
  }
  
  return baseConfig;
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(base: any, overrides: any): any {
  const result = { ...base };
  
  for (const key in overrides) {
    if (overrides.hasOwnProperty(key)) {
      if (typeof overrides[key] === 'object' && overrides[key] !== null && !Array.isArray(overrides[key]) && base[key] && typeof base[key] === 'object') {
        result[key] = mergeConfig(base[key], overrides[key]);
      } else {
        result[key] = overrides[key];
      }
    }
  }
  
  return result;
}

/**
 * Validate configuration on startup
 */
export function validateConfig(config: typeof CONFIG, env?: Env): string[] {
  const errors: string[] = [];
  
  if (!config.company.name || config.company.name === "Your Company Name" || config.company.name.includes("(DEV)") || config.company.name.includes("(STAGING)")) {
    // This check might be too strict if "(DEV)" is intentional for dev environment.
    // Consider making it a warning or checking against env.ENVIRONMENT.
    if (env?.ENVIRONMENT === 'production' && (!config.company.name || config.company.name === "Your Company Name")) {
       errors.push("Production Environment: Please update CONFIG.company.name in src/config/brand.ts or environment overrides.");
    }
  }
  
  if (config.contactForm.serviceTypes.length === 0) {
    errors.push("At least one service type must be configured in src/config/contact.ts");
  }
  
  // Validating based on populated config values from env vars
  if (config.features.enableCloudflareAccess && !config.security.cloudflareAccessTeamName) {
    errors.push("SECURITY WARNING: Cloudflare Access is enabled, but CLOUDFLARE_ACCESS_TEAM_NAME is not set in environment variables. JWT signature verification will be skipped or fail.");
  }
  
  if (config.features.enableAdminAuth && !config.features.enableCloudflareAccess && config.security.allowedAdminEmails.length === 0) {
    errors.push("SECURITY WARNING: Basic admin auth is enabled, but ALLOWED_ADMIN_EMAILS is not set or empty in environment variables. No admin will be able to log in.");
  }
  
  // Check for default placeholder emails if basic admin auth is the sole method.
  if (config.features.enableAdminAuth && !config.features.enableCloudflareAccess && config.security.allowedAdminEmails.some(email => email.includes("yourdomain.com"))) {
      errors.push("SECURITY WARNING: ALLOWED_ADMIN_EMAILS seems to contain placeholder '@yourdomain.com' emails. Please update with actual admin emails in your environment variables.");
  }

  if (config.security.cors.allowedOrigins.length === 0 && env?.ENVIRONMENT === 'production') {
    errors.push("SECURITY WARNING (Production): CORS allowedOrigins is empty. This will likely block all cross-origin requests. Please set it via environment variable or config.");
  } else if (config.security.cors.allowedOrigins.includes("*")) {
    errors.push("SECURITY WARNING: CORS allowedOrigins includes '*'. This is not recommended for production. Configure specific origins.");
  }

  // Validate Mailgun settings if email notifications are enabled
  if (config.features.enableEmailNotifications) {
    if (!env?.MG_DOMAIN) {
      errors.push("Email notifications enabled, but MG_DOMAIN is not set in environment variables.");
    }
    if (!env?.MG_API_KEY) {
      errors.push("Email notifications enabled, but MG_API_KEY is not set in environment variables.");
    }
    if (!env?.ADMIN_EMAIL) {
      errors.push("Email notifications enabled, but ADMIN_EMAIL (recipient) is not set in environment variables.");
    }
    if (!env?.FROM_EMAIL) {
      errors.push("Email notifications enabled, but FROM_EMAIL (sender) is not set in environment variables.");
    }
  }
  
  return errors;
}