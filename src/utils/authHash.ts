import bcrypt from 'bcryptjs';

/**
 * Secure password hashing and verification utility for LCNS portal
 * Uses bcryptjs (10 rounds) with institutional fallbacks.
 * Fully supports backward compatibility for existing plain text & sha256 passwords.
 */

const SALT = 'lcns_salt_2026_gboko_';

export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    return await bcrypt.hash(plainText, 10);
  } catch {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(SALT + plainText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return 'sha256:' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'plain:' + plainText;
    }
  }
}

export async function verifyPassword(
  inputPlain: string,
  storedPasswordOrHash: string | undefined
): Promise<boolean> {
  if (!storedPasswordOrHash || !inputPlain) return false;

  // 1. Direct match (plain text or legacy seed password like 'admin123')
  if (inputPlain === storedPasswordOrHash) return true;

  // 2. Bcrypt check (starts with $2a$, $2b$, or $2y$)
  if (storedPasswordOrHash.startsWith('$2')) {
    try {
      const match = await bcrypt.compare(inputPlain, storedPasswordOrHash);
      if (match) return true;
    } catch {
      // ignore
    }
  }

  // 3. SHA-256 fallback format
  if (storedPasswordOrHash.startsWith('sha256:')) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(SALT + inputPlain);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashed = 'sha256:' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashed === storedPasswordOrHash;
    } catch {
      // ignore
    }
  }

  // 4. Plain prefix
  if (storedPasswordOrHash.startsWith('plain:')) {
    return inputPlain === storedPasswordOrHash.replace('plain:', '');
  }

  return false;
}

