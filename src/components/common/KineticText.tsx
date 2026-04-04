import { useInView } from '../../hooks/useInView';

interface KineticTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export function KineticText({ text, className = '', style = {} }: KineticTextProps) {
  const [ref, isVisible] = useInView({ threshold: 0.1 });

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', ...style }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            transform: isVisible ? 'translateY(0) rotateX(0)' : 'translateY(100%) rotateX(-80deg)',
            opacity: isVisible ? 1 : 0,
            transition: `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s, opacity 0.5s ease ${i * 0.04}s`,
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