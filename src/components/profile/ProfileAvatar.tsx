import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function ProfileAvatar({ src, name, size = 'md' }: ProfileAvatarProps) {
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback className={textSizeClasses[size]}>
        {name[0]?.toUpperCase() || '?'}
      </AvatarFallback>
    </Avatar>
  );
}
