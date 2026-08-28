export interface RegisterFormValues {
  password: string;
  confirmPassword: string;
  username: string;
  acceptRules: boolean;
  acceptPrivacy: boolean;
}

export function validateRegisterForm(values: RegisterFormValues): string {
  if (values.password !== values.confirmPassword) {
    return 'Пароли не совпадают';
  }

  if (values.password.length < 6) {
    return 'Пароль должен быть не менее 6 символов';
  }

  if (values.username.length < 3) {
    return 'Имя пользователя должно быть не менее 3 символов';
  }

  if (!values.acceptRules || !values.acceptPrivacy) {
    return 'Необходимо принять правила сайта и политику конфиденциальности';
  }

  return '';
}
