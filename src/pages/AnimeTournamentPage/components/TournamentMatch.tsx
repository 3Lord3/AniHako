import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TournamentCard } from './TournamentCard';
import { MatchHeader } from './MatchHeader';
import { ConfirmationDialog } from './ConfirmationDialog';
import type { TournamentParticipant } from '@/hooks/useTournament';
import { getRoundName } from '@/hooks/useTournament';

interface TournamentMatchProps {
  match: {
    id: string;
    participant1: TournamentParticipant | null;
    participant2: TournamentParticipant | null;
    winner: TournamentParticipant | null;
    status?: 'pending' | 'bye' | 'playing' | 'completed';
  };
  roundNumber: number;
  totalRounds: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  onBack?: () => void;
  onBackToBracket?: () => void;
  isActive: boolean;
  totalMatchesInRound: number;
}

export function TournamentMatch({
  match,
  roundNumber,
  totalRounds,
  onSelectWinner,
  onBack,
  onBackToBracket,
  isActive,
  totalMatchesInRound,
}: TournamentMatchProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);

  const roundName = getRoundName(roundNumber, totalRounds);
  const isFinal = roundNumber === totalRounds;

  useEffect(() => {
    setSelectedId(null);
    setIsSelecting(false);
  }, [match.id]);

  const handleSelect = (participant: TournamentParticipant) => {
    if (!isActive || match.winner || isSelecting) return;

    setIsSelecting(true);
    setSelectedId(participant.id);

    setTimeout(() => {
      onSelectWinner(match.id, participant.id);
    }, 800);
  };

  const participant1 = match.participant1;
  const participant2 = match.participant2;

  if (!participant1 || !participant2) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <MatchHeader
        roundName={roundName}
        totalMatches={totalMatchesInRound}
        isFinal={isFinal}
        onBack={onBack}
        onBackToBracket={onBackToBracket ? () => setShowBackDialog(true) : undefined}
      />

      <div className="flex-1 flex items-center justify-center p-1 sm:p-4 md:p-8 min-h-0 overflow-y-auto sm:overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-6 md:grid md:grid-cols-2 md:gap-6 md:relative"
          >
            <ParticipantCard
              participant={participant1}
              isWinner={match.winner?.id === participant1.id}
              isEliminated={match.winner ? match.winner.id !== participant1.id : false}
              isActive={isActive && !match.winner && !isSelecting}
              selectedId={selectedId}
              onSelect={handleSelect}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex">
              <div className="bg-background/90 rounded-full p-2 sm:p-4 shadow-lg">
                <span className="text-2xl sm:text-3xl font-black text-primary">VS</span>
              </div>
            </div>

            <ParticipantCard
              participant={participant2}
              isWinner={match.winner?.id === participant2.id}
              isEliminated={match.winner ? match.winner.id !== participant2.id : false}
              isActive={isActive && !match.winner && !isSelecting}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="md:hidden flex justify-center py-2 sm:py-4 shrink-0">
        <div className="bg-muted rounded-full px-4 sm:px-8 py-2 sm:py-3">
          <span className="text-lg sm:text-2xl font-black text-primary">VS</span>
        </div>
      </div>

      <ConfirmationDialog
        open={showBackDialog}
        onOpenChange={setShowBackDialog}
        onConfirm={() => onBackToBracket?.()}
        title="Вернуться к сетке?"
        description="Прогресс текущего раунда будет сброшен. Все сделанные выборы будут отменены."
        confirmText="Вернуться"
        cancelText="Отмена"
      />
    </div>
  );
}

interface ParticipantCardProps {
  participant: TournamentParticipant;
  isWinner: boolean;
  isEliminated: boolean;
  isActive: boolean;
  selectedId: string | null;
  onSelect: (participant: TournamentParticipant) => void;
}

function ParticipantCard({
  participant,
  isWinner,
  isEliminated,
  isActive,
  selectedId,
  onSelect,
}: ParticipantCardProps) {
  const isSelected = selectedId === participant.id;

  return (
    <motion.div
      animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
      className="relative flex items-center justify-center w-full sm:w-auto sm:flex-1 h-auto sm:h-full"
    >
      <div className="w-full sm:w-auto sm:flex-1 h-full flex items-center justify-center">
        <TournamentCard
          anime={participant.anime}
          isWinner={isWinner}
          isEliminated={isEliminated}
          isSelected={isSelected}
          onClick={isActive ? () => onSelect(participant) : undefined}
          compact
        />
      </div>
    </motion.div>
  );
}
