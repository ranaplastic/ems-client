import axios, { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { apiBaseUrl, activeProfile, useMock } from '@/config';
import { mockAdapter } from './mock/adapter';

const BASE_URL = apiBaseUrl;
const USE_MOCK = useMock;

/** Shared Axios instance for the EMS API. */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  // When enabled, requests are served from the in-memory demo dataset
  // instead of hitting a real backend (see src/api/mock).
  ...(USE_MOCK ? { adapter: mockAdapter } : {}),
});

if (import.meta.env.DEV) {
  console.info(
    `[EMS] profile=${activeProfile} · api=${BASE_URL}` +
      (USE_MOCK ? ' · MOCK data (demo login 1001 / 9876543210)' : ''),
  );
}

/**
 * Normalise API/network errors into a readable message.
 * The EMS API returns { status, error, message, path } on failures.
 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiError>;
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr.response?.status === 404) return 'The requested record was not found.';
    if (axiosErr.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (axiosErr.message === 'Network Error')
      return 'Cannot reach the server. Check your connection or try again later.';
    return axiosErr.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

// Response interceptor kept minimal — surface a clean rejection to callers.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
