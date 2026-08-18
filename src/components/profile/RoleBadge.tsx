import { Badge } from '@/components/ui/badge';
import { ROLE_VARIANTS } from '@/lib/constants';

interface RoleBadgeProps {
  role: string;
}

function RoleBadge({ role }: RoleBadgeProps) {
  const roleLower = role.toLowerCase();
  const variant = Object.entries(ROLE_VARIANTS).find(([key]) => 
    roleLower.includes(key.toLowerCase())
  )?.[1] || 'outline';

  return (
    <Badge variant={variant}>
      {role}
    </Badge>
  );
}

interface RoleBadgesProps {
  roles: string[] | undefined;
}

export function RoleBadges({ roles }: RoleBadgesProps) {
  if (!roles || roles.length === 0) return null;
  
  return (
    <div className="flex gap-1 mt-2 flex-wrap">
      {roles.map((role) => (
        <RoleBadge key={role} role={role} />
      ))}
    </div>
  );
}
