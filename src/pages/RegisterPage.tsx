import { Link } from 'react-router-dom';
import { useRegisterForm } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n';

export function RegisterPage() {
  const { t } = useT();
  const {
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
  } = useRegisterForm();

  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-10rem)] py-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('register.title')}</CardTitle>
          <CardDescription>{t('register.subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t('register.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder="example"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="●●●●●●●●"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="●●●●●●●●"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="acceptRules"
                  checked={acceptRules}
                  onCheckedChange={setAcceptRules}
                />
                <span className="text-sm font-normal leading-tight">{t('register.agreeRules')} <a href="https://ru.yummyani.me/pages/about-yummy?tab=rules" target="_blank" rel="noopener noreferrer" className="text-primary underline">{t('register.rulesLink')}</a></span>
              </div>
              <div className="flex items-center gap-2 pb-4">
                <Checkbox
                  id="acceptPrivacy"
                  checked={acceptPrivacy}
                  onCheckedChange={setAcceptPrivacy}
                />
                <span className="text-sm font-normal leading-tight">{t('register.agreePrivacy')} <a href="https://ru.yummyani.me/pages/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">{t('register.privacyLink')}</a></span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-border">
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? t('register.registering') : t('register.action')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('register.hasAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t('register.loginLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
