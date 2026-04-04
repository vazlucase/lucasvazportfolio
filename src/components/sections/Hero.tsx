import { useState, useEffect, useRef } from 'react';
import { KineticText } from '../common/KineticText';

interface HeroProps {
  mounted: boolean;
}

type Seg = { text: string; bold?: boolean };

const PHRASES: Seg[][] = [
  [
    { text: 'Criando experiências digitais na interseção entre ' },
    { text: 'código', bold: true },
    { text: ' e ' },
    { text: 'design', bold: true },
    { text: '.' },
  ],
  [
    { text: 'Transformando ' },
    { text: 'ideias complexas', bold: true },
    { text: ' em interfaces ' },
    { text: 'simples e elegantes', bold: true },
    { text: '.' },
  ],
  [
    { text: 'Desenvolvendo ' },
    { text: 'produtos', bold: true },
    { text: ' que as pessoas ' },
    { text: 'amam usar', bold: true },
    { text: '.' },
  ],
  [
    { text: 'Unindo ' },
    { text: 'performance técnica', bold: true },
    { text: ' com ' },
    { text: 'estética que encanta', bold: true },
    { text: '.' },
  ],
  [
    { text: 'Do ' },
    { text: 'conceito ao deploy', bold: true },
    { text: ', com atenção a cada ' },
    { text: 'detalhe', bold: true },
    { text: '.' },
  ],
];

// Retorna o texto plano de uma frase (sem marcação)
function toPlain(phrase: Seg[]) {
  return phrase.map((s) => s.text).join('');
}

// Renderiza os segmentos visíveis dado o número de chars digitados
function renderSegments(phrase: Seg[], charCount: number) {
  const nodes: React.ReactNode[] = [];
  let remaining = charCount;

  for (let i = 0; i < phrase.length; i++) {
    if (remaining <= 0) break;
    const seg = phrase[i];
    const visible = seg.text.slice(0, remaining);
    remaining -= seg.text.length;

    nodes.push(
      seg.bold ? (
        <strong key={i} style={{ color: 'var(--fg)', fontWeight: 500 }}>
          {visible}
        </strong>
      ) : (
        <span key={i}>{visible}</span>
      )
    );
  }

  return nodes;
}

function useTypewriter(phrases: Seg[][], mounted: boolean) {
  const [charCount, setCharCount] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!mounted) return;

    const fullText = toPlain(phrases[phraseIndex]);
    const isComplete = charCount === fullText.length;
    const isEmpty = charCount === 0;

    const typingSpeed     = 38;
    const deletingSpeed   = 22;
    const pauseAfterType  = 2200;
    const pauseAfterDelete = 400;

    if (!isDeleting && isComplete) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseAfterType);
    } else if (isDeleting && isEmpty) {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
      timeoutRef.current = setTimeout(() => {}, pauseAfterDelete);
    } else if (isDeleting) {
      timeoutRef.current = setTimeout(() => setCharCount((c) => c - 1), deletingSpeed);
    } else {
      timeoutRef.current = setTimeout(() => setCharCount((c) => c + 1), typingSpeed);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [charCount, isDeleting, phraseIndex, phrases, mounted]);

  return { nodes: renderSegments(phrases[phraseIndex], charCount) };
}

function TypewriterText({ mounted }: { mounted: boolean }) {
  const { nodes } = useTypewriter(PHRASES, mounted);

  return (
    <div
      style={{
        height: '4em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 48px',
        maxWidth: 500,
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 1s ease .8s, transform 1s ease .8s',
      }}
    >
      <p
        className="hero-sub"
        style={{
          fontSize: 'clamp(16px,2.5vw,22px)',
          fontWeight: 300,
          color: 'var(--fg-muted)',
          lineHeight: 1.6,
          textAlign: 'center',
          margin: 0,
        }}
      >
        {nodes}
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            background: 'var(--fg)',
            marginLeft: '2px',
            verticalAlign: 'middle',
            animation: 'cursor-blink 0.8s ease-in-out infinite',
            opacity: mounted ? 1 : 0,
          }}
        />
      </p>
    </div>
  );
}

export function Hero({ mounted }: HeroProps) {
  return (
    <section
      id="top"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '120px 24px 80px',
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '8%',
          width: 200,
          height: 200,
          border: '1px solid var(--fg-subtle)',
          borderRadius: '50%',
          animation: 'float-slow 8s ease-in-out infinite',
          opacity: mounted ? 0.4 : 0,
          transition: 'opacity 2s ease,border-color .8s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 120,
          height: 120,
          border: '1px solid var(--fg-subtle)',
          transform: 'rotate(45deg)',
          animation: 'float-slow 6s ease-in-out infinite 1s',
          opacity: mounted ? 0.3 : 0,
          transition: 'opacity 2s ease .5s,border-color .8s ease',
        }}
      />

      {/* Grid de fundo sutil */}
      <div className="bg-grid" />

      <div style={{ textAlign: 'center', maxWidth: 1000 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: 'var(--fg-muted)',
            marginBottom: 40,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1s ease .2s',
          }}
        >
          Desenvolvedor & Designer — Brasil
        </div>

        <h1
          className="hero-title"
          style={{
            fontSize: 'clamp(48px,10vw,120px)',
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            marginBottom: 32,
          }}
        >
          <KineticText text="Lucas" />
          <br />
          <span className="italic-highlight">
            <KineticText text="Costa Vaz" />
          </span>
        </h1>

        <TypewriterText mounted={mounted} />

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease 1s',
          }}
        >
          <a href="#projetos" className="btn-primary">
            Ver Projetos
          </a>
          <a href="#contato" className="btn-secondary">
            Contato
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          opacity: mounted ? 0.4 : 0,
          transition: 'opacity 1.5s ease 1.5s',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          scroll
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background: 'var(--fg)',
            opacity: 0.3,
            animation: 'float-slow 3s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 13vw !important; }
          .hero-sub { font-size: 4.5vw !important; }
        }
      `}</style>
    </section>
  );
}