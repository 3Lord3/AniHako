import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';

export function useUserByNickname(nickname: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users', 'byNickname', nickname],
    queryFn: () => usersApi.getByNickname(nickname as string),
    enabled: !!nickname && (options?.enabled ?? true),
    retry: false,
  });
}
