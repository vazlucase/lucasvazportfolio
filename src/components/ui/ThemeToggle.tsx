interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export function ThemeToggle({ isDark, toggle }: ThemeToggleProps) {
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--card-border)',
        background: 'var(--card-bg)',
        color: 'var(--fg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          position: 'absolute',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(180deg) scale(0)',
          opacity: isDark ? 1 : 0,
        }}
      >
        ☀
      </span>
      <span
        style={{
          display: 'inline-block',
          position: 'absolute',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
          transform: isDark ? 'rotate(-180deg) scale(0)' : 'rotate(0) scale(1)',
          opacity: isDark ? 0 : 1,
        }}
      >
        ☾
      </span>
    </button>
  );
}