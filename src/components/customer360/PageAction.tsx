import { Link } from 'react-router-dom';
import { Button, type ButtonSize, type ButtonVariant } from '../ui/Button';

export interface PageActionSpec {
  id: string;
  label: string;
  variant: ButtonVariant;
  href?: string;
  onClick?: () => void;
}

// Spec §02: envoltura de DS Button. Maximum two, always at the right edge of the
// header. size="md" in Resumen, size="sm" in every deep tab.
export function PageAction({ action, size }: { action: PageActionSpec; size: ButtonSize }) {
  if (action.href) {
    return (
      <Link to={action.href}>
        <Button variant={action.variant} size={size}>
          {action.label}
        </Button>
      </Link>
    );
  }
  return (
    <Button variant={action.variant} size={size} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}
