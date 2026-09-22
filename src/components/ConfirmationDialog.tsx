import type { ComponentProps } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ComponentProps<typeof Button>['variant'];
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  confirmVariant = 'default',
}: ConfirmationDialogProps) {
  const { t } = useT();
  const resolved = {
    title: title ?? t('confirm.title'),
    description: description ?? t('confirm.description'),
    confirmText: confirmText ?? t('common.confirm'),
    cancelText: cancelText ?? t('common.cancel'),
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            {resolved.title}
          </DialogTitle>
          <DialogDescription>{resolved.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {resolved.cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {resolved.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
