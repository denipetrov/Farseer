/**
 * Runtime configuration. `/config.js` (loaded before the app) wins, so the same
 * image can be deployed anywhere; `.env.local` covers local development.
 */
interface RuntimeConfig {
  soulseekerApiUrl?: string;
}

declare global {
  interface Window {
    __FARSEER_CONFIG__?: RuntimeConfig;
  }
}

const runtime = typeof window !== 'undefined' ? (window.__FARSEER_CONFIG__ ?? {}) : {};

export const config = {
  soulseekerApiUrl: runtime.soulseekerApiUrl || import.meta.env.VITE_SOULSEEKER_API_URL || '',
};
