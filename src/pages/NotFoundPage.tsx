import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
      <h1 className="text-7xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-foreground">Страница не найдена</h2>
      <p className="text-muted-foreground max-w-md">
        Возможно, страница была перемещена или удалена. Проверьте адрес или вернитесь на главную.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        <Home className="w-4 h-4" />
        На главную
      </Link>
    </div>
  );
}
