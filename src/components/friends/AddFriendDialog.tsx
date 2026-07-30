import { useState } from 'react';
import { User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FriendStatusBadge } from './FriendStatusBadge';
import { useAddFriend, useFriends, useFriendStatus, useRemoveFriend, useUserByNickname } from '@/hooks';
import { getFriendActions } from '@/lib/friendActions';
import { FRIENDS_LIST_MAX_LIMIT } from '@/types/friend';

interface AddFriendDialogProps {
  userId: number;
  userNickname?: string;
}

const NUMERIC_ID = /^\d+$/;
const MUTATION_ERROR_MESSAGE = 'Не удалось выполнить действие. Попробуйте ещё раз.';

/**
 * `GET/PUT/DELETE /friends/{friend_id}` работают только по числовому ID —
 * ни никнейм, ни непроверенный ID нельзя слать туда напрямую (никнейм там
 * молча не находит связь; непроверенный ID не отличить от "нет связи").
 * Поэтому и никнейм, и ID сначала проходят один и тот же пайплайн:
 *   1. Уже известные отношения (друзья/подписчики/…) — совпадение по id
 *      или нику, статус берётся сразу, без сети.
 *   2. Иначе — `GET /users/{nickname_or_id}` (публичный профиль) резолвит
 *      никнейм ИЛИ ID в подтверждённую пару {id, nickname}; отсутствие
 *      результата здесь означает, что пользователя не существует.
 *   3. Только подтверждённый ID уходит в эндпоинт статуса.
 */
export function AddFriendDialog({ userId, userNickname }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: knownRelations } = useFriends(
    userId,
    { limit: FRIENDS_LIST_MAX_LIMIT, offset: 0 },
    { enabled: open }
  );
  const { mutate: addFriend, isPending: isAdding } = useAddFriend(userId);
  const { mutate: removeFriend, isPending: isRemoving } = useRemoveFriend(userId);

  const isNumeric = submitted != null && NUMERIC_ID.test(submitted);
  const localMatch =
    submitted != null
      ? knownRelations?.find((friend) =>
          isNumeric ? friend.id === Number(submitted) : friend.nickname.toLowerCase() === submitted.toLowerCase()
        )
      : undefined;
  const needsLookup = submitted != null && !localMatch;

  const { data: lookedUpUser, isFetching: isLookingUp, isFetched: lookupFetched } = useUserByNickname(
    needsLookup ? submitted : undefined
  );

  const resolvedId = localMatch ? localMatch.id : (lookedUpUser?.id ?? null);
  const resolvedLabel = localMatch ? localMatch.nickname : (lookedUpUser?.nickname ?? null);
  const knownStatus = localMatch ? localMatch.friend_status : null;
  const notFound = needsLookup && lookupFetched && !lookedUpUser;
  const resolvedIsSelf = resolvedId != null && resolvedId === userId;

  const { data: fetchedStatus, isFetching: isCheckingStatus } = useFriendStatus(userId, resolvedId ?? undefined, {
    enabled: resolvedId != null && knownStatus == null,
  });
  const status = knownStatus ?? fetchedStatus;

  const isChecking = (needsLookup && isLookingUp) || (resolvedId != null && knownStatus == null && isCheckingStatus);
  const hasResult = resolvedId != null && !isChecking && !error && !notFound && !resolvedIsSelf;
  const displayError =
    error ??
    (notFound
      ? 'Пользователь с таким никнеймом или ID не найден'
      : resolvedIsSelf
        ? 'Нельзя добавить самого себя'
        : null);

  const reset = () => {
    setIdInput('');
    setSubmitted(null);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleCheck = () => {
    const trimmed = idInput.trim();
    if (!trimmed) {
      setError('Введите никнейм или ID пользователя');
      setSubmitted(null);
      return;
    }

    const isSelf = NUMERIC_ID.test(trimmed)
      ? Number(trimmed) === userId
      : !!userNickname && trimmed.toLowerCase() === userNickname.toLowerCase();
    if (isSelf) {
      setError('Нельзя добавить самого себя');
      setSubmitted(null);
      return;
    }

    setError(null);
    setSubmitted(trimmed);
  };

  const handleAction = (method: 'add' | 'remove') => {
    if (resolvedId == null) return;
    const mutate = method === 'add' ? addFriend : removeFriend;
    mutate(resolvedId, {
      onSuccess: () => handleOpenChange(false),
      onError: () => setError(MUTATION_ERROR_MESSAGE),
    });
  };

  const actions = status
    ? getFriendActions(status)
    : hasResult
      ? [{ key: 'add' as const, label: 'Отправить заявку', method: 'add' as const, variant: 'default' as const }]
      : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button className="h-9" onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4 mr-2" />
        Добавить в друзья
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить в друзья</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="friend-id-input">Никнейм или ID пользователя</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="friend-id-input"
                  value={idInput}
                  className="pl-9"
                  onChange={(e) => {
                    setIdInput(e.target.value);
                    setSubmitted(null);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isChecking) {
                      handleCheck();
                    }
                  }}
                />
              </div>
              <Button variant="outline" onClick={handleCheck} disabled={isChecking}>
                Проверить
              </Button>
            </div>
            {displayError && <p className="text-xs text-destructive">{displayError}</p>}
          </div>

          {hasResult && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{resolvedLabel}</p>
                {status ? (
                  <FriendStatusBadge status={status} />
                ) : (
                  <p className="text-xs text-muted-foreground">Вы ещё не связаны</p>
                )}
              </div>
              <div className="flex gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={action.variant}
                    disabled={isAdding || isRemoving}
                    onClick={() => handleAction(action.method)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
