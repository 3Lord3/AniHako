import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/i18n';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function EditableField({ value, onSave, label, placeholder }: EditableFieldProps) {
  const { t } = useT();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder ?? t('register.username')}
        />
        <Button onClick={handleSave}>{t('editable.save')}</Button>
        <Button variant="ghost" onClick={handleCancel}>
          {t('editable.cancel')}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsEditing(true)}
      className="mt-2"
    >
      {label ?? t('editable.edit')}
    </Button>
  );
}
