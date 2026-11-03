import { useEffect, useRef, useState } from 'react';
import { RevealText } from '../common/RevealText';
import { Button } from '../ui/Button';
import { Icon, StarMark } from '../ui/Icon';
import { Heading, Text, TextLink } from '../ui/Typography';
import { notifyPet } from '../pet/petMind';

const email = 'vaz.lucas.dev@gmail.com';
const whatsapp = 'https://wa.me/5591991369379?text=Ol%C3%A1!%20Encontrei%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.';

export function Contact() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState('copied');
      notifyPet({ type: 'contact', channel: 'copy' });
    } catch {
      setCopyState('error');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState('idle'), 2600);
  };

  return (
    <section id="contato" className="contact-section section-space">
      <div className="page-width">
        <RevealText>
          <div className="section-kicker mono">
            <span>04 / A PRÓXIMA IDEIA PODE SER A SUA</span>
            <span><span className="availability-dot availability-dot--dark" /> ABERTO A NOVAS CONEXÕES</span>
          </div>
        </RevealText>
        <RevealText>
          <div className="contact-heading-wrap">
            <Heading className="contact-title">BORA FAZER<br />ACONTECER?</Heading>
            <StarMark className="contact-star" />
          </div>
        </RevealText>
        <RevealText delay={0.1}>
          <div className="contact-bottom">
            <Text className="contact-description">
              Tem um projeto em mente?<br />
              Uma ideia meio maluca?<br />
              É por aí que as boas conversas começam.
            </Text>
            <div className="contact-actions">
              <Button href={`mailto:${email}`} onClick={() => notifyPet({ type: 'contact', channel: 'email' })} icon={<Icon name="arrow" />}>Vamos conversar</Button>
              <Button href={whatsapp} onClick={() => notifyPet({ type: 'contact', channel: 'whatsapp' })} variant="secondary" icon={<Icon name="arrow" />}>Chamar no WhatsApp</Button>
            </div>
          </div>
          <div className="contact-email-row">
            <TextLink href={`mailto:${email}`} onClick={() => notifyPet({ type: 'contact', channel: 'email' })} className="contact-email">{email}</TextLink>
            <Button
              variant="unstyled"
              className="copy-email circle-button"
              onClick={copyEmail}
              aria-label={copyState === 'copied' ? 'E-mail copiado' : 'Copiar endereço de e-mail'}
              title="Copiar e-mail"
            >
              <Icon name={copyState === 'copied' ? 'check' : 'copy'} />
            </Button>
          </div>
          <Text className="copy-feedback mono" role="status" aria-live="polite">
            {copyState === 'copied' ? 'E-mail copiado. Vamos conversar!' : copyState === 'error' ? 'Não foi possível copiar. Você também pode abrir o link de e-mail acima.' : '\u00a0'}
          </Text>
        </RevealText>
      </div>
    </section>
  );
}
