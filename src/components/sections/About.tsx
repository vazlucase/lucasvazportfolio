import { RevealText } from '../common/RevealText';
import { aboutInfo, tags } from '../../data/about';

interface AboutProps {
  isDark: boolean;
}

export function About({ isDark }: AboutProps) {
  return (
    <section id="sobre" className="section-pad" style={{ position: 'relative', zIndex: 2 }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <RevealText>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
              marginBottom: 24,
            }}
          >
            01 — Sobre
          </div>
        </RevealText>

        <div
          className="about-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'start',
          }}
        >
          <div>
            <RevealText delay={0.1}>
              <h2
                style={{
                  fontSize: 'clamp(32px,5vw,56px)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: 32,
                }}
              >
                Construindo o futuro,
                <br />
                <span className="italic-highlight">um pixel por vez.</span>
              </h2>
            </RevealText>

            <RevealText delay={0.2}>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: 'var(--fg-muted)',
                  fontWeight: 300,
                  marginBottom: 24,
                  maxWidth: 520,
                }}
              >
                Tenho 19 anos e sou movido pela curiosidade de entender como as coisas funcionam —
                e por transformá-las em algo melhor. Cada projeto é uma oportunidade de unir
                lógica, estética e propósito.
              </p>
            </RevealText>

            <RevealText delay={0.3}>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: 'var(--fg-muted)',
                  fontWeight: 300,
                  maxWidth: 520,
                }}
              >
                Do design de interfaces ao desenvolvimento de games, busco criar experiências que
                não apenas funcionam — mas que surpreendem e inspiram.
              </p>
            </RevealText>
          </div>

          <div>
            <RevealText delay={0.3}>
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 20,
                  padding: 36,
                  transition: 'background 0.8s ease, border-color 0.8s ease',
                  ...(!isDark ? { boxShadow: 'var(--shadow-sm)' } : {}),
                }}
              >
                {aboutInfo.map((item, i) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '18px 0',
                      borderBottom: i < aboutInfo.length - 1 ? '1px solid var(--divider)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        color: 'var(--fg-muted)',
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: 'var(--fg)',
                      }}
                    >
                      {item.hasStatus && (
                        <span className="status-dot" aria-label="Disponível para trabalho" role="status" />
                      )}
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </RevealText>

            <RevealText delay={0.4}>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: 1,
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--fg-muted)',
                      transition: 'border-color 0.8s ease, color 0.8s ease',
                      background: !isDark ? 'rgba(0,0,0,0.02)' : 'transparent',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  );
}
