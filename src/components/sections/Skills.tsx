import { RevealText } from '../common/RevealText';
import { skillsData } from '../../data/skills';

export function Skills() {
  return (
    <section id="skills" className="section-pad" style={{ position: 'relative', zIndex: 2, padding: '120px 48px' }}>
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
            02 — Habilidades
          </div>
        </RevealText>

        <RevealText delay={0.1}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 60,
              maxWidth: 600,
              color: 'var(--fg)',
            }}
          >
            Ferramentas que transformam{' '}
            <span style={{ fontWeight: 200, fontStyle: 'italic', color: 'var(--fg)' }}>
              visão em realidade
            </span>
          </h2>
        </RevealText>

        <div
          className="skills-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24,
          }}
        >
          {skillsData.map((skill, i) => (
            <RevealText key={i} delay={0.15 + i * 0.1}>
              <div
                className="skill-card"
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid var(--card-border)`,
                  borderRadius: '20px',
                  padding: '32px',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.7, color: 'var(--fg)' }}>
                  {skill.icon}
                </div>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    marginBottom: 12,
                    letterSpacing: '-0.02em',
                    color: 'var(--fg)',
                  }}
                >
                  {skill.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: 'var(--fg-muted)',
                    fontWeight: 400,
                    lineHeight: 1.5,
                  }}
                >
                  {skill.desc}
                </p>
              </div>
            </RevealText>
          ))}
        </div>
      </div>

      <style>{`
        .skill-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .skill-card:hover {
          background: var(--card-hover);
          transform: translateY(-6px);
        }
        .skill-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--fg-muted), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .skill-card:hover::before {
          opacity: 1;
        }
        .skill-card h3 {
          color: var(--fg);
        }
        .skill-card p {
          color: var(--fg-muted);
        }
        @media (max-width: 768px) {
          .skills-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}