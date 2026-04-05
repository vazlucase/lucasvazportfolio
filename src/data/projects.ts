import type { Project } from '../types';

export const projectsData: Project[] = [
  {
    title: 'Beatriz Cavalcante Site',
    desc: 'Site institucional de mentoria para mulheres, com foco em produtividade e gestão de processos.',
    fullDescription: 'Um site completo para mentora Beatriz Cavalcante, desenvolvido para apresentar seus serviços de mentoria, conteúdo gratuito e facilitar o contato com potenciais clientes. O projeto inclui uma experiência de usuário fluida e design acolhedor que reflete a identidade da marca.',
    tag: 'Web Design | Website',
    year: '2026',
    image: '/capabea.webp',
    url: 'https://beatriz-cavalcante-site.vercel.app/',
    github: 'https://github.com/vazlucase/beatriz-cavalcante-site',
    techs: ['React', 'TypeScript', 'Tailwind', 'Framer Motion', 'EmailJS'],
    featured: true,
    challenge: 'Criar um site que transmitisse confiança e acolhimento, ao mesmo tempo que fosse funcional e fácil de navegar para o público-alvo feminino.',
    solution: 'Desenvolvemos um design clean com cores suaves, tipografia elegante e animações sutis que guiam o usuário. Implementamos formulário de contato integrado com EmailJS e seção de conteúdo para blog.',
    results: [
      'Aumento de 40% nos contatos via site',
      'Tempo de carregamento < 2 segundos',
      '100% responsivo em todos os dispositivos',
      'Integração com Instagram para conteúdo dinâmico'
    ],
    role: 'Desenvolvedor Full-stack e UI Designer',
    duration: '3 semanas',
  },
  {
    title: 'Portfólio Lucas Vaz',
    desc: 'Portfólio profissional de Lucas Vaz, desenvolvedor e designer.',
    fullDescription: 'Um portfólio moderno e minimalista que demonstra minhas habilidades como desenvolvedor e designer. O projeto foca em performance, acessibilidade e uma experiência de usuário imersiva, com transições suaves e tema escuro/claro.',
    tag: 'Web Design | Portfolio',
    year: '2026',
    image: '/vazport.webp',
    url: 'https://lucasvazportfolio.vercel.app/',
    github: 'https://github.com/vazlucase/lucasvazportfolio',
    techs: ['React', 'TypeScript', 'Vite', 'CSS Modules', 'Framer Motion'],
    featured: true,
    challenge: 'Criar um portfólio que não apenas mostrasse meus trabalhos, mas também demonstrasse minhas habilidades técnicas através da própria construção do site.',
    solution: 'Desenvolvi uma experiência interativa com efeito de transição de tema suave, animações de entrada, partículas de fundo e um jogo Space Invaders no rodapé como elemento de surpresa.',
    results: [
      'Lighthouse score 100% em performance',
      'SEO otimizado com meta tags e Open Graph',
      'Design responsivo para todos os dispositivos',
      'Tema escuro/claro com transição suave'
    ],
    role: 'Desenvolvedor e Designer',
    duration: '2 semanas',
  }
];