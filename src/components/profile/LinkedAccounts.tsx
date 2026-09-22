import { useT } from '@/i18n';

interface LinkedAccountsProps {
  ids?: {
    shikimori?: { id: number; nickname: string };
    vk?: number;
    tg_nickname?: string;
  };
}

export function LinkedAccounts({ ids }: LinkedAccountsProps) {
  const { t } = useT();
  if (!ids) return null;

  return (
    <div className="flex gap-3 mt-1">
      {ids.shikimori && (
        <span className="text-sm">{t('profile.linked.shikimori', { name: ids.shikimori.nickname })}</span>
      )}
      {ids.vk && (
        <span className="text-sm">{t('profile.linked.vk', { id: ids.vk })}</span>
      )}
      {ids.tg_nickname && (
        <span className="text-sm">{t('profile.linked.telegram', { name: ids.tg_nickname })}</span>
      )}
    </div>
  );
}
