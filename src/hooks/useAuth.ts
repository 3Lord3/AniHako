import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { setAuthToken, clearAuth, setUser, getUser } from '@/api';
import type { YummyUser } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async ({ login, password }: { login: string; password: string }) => {
      const response = await authApi.login(login, password);
      const { token } = response.data.response;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      setAuthToken(token);
      
      const user = await authApi.getProfile();
      setUser(user);
      return { user, token };
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(['user'], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      username,
      password,
    }: {
      email: string;
      username: string;
      password: string;
    }) => authApi.register(email, username, password),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAuthToken(tokens.access_token);
      setUser(user);
      queryClient.setQueryData(['user'], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      navigate('/login');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      // Try to get user from localStorage first
      const cachedUser = getUser();
      if (cachedUser) {
        return cachedUser;
      }
      
      // Fetch from API - getProfile returns YummyUser directly
      try {
        const user = await authApi.getProfile();
        setUser(user);
        return user;
      } catch {
        clearAuth();
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nickname?: string; avatar?: string }) => {
      // YummyAnime API - profile update might be different
      // For now just update local storage
      return data;
    },
    onSuccess: (data) => {
      const currentUser = queryClient.getQueryData<YummyUser>(['user']);
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        setUser(updatedUser);
        queryClient.setQueryData(['user'], updatedUser);
      }
    },
  });
}