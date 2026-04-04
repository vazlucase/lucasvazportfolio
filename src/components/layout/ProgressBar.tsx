interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        zIndex: 1000,
        width: `${progress * 100}%`,
        background: 'var(--text-primary)',
        transition: 'width 0.1s linear',
      }}
    />
  );
}