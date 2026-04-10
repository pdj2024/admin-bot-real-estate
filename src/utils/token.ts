/**
 * Utility to check if a JWT token is expired or about to expire.
 * This is a pure utility to avoid circular dependencies.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token || token === 'undefined') return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Consider expired 30 seconds before actual expiration to be safe
    return payload.exp * 1000 < Date.now() + 30000
  } catch {
    return true
  }
}
