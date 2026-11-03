import { aboutCopy, aboutInfo, tags } from '../../data/about';
import { RevealText } from '../common/RevealText';
import { Button } from '../ui/Button';
import { Icon, StarMark } from '../ui/Icon';
import { Heading, Text } from '../ui/Typography';

export function About() {
  return (
    <section id="sobre" className="about-section section-space">
      <div className="page-width">
        <RevealText>
          <div className="section-kicker mono">
            <span>02 / O NOME POR TRÁS DAS IDEIAS</span>
            <span>CRIATIVIDADE É UM JEITO DE PENSAR.</span>
          </div>
        </RevealText>
        <div className="about-grid">
          <RevealText className="about-title-column">
            <Heading className="section-title">
              LÓGICA NA<br />CABEÇA.<br />DESIGN<br />NA VEIA.
            </Heading>
            <div className="about-signature"><StarMark /><span>lucas vaz.</span></div>
          </RevealText>
          <div className="about-copy-column">
            <RevealText delay={0.12}>
              <Text className="about-lead">Construindo o futuro.<br />Um pixel por vez.</Text>
              {aboutCopy.map((paragraph) => <Text className="about-paragraph" key={paragraph}>{paragraph}</Text>)}
              <div className="tag-list about-tags">
                {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              </div>
            </RevealText>
            <RevealText delay={0.18}>
              <dl className="about-facts">
                {aboutInfo.map((item) => (
                  <div key={item.label}>
                    <dt className="mono">{item.label}</dt>
                    <dd>{item.hasStatus && <span className="availability-dot availability-dot--dark" />}{item.value}</dd>
                  </div>
                ))}
              </dl>
              <Button href="#contato" variant="secondary" className="about-cta" icon={<Icon name="arrow" />}>
                Vamos tirar uma ideia do papel?
              </Button>
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  );
}
