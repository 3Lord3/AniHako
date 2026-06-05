import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TournamentParticipantSelector } from './TournamentParticipantSelector';
import type { YummyUserAnimeRate } from '@/types';

interface TournamentIntroProps {
  completedAnime: YummyUserAnimeRate[];
  onStart: (selectedAnime: YummyUserAnimeRate[]) => void;
}

export function TournamentIntro({ completedAnime, onStart }: TournamentIntroProps) {
  const [selectedAnime, setSelectedAnime] = useState<YummyUserAnimeRate[]>([]);

  const hasEnoughAnime = selectedAnime.length >= 4;

  const handleStart = () => {
    if (hasEnoughAnime) {
      onStart(selectedAnime);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-4xl sm:text-5xl md:text-6xl">🏆</span>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
        Anime Tournament
      </h1>

      <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-md">
        Выбери лучшее аниме из своего списка! Смотри, как твои фавориты сражаются друг с другом
        в напряжённой турнирной сетке.
      </p>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-2xl mb-6 sm:mb-8">
        <TournamentParticipantSelector
          completedAnime={completedAnime}
          selectedAnime={selectedAnime}
          onSelectionChange={setSelectedAnime}
        />
      </div>

      {hasEnoughAnime ? (
        <Button
          onClick={handleStart}
          size="default" className="gap-2 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          Начать турнир
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="font-medium text-amber-800 dark:text-amber-300 text-sm sm:text-base">
              Выберите минимум 4 аниме для участия в турнире
            </span>
          </div>
          <Link to="/profile/anime">
            <Button variant="outline" size="lg" className="gap-2 text-foreground border-2 hover:bg-accent">
              В каталог
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-8 sm:mt-12 max-w-xs sm:max-w-lg md:max-w-lg">
        <h3 className="font-semibold mb-3 sm:mb-4 text-foreground text-sm sm:text-base">Как это работает?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div className="p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
            <p className="text-foreground text-xs sm:text-sm">Выбирай победителя в каждой паре</p>
          </div>
          <div className="p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">⚔️</div>
            <p className="text-foreground text-xs sm:text-sm">Аниме проходят через раунды</p>
          </div>
          <div className="p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">👑</div>
            <p className="text-foreground text-xs sm:text-sm">Определяем лучшее аниме</p>
          </div>
        </div>
      </div>
    </div>
  );
}
