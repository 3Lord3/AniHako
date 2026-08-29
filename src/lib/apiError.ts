interface ApiErrorBody {
  error?: unknown;
  error_title?: unknown;
  detail?: unknown;
  message?: unknown;
  error_code?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } } | null | undefined)?.response?.data;
  if (isRecord(data)) {
    for (const key of ['error', 'error_title', 'detail', 'message'] as const) {
      const value = data[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }
  return fallback;
}

/**
 * Detects a captcha challenge from the backend. The YummyAnime API answers
 * with HTTP 420 ("Вы не прошли капчу") or an `error_code` of 5.
 */
export function isCaptchaChallenge(err: unknown): boolean {
  const response = (err as { response?: { status?: number; data?: ApiErrorBody } } | null | undefined)
    ?.response;
  if (response?.status === 420) return true;
  return Number(response?.data?.error_code) === 5;
}