import { RevealText } from '../common/RevealText';

export function Marquee() {
  const isDark = typeof window !== 'undefined' 
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;
  
  const marqueeColor = isDark ? 'rgba(235,235,235,0.3)' : 'rgba(28,28,28,0.25)';

  return (
    <RevealText>
      <div style={{ overflow: 'hidden', padding: '60px 0', position: 'relative', zIndex: 2 }}>
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
          }}
        >
          {Array(3).fill(null).map((_, i) => (
            <span key={i}>
              ◐&nbsp; FRONTEND &nbsp;◐&nbsp; DESIGN &nbsp;◑&nbsp; BACKEND &nbsp;◓&nbsp; WEB &nbsp;◐&nbsp; FRONTEND &nbsp;◐&nbsp; DESIGN &nbsp;◑&nbsp; BACKEND &nbsp;◓&nbsp; WEB &nbsp;◐&nbsp;◐&nbsp; FRONTEND &nbsp;◐&nbsp; DESIGN &nbsp;◑&nbsp; BACKEND &nbsp;◓&nbsp; WEB &nbsp;◐&nbsp;
            </span>
          ))}
        </div>
      </div>
    </RevealText>
  );
}