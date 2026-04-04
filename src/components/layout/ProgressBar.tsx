interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura da página"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        zIndex: 1000,
        width: `${progress * 100}%`,
        background: 'var(--fg)',
        transition: 'width 0.1s linear',
      }}
    />
  );
}
