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
              fontFamily: "'Space Mono', monospace",
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
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              color: 'var(--fg-muted)',
              letterSpacing: 1,
            }}
          >
            Lucas Costa Vaz
          </div>
        </div>

        {/* Centro - perfeitamente centralizado */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <a
              href="https://github.com/vazlucase"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--fg-muted)',
                textDecoration: 'none',
                fontSize: 12,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: 1,
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--fg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--fg-muted)';
              }}
            >
              GitHub
            </a>
            <a
              href="https://www.instagram.com/vazlk_/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--fg-muted)',
                textDecoration: 'none',
                fontSize: 12,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: 1,
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--fg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--fg-muted)';
              }}
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/in/lucasvaz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--fg-muted)',
                textDecoration: 'none',
                fontSize: 12,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: 1,
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--fg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--fg-muted)';
              }}
            >
              LinkedIn
            </a>
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
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
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              color: 'var(--fg-muted)',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            © 2026
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
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

      <style>{`
        @media (max-width: 768px) {
          footer > div {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center !important;
          }
          footer > div > div {
            text-align: center !important;
          }
          footer > div > div:last-child {
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
}