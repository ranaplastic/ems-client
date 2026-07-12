import { decrypt, encrypt } from './crypto';

/**
 * Thin wrapper over localStorage that transparently AES-encrypts values.
 * Keys are namespaced to avoid collisions with other apps on the same origin.
 */
const PREFIX = 'ems.';

export const secureStorage = {
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, encrypt(value));
    } catch {
      /* storage full / unavailable — fail silently */
    }
  },

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return decrypt<T>(raw);
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
