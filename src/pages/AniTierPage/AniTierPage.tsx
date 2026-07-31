import { useState } from 'react';
import { useUser } from '@/hooks';
import { useTierList } from '@/hooks/useTierList';
import { LoginRequired } from '@/components/LoginRequired';
import { AniTierPageSkeleton } from '@/components/loaders/PageSkeletons';
import { Button } from '@/components/ui/button';
import { LayoutList, ListPlus, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { TierBoard } from './components/TierBoard';
import { AddAnimeDialog } from './components/AddAnimeDialog';
import { ManageTiersDialog } from './components/ManageTiersDialog';

export function AniTierPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const [isAddAnimeOpen, setIsAddAnimeOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isManageTiersOpen, setIsManageTiersOpen] = useState(false);
  const tierList = useTierList(user?.id);

  if (isUserLoading) {
    return <AniTierPageSkeleton />;
  }

  if (!user) {
    return <LoginRequired message="Для составления тир-листа необходимо войти" />;
  }

  const existingAnimeIds = new Set(Object.keys(tierList.state.items).map(Number));

  return (
    <div className="container mx-auto space-y-4 px-2 py-4 sm:space-y-6 sm:px-4 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          <LayoutList className="size-6 sm:size-7" />
          AniTier
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsManageTiersOpen(true)}>
            <SlidersHorizontal className="size-4" />
            Тиры
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsAddAnimeOpen(true)}>
            <ListPlus className="size-4" />
            Добавить аниме
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsResetOpen(true)}>
            <RotateCcw className="size-4" />
            Сбросить
          </Button>
        </div>
      </div>

      <TierBoard tierList={tierList} />

      <AddAnimeDialog
        open={isAddAnimeOpen}
        onOpenChange={setIsAddAnimeOpen}
        existingAnimeIds={existingAnimeIds}
        onSelect={tierList.addAnime}
      />

      <ConfirmationDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        onConfirm={tierList.reset}
        title="Сбросить тир-лист?"
        description="Тиры вернутся к значениям по умолчанию (S, A, B, C, D), а всё разложенное аниме окажется в «Не оценено»."
        confirmText="Сбросить"
        cancelText="Отмена"
        confirmVariant="destructive"
      />

      <ManageTiersDialog
        open={isManageTiersOpen}
        onOpenChange={setIsManageTiersOpen}
        tiers={tierList.state.tiers}
        onAddTier={tierList.addTier}
        onRenameTier={tierList.renameTier}
        onRecolorTier={tierList.recolorTier}
        onRemoveTier={tierList.removeTier}
        onReorderTiers={tierList.reorderTiers}
      />
    </div>
  );
}
