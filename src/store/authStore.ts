import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Client } from '@/types';
import { encrypt, decrypt } from '@/lib/crypto';

interface AuthState {
  client: Client | null;
  isAuthenticated: boolean;
  login: (client: Client) => void;
  logout: () => void;
  setClient: (client: Client) => void;
}

/**
 * Auth/session store. Persisted to localStorage but AES-encrypted at rest via a
 * custom storage adapter so the client identity is not stored in plaintext.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      client: null,
      isAuthenticated: false,
      login: (client) => set({ client, isAuthenticated: true }),
      logout: () => set({ client: null, isAuthenticated: false }),
      setClient: (client) => set({ client }),
    }),
    {
      name: 'session',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const raw = localStorage.getItem(`ems.${name}`);
          if (!raw) return null;
          const value = decrypt<string>(raw);
          return value ?? null;
        },
        setItem: (name, value) => {
          localStorage.setItem(`ems.${name}`, encrypt(value));
        },
        removeItem: (name) => localStorage.removeItem(`ems.${name}`),
      })),
      partialize: (state) => ({
        client: state.client,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
