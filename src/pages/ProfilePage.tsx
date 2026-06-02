import { Link } from 'react-router-dom';
import { useUser, useUpdateProfile } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProfilePageSkeleton } from '@/components/loaders/PageSkeletons';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { RoleBadges } from '@/components/profile/RoleBadge';
import { EditableField } from '@/components/profile/EditableField';
import { LinkedAccounts } from '@/components/profile/LinkedAccounts';
import { formatDate, formatLastOnline } from '@/lib/dateUtils';

export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Для просмотра профиля необходимо войти</p>
        <Link to="/login">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  const handleUpdateNickname = (nickname: string) => {
    updateProfile(
      { nickname },
      {
        onSuccess: () => {},
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex items-center gap-6">
            <ProfileAvatar
              src={user.avatars?.full}
              name={user.nickname}
              size="lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.nickname}</h1>
              {user.email && <p className="text-muted-foreground">{user.email}</p>}
              
              <RoleBadges roles={user.roles} />
              
              <p className="text-sm text-muted-foreground mt-2">
                {formatLastOnline(user.last_online)}
              </p>
              <EditableField
                value={user.nickname}
                onSave={handleUpdateNickname}
                label="Изменить имя"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Дата регистрации</p>
              <p className="font-medium">{formatDate(user.register_date)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Последний вход</p>
              <p className="font-medium">{formatLastOnline(user.last_online)}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Связанные аккаунты</p>
              <LinkedAccounts ids={user.ids} />
            </div>
          </div>

          {user.about && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">О себе</p>
              <p className="mt-1">{user.about}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
