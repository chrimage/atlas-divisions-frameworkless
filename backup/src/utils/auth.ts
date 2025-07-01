/**
 * Authentication Utilities
 */

import type { CloudflareAccessUser } from '../types/index.js';
import type { CONFIG } from '../config.js';

/**
 * Decode base64url string to Uint8Array
 */
function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode base64url string to string
 */
function base64urlDecodeString(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(paddedBase64);
}

/**
 * Fetch Cloudflare Access public key for JWT verification
 */
async function getCloudflareAccessPublicKey(teamName: string, keyId: string): Promise<CryptoKey | null> {
  try {
    const response = await fetch(`https://${teamName}.cloudflareaccess.com/cdn-cgi/access/certs`);
    if (!response.ok) {
      console.error('Failed to fetch Cloudflare Access public keys');
      return null;
    }

    const jwks: any = await response.json();
    const publicCerts = jwks.public_certs || [];
    
    // Find the certificate with matching key ID
    const cert = publicCerts.find((c: any) => c.kid === keyId);
    if (!cert) {
      console.error(`Public key with kid ${keyId} not found`);
      return null;
    }

    // Import the public key
    const keyData = {
      kty: 'RSA',
      use: 'sig',
      alg: 'RS256',
      n: cert.n,
      e: cert.e
    };

    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    );
  } catch (error) {
    console.error('Error fetching Cloudflare Access public key:', error);
    return null;
  }
}

/**
 * Verify JWT signature using Cloudflare Access public key
 */
async function verifyJWTSignature(jwt: string, teamName: string): Promise<boolean> {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode header to get key ID
    const header = JSON.parse(base64urlDecodeString(parts[0]));
    if (!header.kid) {
      console.error('JWT header missing key ID');
      return false;
    }

    // Get public key
    const publicKey = await getCloudflareAccessPublicKey(teamName, header.kid);
    if (!publicKey) {
      return false;
    }

    // Prepare signature verification data
    const signatureData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64urlDecode(parts[2]);

    // Verify signature
    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signature,
      signatureData
    );
  } catch (error) {
    console.error('Error verifying JWT signature:', error);
    return false;
  }
}

/**
 * Extract user identity from Cloudflare Access JWT token with signature verification
 * @param request - The incoming request
 * @param teamName - Cloudflare Access team name for public key verification
 * @returns CloudflareAccessUser object or null if token is missing/invalid
 */
export async function extractUserFromAccessToken(request: Request, teamName?: string): Promise<CloudflareAccessUser | null> {
  try {
    const userJWT = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!userJWT) {
      return null;
    }

    // JWT structure: header.payload.signature
    const parts = userJWT.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Verify JWT signature if team name is provided
    if (teamName) {
      const isSignatureValid = await verifyJWTSignature(userJWT, teamName);
      if (!isSignatureValid) {
        console.error('JWT signature verification failed');
        return null;
      }
    } else {
      console.warn('JWT signature verification skipped - no team name provided');
    }

    // Decode the payload (base64url decode)
    const decodedPayload = JSON.parse(base64urlDecodeString(parts[1]));
    
    // Validate token expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      console.warn('JWT token expired');
      return null;
    }
    
    // Validate required fields
    if (!decodedPayload.email) {
      console.error('JWT token missing email field');
      return null;
    }

    // Validate issuer and audience if present
    if (teamName && decodedPayload.iss && !decodedPayload.iss.includes(teamName)) {
      console.error('JWT issuer mismatch');
      return null;
    }

    return {
      email: decodedPayload.email,
      name: decodedPayload.name,
      sub: decodedPayload.sub,
      aud: decodedPayload.aud,
      iss: decodedPayload.iss,
      iat: decodedPayload.iat,
      exp: decodedPayload.exp
    };
  } catch (error) {
    console.error('Error extracting user from Access token:', error);
    return null;
  }
}

/**
 * Validate admin access based on configuration and user
 * @param user - CloudflareAccessUser or null
 * @param config - Application configuration
 * @returns boolean indicating if user has admin access
 */
export function validateAdminAccess(user: CloudflareAccessUser | null, config: typeof CONFIG): boolean {
  // If admin auth is disabled, allow access
  if (!config.features.enableAdminAuth) {
    return true;
  }

  // If no user and Cloudflare Access is enabled, deny access
  if (!user && config.features.enableCloudflareAccess) {
    return false;
  }

  // If not using Cloudflare Access, check email allowlist
  if (!config.features.enableCloudflareAccess && user) {
    return config.security.allowedAdminEmails.includes(user.email);
  }

  // If using Cloudflare Access and user exists, allow access
  return !!user;
}

/**
 * Create authentication response headers
 * @param corsHeaders - Existing CORS headers
 * @returns Response object for authentication failures
 */
export function createAuthFailureResponse(corsHeaders: Record<string, string>, message = 'Unauthorized'): Response {
  return new Response(message, {
    status: 401,
    headers: corsHeaders
  });
}

/**
 * Create forbidden response headers
 * @param corsHeaders - Existing CORS headers
 * @returns Response object for forbidden access
 */
export function createForbiddenResponse(corsHeaders: Record<string, string>, message = 'Forbidden'): Response {
  return new Response(message, {
    status: 403,
    headers: corsHeaders
  });
}