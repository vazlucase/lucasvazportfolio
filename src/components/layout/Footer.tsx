import { socialLinks } from '../../data/social';
import { Button } from '../ui/Button';
import { Icon, StarMark } from '../ui/Icon';
import { Text, TextLink } from '../ui/Typography';

export function Footer({ onReplayIntro }: { onReplayIntro: () => void }) {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <div className="footer-top">
          <Text className="mono">INDEPENDENTE NA ESSÊNCIA.<br />INQUIETO POR NATUREZA.</Text>
          <nav className="footer-socials" aria-label="Redes sociais">
            {socialLinks.map((social) => (
              <TextLink key={social.name} href={social.url} className="text-link">
                {social.name}<Icon name="arrow" />
              </TextLink>
            ))}
          </nav>
          <TextLink href="#top" className="footer-top-link text-link">
            Voltar ao topo<Icon name="arrow" />
          </TextLink>
        </div>
        <TextLink href="#top" className="footer-wordmark" aria-label="Lucas Vaz — voltar ao início">
          <span>LUCAS VAZ</span><StarMark />
        </TextLink>
        <div className="footer-bottom mono">
          <div className="footer-credits">
            <span>© {new Date().getFullYear()} LUCAS COSTA VAZ</span>
            <span>DESIGN & CÓDIGO, COM PERSONALIDADE.</span>
          </div>
          <div className="footer-actions">
            <TextLink href="/painel" className="footer-panel-link text-link">Painel do site<Icon name="arrow" /></TextLink>
            <Button variant="unstyled" className="footer-replay" onClick={onReplayIntro}>
              Rever abertura<Icon name="play" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
