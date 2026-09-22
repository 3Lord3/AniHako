import { User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FriendStatusBadge } from './FriendStatusBadge';
import { useAddFriendDialog } from '@/hooks';
import { useT } from '@/i18n';

interface AddFriendDialogProps {
  userId: number;
  userNickname?: string;
}

export function AddFriendDialog({ userId, userNickname }: AddFriendDialogProps) {
  const { t } = useT();
  const {
    open,
    handleOpenChange,
    openDialog,
    idInput,
    handleInputChange,
    handleCheck,
    isChecking,
    displayError,
    hasResult,
    resolvedId,
    resolvedLabel,
    status,
    actions,
    handleAction,
    pendingFriendIds,
  } = useAddFriendDialog(userId, userNickname);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button className="h-9" onClick={openDialog}>
        <UserPlus className="w-4 h-4 mr-2" />
        {t('friends.addFriend')}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('friends.dialogTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="friend-id-input">{t('friends.inputLabel')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="friend-id-input"
                  value={idInput}
                  className="pl-9"
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isChecking) {
                      handleCheck();
                    }
                  }}
                />
              </div>
              <Button variant="outline" onClick={handleCheck} disabled={isChecking}>
                {t('friends.check')}
              </Button>
            </div>
            {displayError && <p className="text-xs text-destructive">{displayError}</p>}
          </div>

          {hasResult && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{resolvedLabel}</p>
                {status ? (
                  <FriendStatusBadge status={status} />
                ) : (
                  <p className="text-xs text-muted-foreground">{t('friends.notConnected')}</p>
                )}
              </div>
              <div className="flex gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={action.variant}
                    disabled={resolvedId != null && pendingFriendIds.has(resolvedId)}
                    onClick={() => handleAction(action.method)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
