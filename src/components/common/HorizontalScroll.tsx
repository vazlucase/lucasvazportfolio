import { useCallback, useRef, useState, useEffect } from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
}

export function HorizontalScroll({ children }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 10,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10,
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  return (
    <div style={{ position: 'relative' }}>
      {canScroll.right && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            background: 'linear-gradient(to left, var(--bg), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
      {canScroll.left && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            background: 'linear-gradient(to right, var(--bg), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'auto',
          paddingBottom: 16,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
}