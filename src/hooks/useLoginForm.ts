import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getApiErrorMessage } from '@/lib/apiError';

export function useLoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: doLogin, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    doLogin(
      { login, password },
      {
        onSuccess: () => {
          navigate('/');
        },
        onError: (err: unknown) => {
          setError(getApiErrorMessage(err, 'Ошибка входа'));
        },
      }
    );
  };

  return {
    login,
    setLogin,
    password,
    setPassword,
    error,
    isLoggingIn,
    handleSubmit,
  };
}
