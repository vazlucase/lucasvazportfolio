import { socialLinks } from '../../data/social';

export function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid var(--card-border)',
        padding: '48px',
        marginTop: '40px',
        background: 'var(--bg)',
      }}
    >
      <div
        className="footer-inner"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Esquerda */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 8,
              color: 'var(--fg)',
            }}
          >
            LCV
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--fg-muted)',
              letterSpacing: 1,
            }}
          >
            Lucas Costa Vaz
          </div>
        </div>

        {/* Centro — usa socialLinks data (DRY) */}
        <div style={{ textAlign: 'center' }}>
          <nav aria-label="Redes sociais" style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                aria-label={`Visitar perfil no ${social.name}`}
              >
                {social.name}
              </a>
            ))}
          </nav>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--fg-muted)',
              letterSpacing: 2,
              opacity: 0.6,
            }}
          >
            Feito com propósito
          </div>
        </div>

        {/* Direita */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--fg-muted)',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            © {new Date().getFullYear()}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--fg-muted)',
              letterSpacing: 2,
              opacity: 0.6,
            }}
          >
            Direitos reservados
          </div>
        </div>
      </div>
    </footer>
  );
}
