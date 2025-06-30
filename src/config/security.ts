/**
 * Security Configuration
 * Security settings, authentication, and permissions
 */

export const SECURITY_CONFIG = {
  // Security Configuration
  security: {
    // Email addresses allowed to access admin panel (if not using Cloudflare Access)
    // TODO: Configure with your actual admin emails
    allowedAdminEmails: [
      "admin@yourdomain.com",
      "owner@yourdomain.com"
      // Add more admin emails as needed
    ],
    
    // Cloudflare Access team name for JWT verification
    // This should be your team name from the Cloudflare Zero Trust dashboard
    // Example: if your dashboard is at "mycompany.cloudflareaccess.com", use "mycompany"
    cloudflareAccessTeamName: "", // TODO: Set your Cloudflare Access team name
    
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
        'script-src': ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], // TODO: Remove 'unsafe-inline' and use nonce
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:", "https:"],
        'connect-src': ["'self'", "https://raw.githubusercontent.com"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"]
      }
    }
  }
};