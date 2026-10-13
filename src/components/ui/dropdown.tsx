import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
}: DropdownProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center justify-between gap-2 w-full h-9 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-all cursor-pointer',
          triggerClassName
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder ?? t('dropdown.placeholder')}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-soft-lg py-1',
            contentClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                className={cn(
                  'cursor-pointer px-3 py-1.5 text-sm hover:bg-muted focus:bg-muted outline-none first:rounded-t-lg last:rounded-b-lg',
                  isSelected && 'bg-brand-tint text-brand-tint-foreground font-medium'
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
