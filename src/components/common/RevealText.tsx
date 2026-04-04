import { useInView } from '../../hooks/useInView';

interface RevealTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealText({ children, delay = 0, className = '', style = {} }: RevealTextProps) {
  const [ref, isVisible] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        ...style,
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        opacity: isVisible ? 1 : 0,
        transition: `transform 0.9s var(--ease-out-expo) ${delay}s, opacity 0.9s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
