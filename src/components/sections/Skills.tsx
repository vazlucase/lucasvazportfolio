import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { skillsData } from '../../data/skills';
import { RevealText } from '../common/RevealText';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Heading, Text } from '../ui/Typography';
import { notifyPet } from '../pet/petMind';

export function Skills() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section id="skills" className="skills-section section-space">
      <div className="page-width">
        <RevealText>
          <div className="section-kicker mono">
            <span>03 / O QUE EU FAÇO</span>
            <span>DO PRIMEIRO RASCUNHO AO ÚLTIMO PIXEL.</span>
          </div>
          <div className="section-heading-row">
            <Heading className="section-title">VISÃO CRIATIVA.<br />ENTREGA REAL.</Heading>
            <Text className="section-description">Design e desenvolvimento não são etapas isoladas. São partes da mesma conversa — e eu transito entre elas.</Text>
          </div>
        </RevealText>
        <div className="skills-list">
          {skillsData.map((skill, index) => {
            const open = expanded === index;
            return (
              <RevealText key={skill.title} delay={index * 0.05}>
                <div className={`skill-row ${open ? 'is-open' : ''}`}>
                  <Button
                    id={`skill-trigger-${index}`}
                    variant="unstyled"
                    className="skill-trigger"
                    onClick={() => {
                      setExpanded(open ? null : index);
                      if (!open) notifyPet({ type: 'skill', title: skill.title });
                    }}
                    aria-expanded={open}
                    aria-controls={`skill-panel-${index}`}
                  >
                    <span className="skill-number mono">0{index + 1}</span>
                    <span className="skill-name">{skill.title}</span>
                    <span className="skill-toggle"><Icon name={open ? 'minus' : 'plus'} /></span>
                  </Button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`skill-panel-${index}`}
                        role="region"
                        aria-labelledby={`skill-trigger-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="skill-panel"
                      >
                        <div className="skill-panel-inner">
                          <Text>{skill.description}</Text>
                          <div className="tag-list">
                            {skill.desc.split(' · ').map((tool) => <span className="tag" key={tool}>{tool}</span>)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealText>
            );
          })}
        </div>
      </div>
    </section>
  );
}
