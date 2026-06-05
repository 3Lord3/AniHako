import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function EditableField({ value, onSave, label, placeholder = "Имя пользователя" }: EditableFieldProps) {
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
          placeholder={placeholder}
        />
        <Button onClick={handleSave}>Сохранить</Button>
        <Button variant="ghost" onClick={handleCancel}>
          Отмена
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
      {label || 'Изменить'}
    </Button>
  );
}
