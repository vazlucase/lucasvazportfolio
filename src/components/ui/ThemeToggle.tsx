interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export function ThemeToggle({ isDark, toggle }: ThemeToggleProps) {
  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-pressed={isDark}
      style={{
        width: 44,
        height: 44,
        minWidth: 44,
        borderRadius: '50%',
        border: '1px solid var(--card-border)',
        background: 'var(--card-bg)',
        color: 'var(--fg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        transition: 'all 0.3s var(--ease-out-expo)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          position: 'absolute',
          transition: 'transform 0.3s var(--ease-out-expo), opacity 0.2s ease',
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(180deg) scale(0)',
          opacity: isDark ? 1 : 0,
        }}
      >
        ☀
      </span>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          position: 'absolute',
          transition: 'transform 0.3s var(--ease-out-expo), opacity 0.2s ease',
          transform: isDark ? 'rotate(-180deg) scale(0)' : 'rotate(0) scale(1)',
          opacity: isDark ? 0 : 1,
        }}
      >
        ☾
      </span>
    </button>
  );
}
