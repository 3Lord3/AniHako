import { useState } from 'react';
import { useFriendActions } from './useFriendActions';
import { useFriends, useFriendStatus } from './useFriends';
import { useUserByNickname } from './useUsers';
import { getFriendActions } from '@/lib/friendActions';
import { FRIENDS_LIST_MAX_LIMIT } from '@/types/friend';

const NUMERIC_ID = /^\d+$/;

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
export function useAddFriendDialog(userId: number, userNickname?: string) {
  const [open, setOpen] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: knownRelations } = useFriends(
    userId,
    { limit: FRIENDS_LIST_MAX_LIMIT, offset: 0 },
    { enabled: open }
  );
  const { addFriend, removeFriend, pendingFriendIds, error: mutationError, resetError } = useFriendActions(userId);

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
    mutationError ??
    (notFound
      ? 'Пользователь с таким никнеймом или ID не найден'
      : resolvedIsSelf
        ? 'Нельзя добавить самого себя'
        : null);

  const reset = () => {
    setIdInput('');
    setSubmitted(null);
    setError(null);
    resetError();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleInputChange = (value: string) => {
    setIdInput(value);
    setSubmitted(null);
    setError(null);
    resetError();
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
    const action = method === 'add' ? addFriend : removeFriend;
    action(resolvedId, () => handleOpenChange(false));
  };

  const actions = status
    ? getFriendActions(status)
    : hasResult
      ? [{ key: 'add' as const, label: 'Отправить заявку', method: 'add' as const, variant: 'default' as const }]
      : [];

  return {
    open,
    handleOpenChange,
    openDialog: () => setOpen(true),
    idInput,
    handleInputChange,
    handleCheck,
    isChecking,
    displayError,
    hasResult,
    resolvedId,
    resolvedLabel,
    status,
    actions,
    handleAction,
    pendingFriendIds,
  };
}
