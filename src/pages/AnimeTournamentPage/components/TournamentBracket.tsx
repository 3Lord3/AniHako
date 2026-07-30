import { useState, useEffect } from 'react';
import { Trophy, Swords } from 'lucide-react';
import type { Round, BracketType } from '@/hooks/useTournament';
import { cn } from '@/lib/utils';
import { getRoundName } from '@/hooks/useTournament';
import { PairSlot } from './PairSlot';

interface TournamentBracketProps {
  rounds: Round[];
  currentBracket: BracketType;
  currentRoundInBracket: number;
  roundStarted: boolean;
  winnersRounds: number;
  losersRounds: number;
}

export function TournamentBracket({
  rounds,
  currentBracket,
  currentRoundInBracket,
  roundStarted,
  winnersRounds,
  losersRounds,
}: TournamentBracketProps) {
  const [activeTab, setActiveTab] = useState<BracketType>('winners');
  const wbRounds = rounds.filter(r => r.bracket === 'winners');
  const lbRounds = rounds.filter(r => r.bracket === 'losers');
  const finalRound = rounds.find(r => r.bracket === 'final');

  useEffect(() => {
    setActiveTab(currentBracket);
  }, [currentBracket]);

  // Spacing must grow with how many earlier pairs feed into one later pair, not
  // with the round's raw index — the losers bracket only halves in size every
  // other round (minor/major rounds), unlike the winners bracket which halves
  // every round, so an index-based power-of-two gap badly misaligns it.
  const getMatchSpacing = (bracketRounds: Round[], roundIndex: number) => {
    const firstRoundPairs = bracketRounds[0]?.pairs.length || 1;
    const thisRoundPairs = bracketRounds[roundIndex]?.pairs.length || 1;
    return (firstRoundPairs / thisRoundPairs) * 80;
  };

  // A pair can be pre-marked 'bye' at build time before any real participant
  // has actually landed in it (a lone placeholder slot in a not-yet-reached
  // round) — that's not real progress, just bracket scaffolding, so only a
  // genuine non-placeholder participant counts as "this round has started".
  const roundHasRealData = (round: Round) =>
    round.pairs.some(pair => pair.participants.some(p => !p.isPlaceholder));

  const renderBracket = (bracketRounds: Round[], bracket: BracketType) => {
    if (bracketRounds.length === 0) return null;

    return (
      <div className="w-full overflow-x-auto pb-8 px-2">
        <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 min-w-max px-2">
          {bracketRounds.map((round, idx) => {
            const completedCount = round.pairs.filter(p =>
              p.status === 'completed' || (p.status === 'bye' && p.winner)
            ).length;
            const isCurrentRound = bracket === currentBracket && idx === currentRoundInBracket;

            return (
              <div key={round.index} className="text-center min-w-[80px] sm:min-w-[100px] md:min-w-[140px]">
                <div className={cn(
                  "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium",
                  isCurrentRound && roundStarted ? "bg-primary text-primary-foreground" :
                  isCurrentRound ? "bg-yellow-500 text-black font-bold" :
                  "bg-muted text-foreground"
                )}>
                  {idx === bracketRounds.length - 1 && bracket === 'winners' ? (
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                  ) : (
                    <Swords className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  {getRoundName(bracket, round.roundInBracket, winnersRounds, losersRounds)}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {completedCount}/{round.pairs.length}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 min-w-max px-2">
          {bracketRounds.map((round, roundIdx) => {
            const isCurrentRound = bracket === currentBracket && roundIdx === currentRoundInBracket;
            const isPastRound = bracket === currentBracket && roundIdx < currentRoundInBracket;
            const hasRealData = roundHasRealData(round);

            return (
              <div
                key={round.index}
                className="flex flex-col"
                style={{
                  gap: round.pairs.length <= 2
                    ? `${getMatchSpacing(bracketRounds, roundIdx) / 2}px`
                    : `${getMatchSpacing(bracketRounds, roundIdx)}px`,
                  justifyContent: 'space-around',
                }}
              >
                {round.pairs.map((pair) => {
                  const isPlayable = isCurrentRound && roundStarted && pair.status === 'playing' && !pair.winner;
                  const showPair = isPastRound || isCurrentRound || hasRealData;

                  if (!showPair) {
                    return (
                      <div
                        key={pair.id}
                        className="w-[80px] sm:w-[100px] md:w-[140px] h-[50px] sm:h-[60px] md:h-[70px] bg-muted/30 rounded-lg border-2 border-dashed border-border opacity-50"
                      />
                    );
                  }

                  // pair.winner is never a placeholder (makePair/advanceParticipant
                  // only ever assign a real participant or leave it null), so a
                  // 'bye' pair is a genuine bye exactly when it has a winner.
                  const slot = (p: typeof pair.participants[number] | undefined) =>
                    p && !p.isPlaceholder ? p : null;

                  return (
                    <div
                      key={pair.id}
                      className={cn(
                        "w-[80px] sm:w-[100px] md:w-[140px] transition-all duration-300",
                        pair.winner && "opacity-60",
                        isPlayable && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg"
                      )}
                    >
                      {pair.status === 'bye' ? (
                        pair.winner ? (
                          <div className={cn("bg-card rounded-lg shadow-md overflow-hidden ring-2 ring-yellow-500")}>
                            <PairSlot participant={pair.winner} isWinner={true} isBye={true} />
                            <div className="h-px bg-border" />
                            <div className="h-[22px] sm:h-[24px] md:h-[32px] flex items-center justify-center bg-yellow-500/20 text-[10px] sm:text-xs text-yellow-600 font-medium">
                              BYE
                            </div>
                          </div>
                        ) : (
                          <div className="w-[80px] sm:w-[100px] md:w-[140px] h-[50px] sm:h-[60px] md:h-[70px] bg-muted/10 rounded-lg border border-dashed border-border opacity-30" />
                        )
                      ) : pair.participants.length === 2 ? (
                        <div className={cn(
                          "bg-card rounded-lg shadow-md overflow-hidden",
                          pair.winner && "ring-2 ring-green-500"
                        )}>
                          <PairSlot
                            participant={slot(pair.participants[0])}
                            isWinner={pair.winner?.id === pair.participants[0].id}
                            isBye={false}
                          />
                          <div className="h-px bg-border" />
                          <PairSlot
                            participant={slot(pair.participants[1])}
                            isWinner={pair.winner?.id === pair.participants[1].id}
                            isBye={false}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <PairSlot participant={slot(pair.participants[0])} isWinner={false} isBye={false} />
                          <PairSlot participant={null} isWinner={false} isBye={false} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const tabs: Array<{ id: BracketType; label: string; description: string; available: boolean }> = [
    { id: 'winners' as const, label: 'Сетка победителей', description: 'Проигравшие отправляются в сетку проигравших', available: wbRounds.length > 0 },
    { id: 'losers' as const, label: 'Сетка проигравших', description: 'Проигравшие выбывают из турнира', available: lbRounds.length > 0 },
    { id: 'final' as const, label: 'Гранд-финал', description: 'Победитель сетки победителей против победителя сетки проигравших', available: !!finalRound },
  ].filter(t => t.available);

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div key={tab.id} className={cn(activeTab === tab.id ? 'block' : 'hidden')}>
          <div className="text-center mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {tab.description}
            </p>
          </div>
          {tab.id === 'winners' && renderBracket(wbRounds, 'winners')}
          {tab.id === 'losers' && renderBracket(lbRounds, 'losers')}
          {tab.id === 'final' && finalRound && renderBracket([finalRound], 'final')}
        </div>
      ))}
    </div>
  );
}
