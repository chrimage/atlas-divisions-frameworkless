/**
 * CORS Utilities
 */

import type { CONFIG } from '../config.js';

/**
 * Generate Content Security Policy header value
 * @param config - Application configuration
 * @returns CSP header value
 */
function generateCSPHeader(config: typeof CONFIG): string {
  const directives = Object.entries(config.security.contentSecurityPolicy.directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
  return directives;
}

/**
 * Generate security headers from configuration
 * @param config - Application configuration
 * @returns Security headers object including CORS and CSP
 */
export function getCorsHeaders(config: typeof CONFIG): Record<string, string> {
  const corsOrigins = config.security.cors.allowedOrigins.length > 0 
    ? config.security.cors.allowedOrigins.join(', ')
    : '*'; // Fallback to wildcard if none specified (development only)

  return {
    // CORS headers
    'Access-Control-Allow-Origin': corsOrigins,
    'Access-Control-Allow-Methods': config.security.cors.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': config.security.cors.allowedHeaders.join(', '),
    
    // Security headers
    'Content-Security-Policy': generateCSPHeader(config),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };
}

/**
 * Handle preflight OPTIONS request
 * @param corsHeaders - CORS headers to include
 * @returns Response for preflight request
 */
export function handlePreflightRequest(corsHeaders: Record<string, string>): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Add CORS headers to existing response
 * @param response - Original response
 * @param corsHeaders - CORS headers to add
 * @returns Response with CORS headers added
 */
export function addCorsHeaders(response: Response, corsHeaders: Record<string, string>): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/**
 * Create JSON response with CORS headers
 * @param data - Data to serialize as JSON
 * @param corsHeaders - CORS headers to include
 * @param status - HTTP status code (default: 200)
 * @returns JSON response with CORS headers
 */
export function createJsonResponse(
  data: any, 
  corsHeaders: Record<string, string>, 
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Create HTML response with CORS headers
 * @param html - HTML content
 * @param corsHeaders - CORS headers to include
 * @param status - HTTP status code (default: 200)
 * @returns HTML response with CORS headers
 */
export function createHtmlResponse(
  html: string, 
  corsHeaders: Record<string, string>, 
  status = 200
): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders
    }
  });
}

/**
 * Create error response with CORS headers
 * @param message - Error message
 * @param corsHeaders - CORS headers to include
 * @param status - HTTP status code (default: 500)
 * @returns Error response with CORS headers
 */
export function createErrorResponse(
  message: string, 
  corsHeaders: Record<string, string>, 
  status = 500
): Response {
  return new Response(message, {
    status,
    headers: corsHeaders
  });
}

/**
 * Create redirect response with CORS headers
 * @param location - URL to redirect to
 * @param corsHeaders - CORS headers to include
 * @param status - HTTP status code (default: 302)
 * @returns Redirect response with CORS headers
 */
export function createRedirectResponse(
  location: string, 
  corsHeaders: Record<string, string>, 
  status = 302
): Response {
  return new Response('', {
    status,
    headers: {
      'Location': location,
      ...corsHeaders
    }
  });
}