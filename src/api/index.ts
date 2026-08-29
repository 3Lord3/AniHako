import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { YummyUser } from '../types/user';
import { requestCaptchaToken } from '../lib/captcha';
import { isCaptchaChallenge } from '../lib/apiError';

declare module 'axios' {
  interface AxiosRequestConfig {
    __captchaRetried?: number;
  }
}

const YUMMY_API_URL = 'https://api.yani.tv';
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || '';

// Captcha challenges (420) only apply to mutating endpoints; the captcha
// response must be echoed back in the request body.
const CAPTCHA_RETRYABLE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

// A solved token is single-use and short-lived, so the backend can still
// answer 420 (e.g. the token expired before the retry landed). Allow one extra
// solve for that case; more than that only makes the user grind captchas.
const MAX_CAPTCHA_RETRIES = 2;

// The login form embeds an inline captcha and resubmits itself, so the login
// endpoint is handled manually instead of by the global interceptor.
const MANUAL_CAPTCHA_URLS = ['/profile/login'];

export const api = axios.create({
  baseURL: YUMMY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Application': APP_TOKEN,
    'Accept': 'image/avif,image/webp',
  },
});

// 401-handler: clear auth and let consumers re-route as needed (e.g. via <Navigate> in ProtectedRoute).
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Matches a request URL against a target path exactly (allowing a trailing
 * slash), ignoring query strings and hashes. `/profile/login/anything` must
 * not count as `/profile/login`.
 */
function matchesPath(url: string | undefined, target: string): boolean {
  if (!url) return false;
  const path = url.split('?')[0].split('#')[0];
  return path === target || path === `${target}/`;
}

/**
 * The backend expects the hCaptcha token under a per-endpoint field name:
 * login / password reset use `recaptcha_response`, registration and the rest
 * use `g-recaptcha-response`.
 */
function getCaptchaFieldName(url: string | undefined): string {
  if (matchesPath(url, '/profile/login') || matchesPath(url, '/profile/reset-password')) {
    return 'recaptcha_response';
  }
  return 'g-recaptcha-response';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Whether the request body can carry an extra captcha field. Bodies that are
 * not plain objects or JSON objects (FormData, URLSearchParams, a non-JSON
 * string, …) cannot be merged into, so retrying them would silently drop the
 * original payload.
 */
function canMergeCaptchaBody(data: unknown): boolean {
  if (data == null) return true;
  if (typeof data === 'string') {
    if (data.trim() === '') return true;
    try {
      return isPlainObject(JSON.parse(data));
    } catch {
      return false;
    }
  }
  return isPlainObject(data);
}

function mergeCaptchaResponse(data: unknown, field: string, token: string): unknown {
  if (data == null) return { [field]: token };
  if (typeof data === 'string') {
    if (data.trim() === '') return { [field]: token };
    return { ...(JSON.parse(data) as Record<string, unknown>), [field]: token };
  }
  return { ...(data as Record<string, unknown>), [field]: token };
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }

    // Captcha challenge (420 / error_code 5): ask the user to solve the
    // captcha, then repeat the original request with the same data and the
    // captcha response appended to the body.
    const config = error.config as InternalAxiosRequestConfig | undefined;
    const captchaRetries = config?.__captchaRetried ?? 0;
    if (
      isCaptchaChallenge(error) &&
      config &&
      captchaRetries < MAX_CAPTCHA_RETRIES &&
      config.method &&
      CAPTCHA_RETRYABLE_METHODS.has(config.method) &&
      !MANUAL_CAPTCHA_URLS.some((path) => matchesPath(config.url, path))
    ) {
      // The token has to be echoed back in the request body; bodies that
      // cannot be merged into can't be retried, so surface the challenge.
      if (!canMergeCaptchaBody(config.data)) {
        return Promise.reject(error);
      }
      try {
        const token = await requestCaptchaToken();
        return api.request({
          ...config,
          __captchaRetried: captchaRetries + 1,
          data: mergeCaptchaResponse(config.data, getCaptchaFieldName(config.url), token),
        });
      } catch {
        // User dismissed the captcha or it is unavailable — surface the
        // original challenge error so callers can show their own message.
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const setUser = (user: YummyUser) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): YummyUser | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as YummyUser;
    } catch {
      return null;
    }
  }
  return null;
};
