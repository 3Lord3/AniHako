import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import { getApiErrorMessage } from '@/lib/apiError';
import { validateRegisterForm } from '@/lib/authValidation';

export function useRegisterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState('');
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateRegisterForm({
      password,
      confirmPassword,
      username,
      acceptRules,
      acceptPrivacy,
    }, t);
    if (validationError) {
      setError(validationError);
      return;
    }

    register(
      { email, username, password },
      {
        onSuccess: () => {
          navigate('/');
        },
        onError: (err: unknown) => {
          setError(getApiErrorMessage(err, t('register.error')));
        },
      }
    );
  };

  return {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    acceptRules,
    setAcceptRules,
    acceptPrivacy,
    setAcceptPrivacy,
    error,
    isRegistering,
    handleSubmit,
  };
}
