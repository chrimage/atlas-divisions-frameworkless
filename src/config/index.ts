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

/**
 * Get configuration with environment-specific overrides applied
 */
export function getConfig(environment: string = "production"): typeof CONFIG {
  const baseConfig = { ...CONFIG };
  
  if (environment !== "production" && CONFIG.environments[environment as keyof typeof CONFIG.environments]) {
    const envOverrides = CONFIG.environments[environment as keyof typeof CONFIG.environments];
    return mergeConfig(baseConfig, envOverrides);
  }
  
  return baseConfig;
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(base: any, overrides: any): any {
  const result = { ...base };
  
  for (const key in overrides) {
    if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      result[key] = mergeConfig(base[key] || {}, overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  
  return result;
}

/**
 * Validate configuration on startup
 */
export function validateConfig(config: typeof CONFIG): string[] {
  const errors: string[] = [];
  
  if (!config.company.name || config.company.name === "Your Company Name") {
    errors.push("Please update CONFIG.company.name in src/config.ts");
  }
  
  if (config.contactForm.serviceTypes.length === 0) {
    errors.push("At least one service type must be configured");
  }
  
  if (config.security.allowedAdminEmails.some(email => email.includes("yourdomain.com"))) {
    errors.push("Please update admin email addresses in CONFIG.security.allowedAdminEmails");
  }
  
  // Security configuration validation
  if (config.security.cors.allowedOrigins.length === 0) {
    errors.push("SECURITY WARNING: Please configure specific allowed origins in CONFIG.security.cors.allowedOrigins (currently allowing all origins)");
  }
  
  if (config.security.cors.allowedOrigins.includes("*")) {
    errors.push("SECURITY WARNING: Wildcard '*' in CORS origins is not recommended for production");
  }
  
  if (!config.security.cloudflareAccessTeamName) {
    errors.push("SECURITY WARNING: Please set CONFIG.security.cloudflareAccessTeamName for JWT signature verification");
  }
  
  return errors;
}