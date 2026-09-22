import type { Translator } from '@/i18n';

export interface RegisterFormValues {
  password: string;
  confirmPassword: string;
  username: string;
  acceptRules: boolean;
  acceptPrivacy: boolean;
}

export function validateRegisterForm(values: RegisterFormValues, t: Translator): string {
  if (values.password !== values.confirmPassword) {
    return t('validation.passwordsMismatch');
  }

  if (values.password.length < 6) {
    return t('validation.passwordTooShort');
  }

  if (values.username.length < 3) {
    return t('validation.usernameTooShort');
  }

  if (!values.acceptRules || !values.acceptPrivacy) {
    return t('validation.mustAccept');
  }

  return '';
}
