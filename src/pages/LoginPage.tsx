import { Link } from 'react-router-dom';
import { useLoginForm, usePageTitle } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CaptchaField } from '@/components/CaptchaField';
import { useT } from '@/i18n';

export function LoginPage() {
  const { t } = useT();
  usePageTitle(t('login.title'));
  const {
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
  } = useLoginForm();

  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-10rem)] py-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pb-5">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="login">{t('login.loginOrEmail')}</Label>
              <Input
                id="login"
                type="text"
                placeholder="example"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="●●●●●●●●"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {captchaRequired && (
              <CaptchaField key={captchaNonce} onSolved={handleCaptchaSolved} />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-border">
            <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
              {isLoggingIn ? t('login.loggingIn') : t('login.action')}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                {t('login.registerLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
