import { useState } from 'react';
import { RevealText } from '../common/RevealText';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { projectsData } from '../../data/projects';
import type { Project } from '../../types';

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleOpenModal = (project: Project) => setSelectedProject(project);
  const handleCloseModal = () => setSelectedProject(null);

  /** Card de projeto reutilizável (desktop grid + mobile scroll) */
  const ProjectCard = ({ project, index, compact = false }: { project: Project; index: number; compact?: boolean }) => {
    const padding = compact ? 28 : 36;
    const imgHeight = compact ? 160 : 180;
    const titleSize = compact ? 20 : 24;

    return (
      <div
        className="project-card"
        role="button"
        tabIndex={0}
        aria-label={`Ver detalhes do projeto ${project.title}`}
        onClick={() => handleOpenModal(project)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenModal(project);
          }
        }}
        style={{
          padding,
          ...(compact ? { minWidth: 150,maxWidth: 200,minHeight: 300, flexShrink: 0 } : {}),
        }}
      >
        {project.featured && (
          <div
            style={{
              position: 'absolute',
              top: compact ? 40 : 40,
              right: compact ? 40 : 40,
              background: 'rgba(var(--fg-rgb), 0.1)',
              backdropFilter: 'blur(4px)',
              color: 'var(--status-glow, #4ade80)',
              fontSize: compact ? 9 : 10,
              fontWeight: 600,
              padding: compact ? '3px 10px' : '4px 12px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: 0.5,
              zIndex: 2,
              border: '1px solid rgba(var(--fg-rgb), 0.1)',
            }}
          >
            ★ Destaque
          </div>
        )}

        {project.image ? (
          <div
            style={{
              width: '100%',
              height: imgHeight,
              borderRadius: 12,
              marginBottom: compact ? 20 : 28,
              overflow: 'hidden',
              background: `linear-gradient(${135 + index * 45}deg, var(--fg-subtle), var(--card-bg))`,
            }}
          >
            <img
              src={project.image}
              alt={`Preview do projeto ${project.title}`}
              loading="lazy"
              width={400}
              height={imgHeight}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: imgHeight,
              borderRadius: 12,
              marginBottom: compact ? 20 : 28,
              background: `linear-gradient(${135 + index * 45}deg, var(--fg-subtle), var(--card-bg))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: compact ? 40 : 48,
              opacity: 0.2,
              fontWeight: 200,
              border: '1px solid var(--card-border)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? 12 : 16 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: compact ? 9 : 10,
              letterSpacing: compact ? 1.5 : 2,
              padding: compact ? '4px 10px' : '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--card-border)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {project.tag}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: compact ? 11 : 12, color: 'var(--fg-muted)' }}>
            {project.year}
          </span>
        </div>

        <h3 style={{ fontSize: titleSize, fontWeight: 600, marginBottom: compact ? 10 : 12, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
          {project.title}
        </h3>
        <p style={{ fontSize: compact ? 13 : 14, color: 'var(--fg-muted)', lineHeight: compact ? 1.6 : 1.65, fontWeight: 300 }}>
          {project.desc}
        </p>
      </div>
    );
  };

  return (
    <section id="projetos" className="section-pad" style={{ position: 'relative', zIndex: 2, padding: '120px 48px' }}>
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
            03 — Projetos
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
            Seleção de <span className="italic-highlight">trabalhos recentes</span>
          </h2>
        </RevealText>

        {/* Grid Desktop */}
        <div className="projects-grid">
          {projectsData.map((project, i) => (
            <RevealText key={project.title} delay={0.15 + i * 0.1}>
              <ProjectCard project={project} index={i} />
            </RevealText>
          ))}
        </div>

        {/* Scroll Mobile */}
        <div className="projects-scroll" style={{ overflowX: 'auto', display: 'flex', gap: 24, paddingBottom: 16 }}>
          {projectsData.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} compact />
          ))}
        </div>
      </div>

      {/* Modal de detalhes */}
      <Modal isOpen={!!selectedProject} onClose={handleCloseModal} title={selectedProject?.title}>
        {selectedProject && (
          <div>
            {/* Imagem — width corrigido de '100' para '100%' */}
            {selectedProject.image && (
              <div
                style={{
                  width: '100%',
                  height: 140,
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--fg-subtle), var(--card-bg))',
                }}
              >
                <img
                  src={selectedProject.image}
                  alt={`Detalhes do projeto ${selectedProject.title}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Tags */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                selectedProject.tag,
                selectedProject.year,
                selectedProject.role,
                selectedProject.duration ? `⏱️ ${selectedProject.duration}` : null,
              ]
                .filter(Boolean)
                .map((label) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--fg-muted)',
                    }}
                  >
                    {label}
                  </span>
                ))}
            </div>

            {/* Descrição */}
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--fg-muted)', marginBottom: 16 }}>
              {selectedProject.fullDescription || selectedProject.desc}
            </p>

            {/* Desafio e Solução */}
            {(selectedProject.challenge || selectedProject.solution) && (
              <div
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  border: '1px solid var(--card-border)',
                }}
              >
                {selectedProject.challenge && (
                  <div style={{ marginBottom: selectedProject.solution ? 12 : 0 }}>
                    <h4 style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: 'var(--fg)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
                      🎯 DESAFIO
                    </h4>
                    <p style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--fg-muted)' }}>
                      {selectedProject.challenge}
                    </p>
                  </div>
                )}
                {selectedProject.solution && (
                  <div>
                    <h4 style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: 'var(--fg)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
                      💡 SOLUÇÃO
                    </h4>
                    <p style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--fg-muted)' }}>
                      {selectedProject.solution}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tecnologias */}
            {selectedProject.techs && selectedProject.techs.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 10, fontWeight: 600, marginBottom: 8, color: 'var(--fg)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
                  🛠️ TECNOLOGIAS
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedProject.techs.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        color: 'var(--fg-muted)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados */}
            {selectedProject.results && selectedProject.results.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 10, fontWeight: 600, marginBottom: 8, color: 'var(--fg)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
                  📈 RESULTADOS
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedProject.results.map((result, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: 'var(--fg-muted)',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: 'var(--status-glow, #4ade80)' }} aria-hidden="true">✓</span>
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selectedProject.url && (
                <Button href={selectedProject.url} variant="primary" size="sm" icon={<span aria-hidden="true">🔗</span>}>
                  Visitar projeto
                </Button>
              )}
              {selectedProject.github && (
                <Button href={selectedProject.github} variant="outline" size="sm" icon={<span aria-hidden="true">🐙</span>}>
                  Ver código
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
