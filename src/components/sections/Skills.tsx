import { RevealText } from '../common/RevealText';
import { skillsData } from '../../data/skills';

export function Skills() {
  return (
    <>
      <style>{`
        /* Esconde a scrollbar no mobile (mantém funcionalidade) */
        .skills-grid {
          scrollbar-width: none;  /* Firefox */
          -ms-overflow-style: none;  /* IE/Edge */
        }
        .skills-grid::-webkit-scrollbar {
          display: none;  /* Chrome/Safari */
        }

        /* Desktop: transforma o flex em grid, desativa o scroll */
        @media (min-width: 768px) {
          .skills-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 24px !important;
            overflow-x: visible !important;
            scroll-snap-type: none !important;
            padding-bottom: 0 !important;
          }
          .skill-card {
            min-width: auto !important;
            flex: 1 !important;
            scroll-snap-align: none !important;
          }
        }
      `}</style>

      <section id="skills" className="section-pad" style={{ position: 'relative', zIndex: 2, padding: '120px 48px' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealText>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 24 }}>
              02 — Habilidades
            </div>
          </RevealText>

          <RevealText delay={0.1}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 60, maxWidth: 600, color: 'var(--fg)' }}>
              Ferramentas que transformam <span className="italic-highlight">visão em realidade</span>
            </h2>
          </RevealText>

          <div
            className="skills-grid"
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '16px',
              scrollSnapType: 'x mandatory',
              paddingBottom: '8px',
            }}
          >
            {skillsData.map((skill, i) => (
              <RevealText key={skill.title} delay={0.15 + i * 0.1}>
                <div
                  className="skill-card"
                  style={{
                    minWidth: 220,
                    minHeight: 250,
                    backdropFilter: 'blur(1px)',
                    background: 'rgba(233, 233, 233, 0.05)',  // mesmo valor original
                    borderRadius: 12,
                    padding: 24,
                    flex: '0 0 280px',
                    scrollSnapAlign: 'start',
                    overflow: 'visible', // 👈 IMPEDE CORTE DA BORDA NA ANIMAÇÃO
                  }}
                >
                  <div style={{ fontSize: 48, maxWidth: 48, marginBottom: 20, opacity: 0.7, color: 'var(--fg)' }} aria-hidden="true">
                    {skill.icon}
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.02em' }}>
                    {skill.title}
                  </h3>
                  <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.5 }}>
                    {skill.desc}
                  </p>
                </div>
              </RevealText>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
