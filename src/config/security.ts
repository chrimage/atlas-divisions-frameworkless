/**
 * Security Configuration
 * Security settings, authentication, and permissions
 */

export const SECURITY_CONFIG = {
  // Security Configuration
  security: {
    // Email addresses allowed to access admin panel (if not using Cloudflare Access)
    // These will be populated from environment variables.
    allowedAdminEmails: [] as string[],
    
    // Cloudflare Access team name for JWT verification
    // This will be populated from an environment variable.
    cloudflareAccessTeamName: "",
    
    // CORS configuration
    cors: {
      allowedOrigins: [] as string[], // TODO: In production, specify your domains (remove wildcard)
      allowedMethods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    
    // Content Security Policy configuration
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        // 'unsafe-inline' removed. Inline scripts must use nonces or be externalized.
        'script-src': ["'self'", "https://cdnjs.cloudflare.com"],
        // 'unsafe-inline' removed. Inline styles must use nonces/hashes or be externalized.
        // This may break dynamically injected theme styles from src/styles/theme.ts.
        // TODO: If styles are broken, implement a nonce-based strategy for inline <style> tags
        // or investigate serving theme CSS via a <link> to a dynamically generated CSS file.
        'style-src': ["'self'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:", "https:"], // data: for potential inline SVGs or small images
        'connect-src': ["'self'", "https://raw.githubusercontent.com"], // For Three.js globe GeoJSON
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"]
      }
    }
  }
};