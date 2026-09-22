import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';

interface LoginRequiredProps {
  message: string;
}

export function LoginRequired({ message }: LoginRequiredProps) {
  const { t } = useT();
  return (
    <div className="text-center py-12">
      <p className="mb-4">{message}</p>
      <Link to="/login">
        <Button>{t('loginRequired.login')}</Button>
      </Link>
    </div>
  );
}
