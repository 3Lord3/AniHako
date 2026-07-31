import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { TIER_COLOR_PRESETS, getTierColorPreset } from '@/types/tier';
import type { TierDefinition, TierColorId } from '@/types/tier';
import { cn } from '@/lib/utils';

interface ManageTierRowProps {
  tier: TierDefinition;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRename: (label: string) => void;
  onRecolor: (color: TierColorId) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function ManageTierRow({
  tier,
  canMoveUp,
  canMoveDown,
  onRename,
  onRecolor,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ManageTierRowProps) {
  const [label, setLabel] = useState(tier.label);
  const color = getTierColorPreset(tier.color);

  useEffect(() => {
    setLabel(tier.label);
  }, [tier.label]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          aria-label="Переместить тир вверх"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          aria-label="Переместить тир вниз"
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>

      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => onRename(label)}
        className="max-w-32"
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Выбрать цвет тира"
          className={cn('size-8 shrink-0 rounded-full ring-1 ring-border', color.bg)}
        />
        <DropdownMenuContent>
          <div className="flex flex-wrap gap-1 p-1.5">
            {TIER_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-label={`Цвет ${preset.id}`}
                onClick={() => onRecolor(preset.id)}
                className={cn(
                  'size-6 rounded-full',
                  preset.bg,
                  preset.id === tier.color && 'ring-2 ring-foreground ring-offset-1'
                )}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Удалить тир" className="ml-auto">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
