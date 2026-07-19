// =====================================================================
// Application configuration — Spring-profile-style.
//
// The active profile is selected via the `VITE_PROFILE` env var, similar to
// Spring's `spring.profiles.active`. When no profile is set, `dev` is used by
// default.
//
//   dev  → local backend   (http://localhost:8080)
//   prod → hosted backend  (https://ems.ranaplastics.com)
//
// An explicit `VITE_API_BASE_URL` still wins over the profile default, so CI
// or preview environments can point at any endpoint without changing code.
// =====================================================================

export type AppProfile = 'dev' | 'prod';

const DEFAULT_PROFILE: AppProfile = 'dev';

/** Path segment the EMS API is served under. */
const API_PATH = '/api/v1';

interface ProfileConfig {
  /** Backend host (no trailing slash, no API path). */
  baseUrl: string;
}

const PROFILES: Record<AppProfile, ProfileConfig> = {
  // Dev profile config
  // static const String baseUrl = 'http://localhost:8080';
  dev: {
    baseUrl: 'http://localhost:8080',
  },
  // Prod profile config
  // Base URL for API - Change this to your backend API URL
  // static const String baseUrl = 'https://ems.ranaplastics.com';
  prod: {
    baseUrl: 'https://ems.ranaplastics.com',
  },
};

/** Resolve the active profile; defaults to `dev` when unset/unknown. */
function resolveProfile(): AppProfile {
  const raw = (import.meta.env.VITE_PROFILE ?? '').trim().toLowerCase();
  return raw === 'prod' ? 'prod' : DEFAULT_PROFILE;
}

export const activeProfile: AppProfile = resolveProfile();

const profile = PROFILES[activeProfile];

/** Full EMS API base URL (host + `/api/v1`). Explicit override wins. */
export const apiBaseUrl: string =
  import.meta.env.VITE_API_BASE_URL || `${profile.baseUrl}${API_PATH}`;

/** Whether the in-memory mock backend is enabled. */
export const useMock: boolean = import.meta.env.VITE_USE_MOCK === 'true';

export const config = {
  profile: activeProfile,
  baseUrl: profile.baseUrl,
  apiBaseUrl,
  useMock,
} as const;
