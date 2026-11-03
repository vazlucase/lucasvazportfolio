import { Button } from './Button';
import { Icon } from './Icon';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export function ThemeToggle({ isDark, toggle }: ThemeToggleProps) {
  return (
    <Button
      variant="unstyled"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={isDark}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
      <span>Tema {isDark ? 'claro' : 'escuro'}</span>
    </Button>
  );
}
