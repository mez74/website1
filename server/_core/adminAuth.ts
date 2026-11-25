import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcryptjs.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Validate password strength
 * Requirements: 1+ capital letter, 1+ number, 1+ special character (@, #, $, %, &, etc)
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one capital letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@#$%&!*]/.test(password)) {
    errors.push('Password must contain at least one special character (@, #, $, %, &, !)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a session has expired due to inactivity (10 minutes)
 */
export function isSessionExpired(lastActivityAt: Date): boolean {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return lastActivityAt < tenMinutesAgo;
}

/**
 * Check if a session token has expired
 */
export function isSessionTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Calculate session expiration time (10 minutes from now)
 */
export function calculateSessionExpiration(rememberMe: boolean = false): Date {
  if (rememberMe) {
    // Remember me: 30 days
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  // Standard: 10 minutes
  return new Date(Date.now() + 10 * 60 * 1000);
}
