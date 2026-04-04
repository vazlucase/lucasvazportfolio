# Lucas Costa Vaz — Portfólio

Portfólio profissional construído com React, TypeScript e Vite. Design minimalista com dark/light mode, animações fluidas e foco em acessibilidade.

## Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite 6** — build e dev server
- **Framer Motion** — animações do modal
- **Outfit + Space Mono** — tipografia (Google Fonts)

## Funcionalidades

- Transição suave entre tema escuro e claro (respeita `prefers-color-scheme`)
- Partículas interativas em canvas (pausa em aba inativa)
- Typewriter effect com múltiplas frases
- Kinetic text com reveal por caractere
- Modais acessíveis com focus trap e `ESC` para fechar
- Scroll progress bar com `aria-progressbar`
- Skip-link para acessibilidade
- JSON-LD Schema.org para SEO
- Responsivo (320px → 1440px+)
- `prefers-reduced-motion` respeitado em todo o projeto

## Como Rodar

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Estrutura

```
src/
├── components/
│   ├── common/         # ParticleField, KineticText, RevealText
│   ├── layout/         # Footer, ProgressBar
│   ├── sections/       # Hero, About, Skills, Projects, Contact
│   └── ui/             # Button, Modal, Marquee, ThemeToggle
├── data/               # Dados tipados (projetos, skills, social)
├── hooks/              # useInView, useThemeTransition
├── styles/             # tokens.css, globals.css, animations.css
└── types/              # Interfaces TypeScript
```

## Deploy

Configurado para Vercel (`vercel.json` incluído).

## Licença

© 2026 Lucas Costa Vaz. Todos os direitos reservados.
