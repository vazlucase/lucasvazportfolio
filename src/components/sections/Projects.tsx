import { useState } from 'react';
import { RevealText } from '../common/RevealText';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { projectsData } from '../../data/projects';
import type { Project } from '../../types';

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleOpenModal = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
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

        {/* Grid de projetos */}
        <div className="projects-grid">
          {projectsData.map((project, i) => (
            <RevealText key={i} delay={0.15 + i * 0.1}>
              <div 
                className="project-card" 
                onClick={() => handleOpenModal(project)} 
                style={{ 
                  cursor: 'pointer',
                }}
              >
                {project.featured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      background: 'rgba(var(--fg-rgb), 0.1)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--status-glow, #4ade80)',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: '100px',
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
                      height: 180,
                      borderRadius: 12,
                      marginBottom: 28,
                      overflow: 'hidden',
                      background: `linear-gradient(${135 + i * 45}deg, var(--fg-subtle), var(--card-bg))`,
                    }}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 180,
                      borderRadius: 12,
                      marginBottom: 28,
                      background: `linear-gradient(${135 + i * 45}deg, var(--fg-subtle), var(--card-bg))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                      opacity: 0.2,
                      fontWeight: 200,
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: 2,
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--fg-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {project.tag}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>
                    {project.year}
                  </span>
                </div>

                <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
                  {project.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.65, fontWeight: 300 }}>
                  {project.desc}
                </p>
              </div>
            </RevealText>
          ))}
        </div>

        {/* Versão Mobile - Scroll Horizontal */}
        <div className="projects-scroll" style={{ overflowX: 'auto', display: 'flex', gap: 24, paddingBottom: 16 }}>
          {projectsData.map((project, i) => (
            <div
              key={i}
              onClick={() => handleOpenModal(project)}
              style={{
                minWidth: 280,
                flexShrink: 0,
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 20,
                padding: 28,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {project.featured && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(var(--fg-rgb), 0.1)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--status-glow, #4ade80)',
                    fontSize: 9,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '100px',
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
                    height: 160,
                    borderRadius: 12,
                    marginBottom: 20,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 12,
                    marginBottom: 20,
                    background: `linear-gradient(${135 + i * 45}deg, var(--fg-subtle), var(--card-bg))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                    opacity: 0.2,
                    fontWeight: 200,
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: 1.5,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--fg-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {project.tag}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
                  {project.year}
                </span>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10, color: 'var(--fg)' }}>
                {project.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                {project.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalhes do projeto */}
      <Modal isOpen={!!selectedProject} onClose={handleCloseModal} title={selectedProject?.title}>
        {selectedProject && (
          <div>
            {/* Imagem */}
            {selectedProject.image && (
              <div
                style={{
                  width: '100',
                  height: 140,
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, var(--fg-subtle), var(--card-bg))`,
                }}
              >
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
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
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  padding: '3px 8px',
                  borderRadius: '100px',
                  border: '1px solid var(--card-border)',
                  color: 'var(--fg-muted)',
                }}
              >
                {selectedProject.tag}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  padding: '3px 8px',
                  borderRadius: '100px',
                  border: '1px solid var(--card-border)',
                  color: 'var(--fg-muted)',
                }}
              >
                {selectedProject.year}
              </span>
              {selectedProject.role && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    padding: '3px 8px',
                    borderRadius: '100px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--fg-muted)',
                  }}
                >
                  {selectedProject.role}
                </span>
              )}
              {selectedProject.duration && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    padding: '3px 8px',
                    borderRadius: '100px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--fg-muted)',
                  }}
                >
                  ⏱️ {selectedProject.duration}
                </span>
              )}
            </div>

            {/* Descrição */}
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--fg-muted)',
                marginBottom: 16,
              }}
            >
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
                  <div style={{ marginBottom: 12 }}>
                    <h4
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        marginBottom: 4,
                        color: 'var(--fg)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: 0.5,
                      }}
                    >
                      🎯 DESAFIO
                    </h4>
                    <p style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--fg-muted)' }}>
                      {selectedProject.challenge}
                    </p>
                  </div>
                )}
                {selectedProject.solution && (
                  <div>
                    <h4
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        marginBottom: 4,
                        color: 'var(--fg)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: 0.5,
                      }}
                    >
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
                <h4
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 0.5,
                  }}
                >
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
                        borderRadius: '100px',
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
                <h4
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 0.5,
                  }}
                >
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
                      <span style={{ color: 'var(--status-glow, #4ade80)' }}>✓</span>
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selectedProject.url && (
                <Button href={selectedProject.url} variant="primary" size="sm" icon={<span>🔗</span>}>
                  Visitar
                </Button>
              )}
              {selectedProject.github && (
                <Button href={selectedProject.github} variant="outline" size="sm" icon={<span>🐙</span>}>
                  GitHub
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .projects-grid {
            display: none !important;
          }
          .projects-scroll {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .projects-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .projects-scroll {
            display: none !important;
          }
        }
        .project-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .project-card:hover {
          background: var(--card-hover);
          transform: translateY(-6px);
        }
        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--fg-muted), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .project-card:hover::before {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}