import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { useUser } from '@/hooks';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const AnimeDetailPage = lazy(() => import('@/pages/AnimeDetailPage').then(m => ({ default: m.AnimeDetailPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const UserAnimeListPage = lazy(() => import('@/pages/UserAnimeListPage').then(m => ({ default: m.UserAnimeListPage })));
const AnimeMatcherPage = lazy(() => import('@/pages/AnimeMatcherPage').then(m => ({ default: m.AnimeMatcherPage })));
const AnimeTournamentPage = lazy(() => import('@/pages/AnimeTournamentPage').then(m => ({ default: m.AnimeTournamentPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <SuspenseFallback message="Проверка авторизации..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="anime/:url" element={<AnimeDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/anime" element={
              <ProtectedRoute>
                <UserAnimeListPage />
              </ProtectedRoute>
            } />
            <Route path="matcher" element={
              <ProtectedRoute>
                <AnimeMatcherPage />
              </ProtectedRoute>
            } />
            <Route path="tournament" element={
              <ProtectedRoute>
                <AnimeTournamentPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
