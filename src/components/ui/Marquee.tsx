import { RevealText } from '../common/RevealText';

interface MarqueeProps {
  isDark: boolean;
}

export function Marquee({ isDark }: MarqueeProps) {
  const marqueeColor = isDark ? 'rgba(235,235,235,0.3)' : 'rgba(28,28,28,0.25)';

  return (
    <RevealText>
      <div
        aria-hidden="true"
        style={{ overflow: 'hidden', padding: '60px 0', position: 'relative', zIndex: 2 }}
      >
        <div
          style={{
            display: 'flex',
            gap: 80,
            whiteSpace: 'nowrap',
            animation: 'marquee 25s linear infinite',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 800,
            color: marqueeColor,
            letterSpacing: '-0.02em',
            transition: 'color 0.4s ease',
          }}
        >
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i}>
              ◐&nbsp; FRONTEND &nbsp;◐&nbsp; DESIGN &nbsp;◑&nbsp; BACKEND &nbsp;◓&nbsp; WEB &nbsp;◐&nbsp; FRONTEND &nbsp;◐&nbsp; DESIGN &nbsp;◑&nbsp; BACKEND &nbsp;◓&nbsp; WEB &nbsp;
            </span>
          ))}
        </div>
      </div>
    </RevealText>
  );
}
