interface LinkedAccountsProps {
  ids?: {
    shikimori?: { id: number; nickname: string };
    vk?: number;
    tg_nickname?: string;
  };
}

export function LinkedAccounts({ ids }: LinkedAccountsProps) {
  if (!ids) return null;

  return (
    <div className="flex gap-3 mt-1">
      {ids.shikimori && (
        <span className="text-sm">Shikimori: {ids.shikimori.nickname}</span>
      )}
      {ids.vk && (
        <span className="text-sm">VK: {ids.vk}</span>
      )}
      {ids.tg_nickname && (
        <span className="text-sm">Telegram: {ids.tg_nickname}</span>
      )}
    </div>
  );
}
