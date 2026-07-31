import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { TierDefinition, TierColorId } from '@/types/tier';
import { ManageTierRow } from './ManageTierRow';

interface ManageTiersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tiers: TierDefinition[];
  onAddTier: () => void;
  onRenameTier: (tierId: string, label: string) => void;
  onRecolorTier: (tierId: string, color: TierColorId) => void;
  onRemoveTier: (tierId: string) => void;
  onReorderTiers: (tierIds: string[]) => void;
}

export function ManageTiersDialog({
  open,
  onOpenChange,
  tiers,
  onAddTier,
  onRenameTier,
  onRecolorTier,
  onRemoveTier,
  onReorderTiers,
}: ManageTiersDialogProps) {
  const swap = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= tiers.length) return;
    const ids = tiers.map((tier) => tier.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorderTiers(ids);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Управление тирами</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {tiers.map((tier, index) => (
            <ManageTierRow
              key={tier.id}
              tier={tier}
              canMoveUp={index > 0}
              canMoveDown={index < tiers.length - 1}
              onRename={(label) => onRenameTier(tier.id, label)}
              onRecolor={(color) => onRecolorTier(tier.id, color)}
              onRemove={() => onRemoveTier(tier.id)}
              onMoveUp={() => swap(index, -1)}
              onMoveDown={() => swap(index, 1)}
            />
          ))}
        </div>

        <Button variant="outline" onClick={onAddTier} className="w-full">
          <Plus className="size-4" />
          Добавить тир
        </Button>
      </DialogContent>
    </Dialog>
  );
}
