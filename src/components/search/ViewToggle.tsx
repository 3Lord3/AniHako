import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
      <Button
        variant="ghost"
        size="icon-sm"
        className={view === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className={view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
        onClick={() => onViewChange('list')}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}