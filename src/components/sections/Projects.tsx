import { useCallback, useState } from 'react';
import { projectsData } from '../../data/projects';
import type { Project } from '../../types';
import { RevealText } from '../common/RevealText';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { Heading, Text } from '../ui/Typography';
import { notifyPet } from '../pet/petMind';

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);
  const close = useCallback(() => {
    setSelected(null);
    notifyPet({ type: 'project-close' });
  }, []);
  const openProject = (project: Project) => {
    setSelected(project);
    notifyPet({ type: 'project-open', title: project.title });
  };

  return (
    <section id="projetos" className="projects-section section-space">
      <div className="page-width">
        <RevealText>
          <div className="section-kicker mono">
            <span>01 / PROJETOS SELECIONADOS</span>
            <span>DESIGN + DESENVOLVIMENTO / 2026</span>
          </div>
          <div className="section-heading-row">
            <Heading className="section-title">
              IDEIAS QUE<br />GANHARAM VIDA<span className="title-period">.</span>
            </Heading>
            <Text className="section-description">
              Cada projeto, um universo.<br />
              Uma seleção de experiências que unem intenção, identidade e boas linhas de código.
            </Text>
          </div>
        </RevealText>

        <div className="project-grid">
          {projectsData.map((project, index) => (
            <RevealText className="project-item" key={project.title} delay={index % 2 ? 0.12 : 0}>
              <article className="project">
                <Button
                  variant="unstyled"
                  className={`project-visual project-visual--${index}`}
                  onClick={() => openProject(project)}
                  onPointerEnter={() => notifyPet({ type: 'project-hover', title: project.title })}
                  aria-label={`Conhecer o projeto ${project.title}`}
                >
                  <span className="project-visual-label mono">SELECIONADO / 0{index + 1}</span>
                  <span className="project-screen">
                    <span className="project-screen-bar" aria-hidden="true">
                      <span /><span /><span />
                      <span className="project-screen-domain">{project.url ? new URL(project.url).hostname : 'lucasvaz.dev'}</span>
                    </span>
                    <img
                      src={project.image}
                      alt={`Página inicial do projeto ${project.title}`}
                      loading="lazy"
                      width="1920"
                      height="1080"
                    />
                  </span>
                  <span className="project-view">
                    <span>VER PROJETO</span><Icon name="arrow" />
                  </span>
                  <span className="project-visual-bottom mono">{project.tag}<Icon name="arrow" /></span>
                </Button>
                <div className="project-caption">
                  <div>
                    <Heading as="h3" className="project-title">{project.title}</Heading>
                    <Text className="project-description">{project.desc}</Text>
                  </div>
                  <Text as="span" className="project-year mono">{project.year}</Text>
                </div>
                <Button
                  variant="unstyled"
                  className="project-detail-link text-link"
                  onClick={() => openProject(project)}
                >
                  Conhecer o projeto<Icon name="arrow" />
                </Button>
              </article>
            </RevealText>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={close} title={selected?.title}>
        {selected && (
          <div className="project-dossier">
            {selected.image && (
              <img className="dossier-image" src={selected.image} alt={`Visão geral de ${selected.title}`} width="1920" height="1080" />
            )}
            <div className="dossier-facts">
              <div><Text className="mono">ESPECIALIDADE</Text><Text>{selected.role}</Text></div>
              <div><Text className="mono">ANO</Text><Text>{selected.year}</Text></div>
              {selected.duration && <div><Text className="mono">DURAÇÃO</Text><Text>{selected.duration}</Text></div>}
            </div>
            <Text className="dossier-description">{selected.fullDescription || selected.desc}</Text>
            <div className="dossier-story">
              {selected.challenge && (
                <div><Heading as="h3">O desafio</Heading><Text>{selected.challenge}</Text></div>
              )}
              {selected.solution && (
                <div><Heading as="h3">O caminho</Heading><Text>{selected.solution}</Text></div>
              )}
            </div>
            {selected.techs && (
              <div className="dossier-stack">
                <Text className="mono">FERRAMENTAS & TECNOLOGIAS</Text>
                <div className="tag-list">
                  {selected.techs.map((tech) => <span className="tag" key={tech}>{tech}</span>)}
                </div>
              </div>
            )}
            {selected.results && (
              <div className="dossier-results">
                <Heading as="h3">Destaques da entrega</Heading>
                <ul>
                  {selected.results.map((result) => <li key={result}><Icon name="check" /><span>{result}</span></li>)}
                </ul>
              </div>
            )}
            <div className="dossier-actions">
              {selected.url && <Button href={selected.url} icon={<Icon name="arrow" />}>Visitar o site</Button>}
              {selected.github && <Button href={selected.github} variant="secondary" icon={<Icon name="arrow" />}>Ver código</Button>}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
