import { RevealText } from '../common/RevealText';
import { socialLinks } from '../../data/social';

export function Contact() {
  return (
    <section id="contato" className="section-pad" style={{ position: 'relative', zIndex: 2, padding: '120px 48px 80px' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
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
            04 — Contato
          </div>
        </RevealText>

        <RevealText delay={0.1}>
          <h2
            style={{
              fontSize: 'clamp(36px,6vw,72px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: 24,
            }}
          >
            Vamos criar
            <br />
            <span className="italic-highlight">algo incrível?</span>
          </h2>
        </RevealText>

        <RevealText delay={0.2}>
          <p
            style={{
              fontSize: 18,
              color: 'var(--fg-muted)',
              fontWeight: 400,
              maxWidth: 480,
              margin: '0 auto 48px',
              lineHeight: 1.7,
            }}
          >
            Sempre aberto a novos projetos, colaborações e conversas sobre tecnologia e design.
          </p>
        </RevealText>

        <RevealText delay={0.3}>
          <a href="mailto:vaz.lucas.dev@gmail.com" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginRight: 12 }}>
            Enviar E-mail <span style={{ fontSize: 20 }}>→</span>
          </a>
          <a href="https://wa.me/5591991369379?text=Ol%C3%A1!%20Encontrei%20seu%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20poss%C3%ADvel%20projeto.%20Podemos%20falar%20melhor%3F" className="btn-secondary" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 24, marginLeft: 12}}>
            Enviar Mensagem <span style={{ fontSize: 20 }}>→</span>
          </a>
        </RevealText>

        <RevealText delay={0.4}>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 48 }}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                className="nav-link"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  textDecoration: 'none',
                  color: 'var(--fg)',
                  position: 'relative',
                }}
              >
                {social.name}
              </a>
            ))}
          </div>
        </RevealText>
      </div>
    </section>
  );
}