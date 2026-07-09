import type { Project } from '../types';

export const projectsData: Project[] = [
  {
    title: 'Site Rusty Pub',
    desc: 'Um site visual para um bar em Belém/PA',
    fullDescription: 'Site com menu incial e informações relevantes sobre o Rusty Pub em belém',
    tag: 'Web Design | Website',
    year: '2026',
    image: '/rustypub.webp',
    url: 'rustypub.com.br',
    github: 'https://github.com/vazlucase/rustypub',
    techs: ['React', 'TypeScript', 'Tailwind', 'Framer Motion', 'EmailJS'],
    featured: true,
    challenge: 'Criar um site para o estabelecimento, contendo informações de localidade e cardápio completo.',
    solution: '',
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
  },
  {
    title: 'Site Institucional do Rusty Na Ilha',
    desc: 'Site institucional para o Rusty Na Ilha.',
    fullDescription: 'Um site moderno e funcional que apresenta o Restaurante Rusty Na Ilha, com informações sobre o local, cardápio e eventos. O projeto foca em performance, acessibilidade e uma experiência de usuário imersiva, com transições suaves e tema escuro/claro.',
    tag: 'Web Design | Institucional',
    year: '2026',
    image: '/rustynailha.webp',
    url: 'https://rustynailha.vercel.app/',
    github: 'https://github.com/vazlucase',
    techs: ['React', 'TypeScript', 'Vite', 'CSS Modules', 'Framer Motion'],
    featured: true,
    challenge: 'Criar um site institucional que não apenas mostrasse as informações do Restaurante Rusty Na Ilha, mas também demonstrasse minhas habilidades técnicas através da própria construção do site.',
    solution: '',
    results: [
      'Lighthouse score 100% em performance',
      'SEO otimizado com meta tags e Open Graph',
      'Design responsivo para todos os dispositivos',
      'Tema escuro/claro com transição suave'
    ],
    role: 'Desenvolvedor web e Designer',
    duration: '2 semanas',
  }
];