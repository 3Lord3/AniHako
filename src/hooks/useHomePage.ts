import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSchedule, useAnimeList } from './useAnime';
import { groupByDate } from '@/lib/schedule';
import { SEASONS, getCurrentSeason } from '@/lib/seasons';
import type { AnimeScheduleItem } from '@/types/anime';

export function useHomePage() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();
  const seasonName = t(SEASONS[currentSeason].labelKey);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(new Date().toDateString());

  const { data: scheduleData, isLoading: scheduleLoading } = useSchedule();
  const { data: seasonalData, isLoading: seasonalLoading } = useAnimeList({
    season: SEASONS[currentSeason].alias,
    status: ['released', 'ongoing', 'announcement'],
    from_year: currentYear,
    sort_forward: true,
    offset: 0,
    limit: 20,
  });

  const dateGroups = scheduleData ? groupByDate(scheduleData) : new Map();
  const sortedDates = Array.from(dateGroups.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const displayItems: AnimeScheduleItem[] = selectedDateKey
    ? dateGroups.get(selectedDateKey) || []
    : scheduleData || [];

  return {
    currentYear,
    seasonName,
    seasonalData,
    seasonalLoading,
    scheduleData,
    scheduleLoading,
    sortedDates,
    selectedDateKey,
    selectDate: setSelectedDateKey,
    displayItems,
  };
}
