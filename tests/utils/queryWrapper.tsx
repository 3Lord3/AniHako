import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

export interface QueryWrapperOptions {
  /** Обернуть в `MemoryRouter`. Отключается для хуков, не зависящих от роутера. */
  router?: boolean;
  /** Начальный URL — для хуков, читающих `useSearchParams`. */
  initialEntries?: string[];
}

/**
 * Общий враппер для `renderHook`: свежий `QueryClient` без ретраев на каждый вызов,
 * опционально внутри `MemoryRouter`.
 */
export const createWrapper = ({ router = true, initialEntries }: QueryWrapperOptions = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => {
    const withQuery = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    if (!router) return withQuery;
    return <MemoryRouter initialEntries={initialEntries}>{withQuery}</MemoryRouter>;
  };
};
