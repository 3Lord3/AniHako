# План рефакторинга: вынос логики из UI в React-хуки

Цель: компонент — «глупый» рендер; запросы, вычисления и обработчики живут в кастомном хуке фичи;
чистые вычисления — в `src/lib`. Логика тестируется через `renderHook` и unit-тесты, без рендера
компонентов там, где это не нужно.

Слой данных (`src/api`, существующие `src/hooks/use*`, `src/lib/tier*`) уже соответствует цели —
основная проблема в страницах и диалогах.

---

## Этап 0. Соглашения

- Хук фичи → `src/hooks/useXxx.ts`, реэкспорт из `src/hooks/index.ts` (barrel уже есть,
  `useTierList` / `useTournament` лежат там же — новую структуру папок не заводим).
- Чистые функции (без React) → `src/lib/*.ts`, unit-тест в `tests/lib/`.
- В компоненте допустим только вызов `useXxx()` фичи и чисто визуальный локальный стейт
  (открыт/закрыт диалог, hover, `loaded` у `<iframe>`).
- Обвязка над `useMutation` (pending-множества, тексты ошибок, инвалидция) — в хуке,
  не копируется по вызывающим местам.
- Тесты: `createWrapper` из `tests/hooks/useAnime.test.tsx` вынести в `tests/utils/queryWrapper.tsx`
  и переиспользовать. Существующие тесты страниц (`tests/pages/LoginPage.test.tsx`,
  `RegisterPage.test.tsx`, `FriendsPage.test.tsx`) после переноса ужимаются до smoke-рендера,
  проверки логики переезжают в `tests/hooks/` и `tests/lib/`.

---

## Этап 1. Быстрые победы

### 1.1 Убрать защитные IIFE вокруг списка аниме

`useUserAnimeList` (`src/hooks/useAnime.ts:118`) **уже** возвращает `YummyUserAnimeRate[]`
(`userListApi.getUserLists` типизирован как массив, `|| []` внутри `queryFn` закрывает `null`).
Проверки `Array.isArray(...)` в `UserAnimeListPage.tsx:22,54`, `AnimeTournamentPage.tsx:33` и
`AnimeDetailPage.tsx:48` — избыточны. Заменить на `data ?? []` (единственный реальный случай —
`undefined` во время загрузки). Новая утилита не нужна, хук менять не нужно.

### 1.2 `useCatalogPage()` ← `src/pages/CatalogPage.tsx`

Сейчас ~110 строк логики из 153. В хук уезжает:
- чтение/запись `searchParams` (`search`, `genres`, `rating`, `from_year`, `to_year`, `sort_forward`);
- дебаунс поиска и три эффекта синхронизации инпута с URL (`CatalogPage.tsx:35-56`) — самый хрупкий
  кусок в проекте, его нужно покрыть тестом хука;
- `localStorage` для `view` (оставить внутри хука: единственное место использования, отдельный
  `useLocalStorageState` — преждевременная абстракция);
- `updateParams` / `toggleGenre` / `clearSearch` / `clearFiltersOnly` / `hasActiveFilters`;
- `useAnimeList` / `useGenres` / `useUserAnimeList`.

Компонент остаётся ~40 строк разметки: `CatalogControls`, `FilterBadges`, `AnimeGrid`.

### 1.3 `getApiErrorMessage(err, fallback)` → `src/lib/apiError.ts`

Один и тот же разбор `response.data.detail` в `LoginPage.tsx:28` и `RegisterPage.tsx:53`.

### 1.4 `useLoginForm()` / `useRegisterForm()`

Поля, submit, `error`, `isPending`. Валидация регистрации (совпадение паролей, длина пароля и
имени, чекбоксы правил) → чистая `validateRegisterForm(values)` в `src/lib/authValidation.ts`
+ unit-тест; хук её вызывает и кладёт результат в `error`.

### 1.5 `useUserAnimeListPage()` ← `src/pages/UserAnimeListPage.tsx`

Фильтры статуса/избранного через `searchParams`, `displayList`, счётчики по статусам.
Чистая часть → `src/lib/listRate.ts`: `getRateStatus(rate)`, `isRateFavorite(rate)`,
`countListStats(rates)`. Те же два обращения (`mapListIdToStatus(rate.user?.list?.list?.id)` и
`rate.user?.list?.is_fav`) инлайном повторяются в `AnimeGrid.tsx:29-30,156` и
`ViewingOrder.tsx:91-93` — после выноса они переиспользуют функции из `lib`.

**Тесты этапа:** `tests/hooks/useCatalogPage.test.tsx` (синхронизация URL ↔ инпут, дебаунс,
тоггл жанров, сброс фильтров), `tests/hooks/useRegisterForm.test.tsx`,
`tests/lib/authValidation.test.ts`, `tests/lib/apiError.test.ts`, `tests/lib/listRate.test.ts`.

---

## Этап 2. Страницы со сложным поведением

### 2.1 `useHomePage()`

`formatDayMonth` и `groupByDate` (`HomePage.tsx:17-37`) → `src/lib/schedule.ts` (pure + unit-тест).
Хук отдаёт `sortedDates`, `displayItems`, `selectedDateKey`, `selectDate`, `seasonName`,
`currentYear` и состояния загрузки. `AnimeCarousel` не трогаем — embla это готовое решение из стека.

### 2.2 `useAnimeDetailPage(url)` ← `src/pages/AnimeDetailPage.tsx`

Забирает шесть мутаций, `userAnimeById`-мапу, `viewedVideoSet`, `handleAddToList`,
`handleToggleFavorite`, `handleToggleWatched`, `handleEpisodeComplete`, вычисление `userListId` /
`isFavorite` / `canMarkWatched`. Гард «нет пользователя → `navigate('/login')`» повторяется в
компоненте 3 раза — внутри хука это одна функция `requireAuth(fn)`.

### 2.3 `useEpisodeViewer({ videos, translates })` ← `AnimeDetailPage/components/EpisodeViewer.tsx`

Самый перегруженный компонент: 11 вызовов хуков, из них 4 эффекта, восстанавливающих
консистентность выбора (сброс индекса при смене перевода/плеера, подстановка первого плеера,
обрезка индекса под длину списка).

- Чистые хелперы (`filterVideosByTranslate`, `synthesizeTranslatesFromVideos`,
  `filterGenericTranslates`, `comparePlayersByPriority`, `getUniquePlayers`) → `src/lib/episodes.ts`
  + unit-тесты (сейчас они непроверяемы, т.к. не экспортируются).
- Состояние выбора и эффекты → `useEpisodeViewer`.
- Компонент = `PlayerSelector` + `TranslateSelector` + `EpisodeList` + `EpisodePlayer` в `Card`.

### 2.4 `useEpisodePlayerCompletion(video, onEpisodeComplete)` ← `EpisodePlayer.tsx`

`postMessage`-слушатель, fallback-таймер по `video.duration`, refs (`completedRef`, `videoIdRef`,
`onCompleteRef`). `isPlayerEndedEvent` → `src/lib/episodes.ts` (pure, unit-тест). В компоненте
остаются `iframe` и визуальный `loaded`.

### 2.5 `useAnimeMatcher()` ← `src/pages/AnimeMatcherPage.tsx`

`isTransitioning`, `loadNextAnime`, `handleSwipe/handleSkip/handleAdd`, `useRandomAnime`,
`useAddToList`. Состояние модалки описания остаётся в компоненте (чисто визуальное).

Отдельно `components/matcher/SwipeCard.tsx`: ~55 строк ручных touch/mouse-обработчиков и
4 состояния трансформации. В зависимостях уже есть **framer-motion** (используется в
`TournamentCard` и `TournamentMatch`) — сначала пробуем `motion.div` с `drag="x"` / `onDragEnd`
вместо написания собственного `useSwipeGesture`. Свой хук — только если жест на framer-motion
не воспроизведёт нужное поведение (порог, наклон, подсветка направления).

---

## Этап 3. Диалоги, друзья, турнир, тир-лист

### 3.1 `useFriendActions(userId)` — ключевой пункт про мутации

Обвязка над `useAddFriend` / `useRemoveFriend` скопирована в двух местах:
`FriendsPage.tsx:22-38` (pending-set + `MUTATION_ERROR_MESSAGE`) и
`AddFriendDialog.tsx:112-119` (свой `handleAction` + тот же текст ошибки, продублированный
константой в обоих файлах). Один хук отдаёт `{ addFriend, removeFriend, pendingFriendIds, error,
resetError }` и используется обоими местами; константа сообщения живёт в хуке.

### 3.2 `useAddFriendDialog(userId, userNickname)` ← `components/friends/AddFriendDialog.tsx`

~90 строк логики резолва: локальное совпадение по известным отношениям → `useUserByNickname` →
`useFriendStatus`, состояния `submitted` / `notFound` / `resolvedIsSelf` / `isChecking`,
вычисление списка `actions` через `getFriendActions`. Существующий док-комментарий про пайплайн
переезжает к хуку. Компонент = поле ввода + карточка результата + кнопки. Мутации берутся из
`useFriendActions` (см. 3.1).

### 3.3 `useTournamentPage()` ← `AnimeTournamentPage/AnimeTournamentPage.tsx` (277 строк)

`isStarted`, `activePair`, `pairQueue`, эффект наполнения очереди из текущего раунда,
`handleStart` / `handleRestart` / `handleSelectWinner` / `handleStartRound` / `handleExitConfirm` /
`handleBackToBracket`, вычисление объекта `match`, `currentMatchNumber`, `totalInRound`,
`currentRoundName`. Маппинг `YummyUserAnimeRate → AnimeCatalogItem` (`AnimeTournamentPage.tsx:42-56`)
→ `src/lib/tournamentMapper.ts` по образцу существующего `src/lib/tierAnimeMapper.ts` + unit-тест.
Сам `useTournament` не трогаем — он уже соответствует цели.

### 3.4 Поиск аниме с дебаунсом — общий хук

Три места повторяют связку «дебаунс → минимальная длина → запрос → фильтрация уже выбранного»:

| Место | Запрос | Мин. длина |
|---|---|---|
| `Layout/SearchSheet.tsx` | `useAnimeSearch` | 3 |
| `AniTierPage/components/AddAnimeDialog.tsx` | `useAnimeList({ search })` | 2 |
| `AnimeTournamentPage/components/TournamentParticipantSelector.tsx` | `useAnimeList({ search })` | 3 |

Первый использует другой эндпоинт, поэтому объединяем прежде всего два последних:
`useAnimeSearchQuery(query, { minLength, limit, enabled, exclude })` → `{ results, isLoading,
isQueryLongEnough }`. `SearchSheet` подключаем к нему только если `useAnimeSearch` и
`useAnimeList({ search })` действительно взаимозаменяемы; иначе оставляем как есть.

Поверх: `useSearchSheet(open)` (query, фокус инпута, флаги пустого/короткого запроса; `useKeyboardInset`
уже вынесен в хук внутри файла — переносим его в `src/hooks/` как есть) и
`useParticipantSelector(...)` (добавление/удаление, «добавить все просмотренные», состояние дропдауна;
конструирование `YummyUserAnimeRate` из результата поиска — в `lib/tournamentMapper.ts` из 3.3).

### 3.5 `useTierBoardDnd(state, moveAnime)` ← `AniTierPage/components/TierBoard.tsx`

Сенсоры (`MouseSensor` / `TouchSensor` / `KeyboardSensor` с их настройками),
`handleDragStart` / `handleDragEnd` / `handleDragCancel`, `activeAnimeId` и `activeItem`,
`moveTargets`. `resolveDropTarget` уже чистый и покрыт тестами. `useTierList` и
`tierListReducer` — эталон, не трогаем.

### 3.6 Мелочи по остаточному принципу

`profile/EditableField.tsx` и `search/FilterDialog.tsx` содержат по 1–2 состояния, которые и есть
UI-состояние (режим редактирования, строка фильтрации списка жанров). Выносить не нужно —
это не логика фичи. Трогаем, только если появится дублирование.

---

## Что сознательно не трогаем

`src/hooks/useTierList.ts`, `useTournament.ts`, `useAuth.ts`, `useAnime.ts`, `useFriends.ts`,
`useUsers.ts`, `useTheme.ts`, `useDebounce.ts`, весь `src/lib/tier*`, `src/api/*`,
`src/components/ui/*`, `FriendsTabPanel`, `ProfilePage` (там уже почти нет логики).

---

## Порядок работы и проверка

Этапы независимы; внутри этапа пункты тоже. Каждый пункт — отдельный коммит вида
`refactor(<фича>): вынести логику в use<Хук>`.

После каждого коммита:

```
npm run test:run
npm run lint
npm run build
```

Ориентировочная оценка: этап 1 — ~1 день, этап 2 — ~1.5 дня, этап 3 — ~1.5 дня.
