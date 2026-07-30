import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LoginRequiredProps {
  message: string;
}

export function LoginRequired({ message }: LoginRequiredProps) {
  return (
    <div className="text-center py-12">
      <p className="mb-4">{message}</p>
      <Link to="/login">
        <Button>Войти</Button>
      </Link>
    </div>
  );
}
