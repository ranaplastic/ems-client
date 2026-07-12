import CryptoJS from 'crypto-js';

/**
 * Passphrase used to encrypt data at rest in the browser.
 *
 * SECURITY NOTE: A static single-page app served from GitHub Pages cannot keep
 * a secret truly hidden from a determined user inspecting the bundle. This key
 * protects session data against casual inspection and other scripts/extensions
 * reading localStorage — it is defence in depth, NOT a replacement for a proper
 * server-side auth token. Rotate `VITE_STORAGE_SECRET` per deployment.
 */
const SECRET = import.meta.env.VITE_STORAGE_SECRET || 'ems-client-fallback-secret';

/** Encrypt an arbitrary serialisable value to an AES cipher string. */
export function encrypt(value: unknown): string {
  const plaintext = JSON.stringify(value);
  return CryptoJS.AES.encrypt(plaintext, SECRET).toString();
}

/** Decrypt an AES cipher string back to its original value, or null on failure. */
export function decrypt<T>(cipher: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) return null;
    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
}
