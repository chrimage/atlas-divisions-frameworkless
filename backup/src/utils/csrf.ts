/**
 * CSRF Protection Utilities
 */

/**
 * Generate a CSRF token using crypto.randomUUID()
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * Store CSRF token in a simple in-memory store with expiration
 * In production, consider using a more robust storage mechanism
 */
const csrfTokenStore = new Map<string, { token: string; timestamp: number }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  const expiration = 30 * 60 * 1000; // 30 minutes
  
  for (const [key, value] of csrfTokenStore.entries()) {
    if (now - value.timestamp > expiration) {
      csrfTokenStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Store a CSRF token for a session
 * @param sessionId - Session identifier (could be user email or session token)
 * @param token - CSRF token to store
 */
export function storeCSRFToken(sessionId: string, token: string): void {
  csrfTokenStore.set(sessionId, {
    token,
    timestamp: Date.now()
  });
}

/**
 * Validate a CSRF token for a session
 * @param sessionId - Session identifier
 * @param submittedToken - Token submitted with the request
 * @returns boolean indicating if token is valid
 */
export function validateCSRFToken(sessionId: string, submittedToken: string): boolean {
  const stored = csrfTokenStore.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  // Check if token has expired (30 minutes)
  const expiration = 30 * 60 * 1000; // 30 minutes
  if (Date.now() - stored.timestamp > expiration) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  // Validate token
  return stored.token === submittedToken;
}

/**
 * Remove a CSRF token from storage (after successful use)
 * @param sessionId - Session identifier
 */
export function removeCSRFToken(sessionId: string): void {
  csrfTokenStore.delete(sessionId);
}

/**
 * Extract session ID from user object (for CSRF token storage)
 * @param user - CloudflareAccessUser object
 * @returns string session identifier
 */
export function getSessionId(user: any): string {
  // Use email + sub for a more unique session identifier
  return user ? `${user.email}_${user.sub || ''}` : 'anonymous';
}