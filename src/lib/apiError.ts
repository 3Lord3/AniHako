export function getApiErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as { response?: { data?: { detail?: string } } } | null | undefined;
  return axiosError?.response?.data?.detail || fallback;
}
