import { useTournamentPage } from '@/hooks';
import { TournamentIntro } from './components/TournamentIntro';
import { TournamentMatch } from './components/TournamentMatch';
import { TournamentResults } from './components/TournamentResults';
import { TournamentBracket } from './components/TournamentBracket';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Swords, Target, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnimeTournamentPage() {
  const {
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
  } = useTournamentPage();

  if (isLoading) {
    return <SuspenseFallback message="Загрузка списка аниме..." />;
  }

  if (!isStarted) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative">
        <button
          onClick={handleIntroBack}
          className="absolute left-2 top-2 sm:left-4 sm:top-4 z-10 flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
          aria-label="На главную"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад</span>
        </button>
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

  if (activePair && tournament && match) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <TournamentMatch
          match={match}
          roundNumber={tournament.currentRoundInBracket + 1}
          totalRounds={totalWbRounds}
          bracket={tournament.currentBracket}
          totalLbRounds={tournament.meta.losersRounds}
          onSelectWinner={handleSelectWinner}
          onBack={undefined}
          onBackToBracket={handleBackToBracket}
          isActive={true}
          totalMatchesInRound={totalInRound}
          currentMatchNumber={currentMatchNumber}
        />
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 relative">
      <button
        onClick={() => setShowExitDialog(true)}
        className="absolute left-2 top-2 sm:left-4 sm:top-4 z-10 flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
        aria-label="Выйти из турнира"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Назад</span>
      </button>

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-foreground">
          <Swords className="w-6 h-6 sm:w-8 sm:h-8" />
          Anime Tournament
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-semibold">{currentRoundName}</span>
          </span>
          <span>•</span>
          <span>{tournament.allParticipants.length} участников</span>
        </div>
      </div>

      <TournamentBracket
        rounds={tournament.rounds}
        currentBracket={tournament.currentBracket}
        currentRoundInBracket={tournament.currentRoundInBracket}
        roundStarted={tournament.roundStarted}
        winnersRounds={tournament.meta.winnersRounds}
        losersRounds={tournament.meta.losersRounds}
      />

      {!tournament.roundStarted && (
        <div className="text-center mt-6 sm:mt-8">
          <Button
            onClick={handleStartRound}
            size="lg"
            className="gap-2 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Начать {currentRoundName.toLowerCase()}
          </Button>
        </div>
      )}

      <ConfirmationDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={handleExitConfirm}
        title="Выйти из турнира?"
        description="Прогресс текущего турнира будет потерян."
        confirmText="Выйти"
        cancelText="Продолжить"
      />
    </div>
  );
}
