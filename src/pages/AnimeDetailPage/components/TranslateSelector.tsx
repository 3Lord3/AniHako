import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { useT } from '@/i18n';
import type { AnimeTranslate } from '@/types';

interface TranslateSelectorProps {
  translates: AnimeTranslate[];
  value: number | null;
  onChange: (value: number) => void;
}

export function TranslateSelector({ translates, value, onChange }: TranslateSelectorProps) {
  const { t } = useT();
  if (!translates || translates.length <= 1) return null;

  const options: DropdownOption[] = translates.map((t) => ({
    value: String(t.value),
    label: t.title,
  }));

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {t('episodes.translateLabel')}
      </div>
      <Dropdown
        options={options}
        value={value != null ? String(value) : null}
        onChange={(v) => onChange(Number(v))}
        placeholder={t('episodes.translatePlaceholder')}
      />
    </div>
  );
}
