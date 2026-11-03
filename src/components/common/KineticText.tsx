import { useInView } from '../../hooks/useInView';

interface KineticTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  active?: boolean;
  baseDelay?: number;
}

export function KineticText({
  text,
  className = '',
  style = {},
  active,
  baseDelay = 0,
}: KineticTextProps) {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  const show = active !== undefined ? active : isVisible;

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', ...style }} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            transform: show ? 'translateY(0) rotateX(0)' : 'translateY(110%) rotateX(-85deg)',
            opacity: show ? 1 : 0,
            transition: `transform 0.75s var(--ease-out-expo) ${baseDelay + i * 0.045}s, opacity 0.55s ease ${baseDelay + i * 0.045}s`,
            transformOrigin: 'bottom',
            minWidth: char === ' ' ? '0.3em' : undefined,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
