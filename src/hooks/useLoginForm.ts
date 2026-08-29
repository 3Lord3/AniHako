import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getApiErrorMessage, isCaptchaChallenge } from '@/lib/apiError';

export function useLoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const { login: doLogin, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const submit = useCallback(
    (credentials: { login: string; password: string; captchaResponse?: string }) => {
      doLogin(credentials, {
        onSuccess: () => {
          setCaptchaRequired(false);
          navigate('/');
        },
        onError: (err: unknown) => {
          // The solved captcha token is single-use: force a fresh widget for
          // the next attempt.
          setCaptchaNonce((n) => n + 1);
          if (isCaptchaChallenge(err)) {
            setCaptchaRequired(true);
            setError('Пройдите капчу, чтобы продолжить');
          } else {
            setError(getApiErrorMessage(err, 'Ошибка входа'));
          }
        },
      });
    },
    [doLogin, navigate]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    submit({ login, password });
  };

  // When the user solves the inline captcha, retry the login with the same
  // credentials and the captcha response appended to the body.
  const handleCaptchaSolved = useCallback(
    (token: string) => {
      submit({ login, password, captchaResponse: token });
    },
    [login, password, submit]
  );

  return {
    login,
    setLogin,
    password,
    setPassword,
    error,
    isLoggingIn,
    captchaRequired,
    captchaNonce,
    handleSubmit,
    handleCaptchaSolved,
  };
}