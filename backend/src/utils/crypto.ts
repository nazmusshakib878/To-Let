import crypto from 'crypto';

/**
 * Generate a cryptographically secure deletion token for newly created listings.
 */
export function generateDeletionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a deletion token using SHA-256 for secure database storage.
 */
export function hashDeletionToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Verify a provided deletion token against the stored hash in constant time.
 */
export function verifyDeletionToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false;
  const computedHash = hashDeletionToken(token);
  try {
    const computedBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch {
    return false;
  }
}
