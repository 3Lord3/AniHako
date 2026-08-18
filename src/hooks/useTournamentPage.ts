import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAnimeList } from './useAnime';
import { useTournament, getRoundName, type Pair } from './useTournament';
import { toTournamentParticipant } from '@/lib/tournamentMapper';
import type { YummyUserAnimeRate } from '@/types';

export function useTournamentPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [activePair, setActivePair] = useState<Pair | null>(null);
  const [pairQueue, setPairQueue] = useState<Pair[]>([]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const navigate = useNavigate();
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

  const completedAnime: YummyUserAnimeRate[] = completedList ?? [];

  const handleStart = (selectedAnime: YummyUserAnimeRate[]) => {
    if (selectedAnime.length >= 4) {
      initializeTournament(selectedAnime.map(toTournamentParticipant));
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

  const handleExitConfirm = () => {
    resetTournament();
    setIsStarted(false);
    setActivePair(null);
    setPairQueue([]);
  };

  const handleIntroBack = () => {
    navigate('/');
  };

  const handleBackToBracket = () => {
    resetRound();
    setActivePair(null);
    setPairQueue([]);
  };

  useEffect(() => {
    if (!tournament || !tournament.roundStarted) return;

    const currentRound = tournament.rounds.find(
      r => r.bracket === tournament.currentBracket && r.roundInBracket === tournament.currentRoundInBracket
    );
    if (!currentRound) return;

    const playablePairs = currentRound.pairs.filter(
      p => p.status === 'playing' && !p.winner && p.participants.length === 2
    );

    if (playablePairs.length > 0) {
      setPairQueue(playablePairs.slice(1));
      setActivePair(playablePairs[0]);
    }
  }, [tournament, tournament?.roundStarted, tournament?.currentBracket, tournament?.currentRoundInBracket]);

  let match = null;
  let currentMatchNumber = 0;
  let totalInRound = 0;
  const totalWbRounds = tournament?.meta.winnersRounds ?? 0;

  if (activePair && tournament) {
    const currentRound = tournament.rounds.find(
      r => r.bracket === tournament.currentBracket && r.roundInBracket === tournament.currentRoundInBracket
    );
    const currentPairIdx = currentRound?.pairs.findIndex(p => p.id === activePair.id) ?? 0;
    totalInRound = currentRound?.pairs.filter(p => p.participants.length === 2 && p.status !== 'bye').length ?? 0;
    // pairQueue holds matches still waiting after this one, so subtracting it
    // from the real-match total gives the 1-based position of the match the
    // user is looking at right now.
    currentMatchNumber = totalInRound - pairQueue.length;

    match = {
      id: activePair.id,
      round: tournament.currentRoundInBracket + 1,
      matchNumber: currentPairIdx + 1,
      participant1: activePair.participants[0] || null,
      participant2: activePair.participants[1] || null,
      winner: activePair.winner,
      nextMatchId: null,
    };
  }

  const currentRoundName = tournament
    ? getRoundName(
        tournament.currentBracket,
        tournament.currentRoundInBracket,
        tournament.meta.winnersRounds,
        tournament.meta.losersRounds
      )
    : '';

  return {
    isLoading,
    isStarted,
    completedAnime,
    tournament,
    activePair,
    showExitDialog,
    setShowExitDialog,
    handleStart,
    handleRestart,
    handleSelectWinner,
    handleStartRound,
    handleExitConfirm,
    handleIntroBack,
    handleBackToBracket,
    getResults,
    match,
    currentMatchNumber,
    totalInRound,
    totalWbRounds,
    currentRoundName,
  };
}
