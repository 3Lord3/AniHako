import { useState, useEffect } from 'react';
import { useUserAnimeList } from '@/hooks';
import { useTournament, getRoundName, type Pair } from '@/hooks/useTournament';
import type { AnimeCatalogItem, YummyUserAnimeRate } from '@/types';
import type { AnimeReleaseStatus } from '@/types';
import { TournamentIntro } from './components/TournamentIntro';
import { TournamentMatch } from './components/TournamentMatch';
import { TournamentResults } from './components/TournamentResults';
import { TournamentBracket } from './components/TournamentBracket';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { Swords, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnimeTournamentPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [activePair, setActivePair] = useState<Pair | null>(null);
  const [pairQueue, setPairQueue] = useState<Pair[]>([]);
  const { data: completedList, isLoading } = useUserAnimeList('completed');
  const {
    tournament,
    initializeTournament,
    startRound,
    selectWinner,
    getResults,
    resetTournament,
    resetRound,
  } = useTournament();

  const completedListRaw = (() => {
    if (completedList == null) return [];
    if (Array.isArray(completedList)) return completedList;
    return [];
  })();
  const completedAnime: YummyUserAnimeRate[] = completedListRaw;

  const handleStart = (selectedAnime: YummyUserAnimeRate[]) => {
    if (selectedAnime.length >= 4) {
      const animeItems: AnimeCatalogItem[] = selectedAnime.map(rate => ({
        anime_id: rate.anime_id,
        anime_status: rate.anime_status as AnimeReleaseStatus,
        anime_url: rate.anime_url,
        poster: rate.poster,
        rating: { average: rate.rating, counters: 0 },
        title: rate.title,
        type: rate.type,
        year: rate.year || 0,
        description: '',
        views: 0,
        season: 1 as const,
        episodes: { aired: 0, count: 0 },
      }));
      initializeTournament(animeItems);
      setIsStarted(true);
      setPairQueue([]);
      setActivePair(null);
    }
  };

  const handleRestart = () => {
    resetTournament();
    setIsStarted(false);
    setActivePair(null);
    setPairQueue([]);
  };

  const handleSelectWinner = (pairId: string, winnerId: string) => {
    selectWinner(pairId, winnerId);
    setActivePair(null);

    if (pairQueue.length > 0) {
      const nextPair = pairQueue[0];
      setPairQueue(prev => prev.slice(1));
      setActivePair(nextPair);
    }
  };

  const handleStartRound = () => {
    if (!tournament) return;
    startRound();
  };

  useEffect(() => {
    if (!tournament || !tournament.roundStarted) return;

    const currentRound = tournament.rounds[tournament.currentRoundIndex];
    const playablePairs = currentRound.pairs.filter(
      p => p.status === 'playing' && !p.winner && p.participants.length === 2
    );

    if (playablePairs.length > 0) {
      setPairQueue(playablePairs.slice(1));
      setActivePair(playablePairs[0]);
    }
  }, [tournament, tournament?.roundStarted, tournament?.currentRoundIndex]);

  if (isLoading) {
    return <SuspenseFallback message="Загрузка списка аниме..." />;
  }

  if (!isStarted) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <TournamentIntro
          completedAnime={completedAnime}
          onStart={handleStart}
        />
      </div>
    );
  }

  if (tournament?.isComplete) {
    const results = getResults();
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-foreground">🏆 Турнир завершён!</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Поздравляем с определением победителя</p>
        </div>
        <TournamentResults
          participants={results}
          champion={tournament.champion}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  if (activePair) {
    const currentRound = tournament?.rounds[tournament.currentRoundIndex];
    const currentPairIdx = currentRound?.pairs.findIndex(p => p.id === activePair.id) ?? 0;
    const totalInRound = currentRound?.pairs.filter(p => p.participants.length === 2).length ?? 0;
    const totalRounds = tournament?.rounds.length ?? 1;
    const currentRoundDisplay = tournament?.currentRoundIndex ?? 0;

    const match = {
      id: activePair.id,
      round: currentRoundDisplay + 1,
      matchNumber: currentPairIdx + 1,
      participant1: activePair.participants[0] || null,
      participant2: activePair.participants[1] || null,
      winner: activePair.winner,
      nextMatchId: null,
    };

    const handleBackToBracket = () => {
      resetRound();
      setActivePair(null);
      setPairQueue([]);
    };

    return (
      <div className="fixed inset-0 z-50 bg-background">
        <TournamentMatch
          match={match}
          roundNumber={currentRoundDisplay + 1}
          totalRounds={totalRounds}
          onSelectWinner={handleSelectWinner}
          onBack={undefined}
          onBackToBracket={handleBackToBracket}
          isActive={true}
          totalMatchesInRound={totalInRound}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-foreground">
          <Swords className="w-6 h-6 sm:w-8 sm:h-8" />
          Anime Tournament
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-semibold">
              {getRoundName(tournament?.currentRoundIndex || 0, tournament?.rounds.length || 1)}
            </span>
          </span>
          <span>•</span>
          <span>{completedAnime.length} участников</span>
        </div>
      </div>

      {tournament && (
        <>
          <TournamentBracket
            rounds={tournament.rounds}
            currentRoundIndex={tournament.currentRoundIndex}
            roundStarted={tournament.roundStarted}
          />

          {!tournament.roundStarted && (
            <div className="text-center mt-6 sm:mt-8">
              <Button
                onClick={handleStartRound}
                size="lg"
                className="gap-2 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                Начать {getRoundName(tournament.currentRoundIndex, tournament.rounds.length).toLowerCase()}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
