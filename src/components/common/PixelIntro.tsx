import { useEffect, useRef, useState, useCallback } from 'react';

interface PixelIntroProps {
  bgRgb: string;
  fgRgb: string;
  onHeroReveal?: () => void;
  onComplete?: () => void;
}

/* Matriz de Bayer 8x8 (0..63) para a onda de explosão de micro-pixels de cima para baixo */
const BAYER_8X8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

/* Sprites em Pixel Art (matrizes binárias) */
const SHIP_SPRITE = [
  '00000100000',
  '00001110000',
  '00001110000',
  '00111211100',
  '01112221110',
  '11111111111',
  '11011111011',
  '10010001001',
];

const ALIEN_A_FRAME1 = [
  '00100000100',
  '00010001000',
  '00111111100',
  '01101110110',
  '11111111111',
  '10111111101',
  '10100000101',
  '00011011000',
];

const ALIEN_A_FRAME2 = [
  '00100000100',
  '10010001001',
  '10111111101',
  '11101110111',
  '11111111111',
  '01111111110',
  '00100000100',
  '01000000010',
];

const BOSS_SPRITE = [
  '0000111111111111110000',
  '0011111111111111111100',
  '0111122211111122211110',
  '1111222211221122221111',
  '1111111112222111111111',
  '1101111112222111111011',
  '1101011111111111101011',
  '0111011011111101101110',
  '0011001101111011001100',
  '0010000100110010000100',
];

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

interface Alien {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
  alive: boolean;
  killTime: number;
  exploded: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  active: boolean;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface FloatingScore {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
}

function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  sprite: string[],
  centerX: number,
  centerY: number,
  pixelSize: number,
  primaryColor: string,
  secondaryColor: string,
) {
  const rows = sprite.length;
  const cols = sprite[0].length;
  const startX = Math.round(centerX - (cols * pixelSize) / 2);
  const startY = Math.round(centerY - (rows * pixelSize) / 2);

  for (let r = 0; r < rows; r++) {
    const rowStr = sprite[r];
    for (let c = 0; c < cols; c++) {
      const ch = rowStr[c];
      if (ch === '0') continue;
      ctx.fillStyle = ch === '2' ? secondaryColor : primaryColor;
      ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
    }
  }
}

export function PixelIntro({ bgRgb, fgRgb, onHeroReveal, onComplete }: PixelIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  const initialColorsRef = useRef({ bgRgb, fgRgb });
  const callbacksRef = useRef({ onHeroReveal, onComplete });
  callbacksRef.current = { onHeroReveal, onComplete };

  const handleSkip = useCallback(() => {
    callbacksRef.current.onHeroReveal?.();
    callbacksRef.current.onComplete?.();
    setDone(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      callbacksRef.current.onHeroReveal?.();
      callbacksRef.current.onComplete?.();
      setDone(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvasSize();

    const isMobile = width < 640;
    const spriteScale = isMobile ? 3 : 4;
    const bossScale = isMobile ? 4 : 6;

    /* Estrelas de fundo em paralaxe */
    const stars: Star[] = Array.from({ length: isMobile ? 55 : 95 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 35 + Math.random() * 110,
      size: Math.random() > 0.75 ? 2 : 1,
      alpha: 0.15 + Math.random() * 0.55,
    }));

    /* Esquadrão de Aliens (Fase 1: 0.0s -> 2.65s) */
    const alienCols = isMobile ? 5 : 7;
    const alienRows = 2;
    const aliens: Alien[] = [];
    const totalAliens = alienCols * alienRows;

    /* Ordem determinística pseudo-aleatória de abate para limpar a frota até ~2.55s */
    const killOrder = Array.from({ length: totalAliens }, (_, i) => i).sort(
      (a, b) => ((a * 7 + 3) % totalAliens) - ((b * 7 + 3) % totalAliens),
    );

    for (let r = 0; r < alienRows; r++) {
      for (let c = 0; c < alienCols; c++) {
        const idx = r * alienCols + c;
        const orderIdx = killOrder.indexOf(idx);
        aliens.push({
          id: idx,
          col: c,
          row: r,
          x: 0,
          y: 0,
          alive: true,
          killTime: 320 + orderIdx * (2150 / totalAliens),
          exploded: false,
        });
      }
    }

    const bullets: Bullet[] = [];
    const particles: Particle[] = [];
    const floatingScores: FloatingScore[] = [];

    const spawnExplosion = (
      x: number,
      y: number,
      count: number,
      colors: string[],
      speedScale = 1,
      pixelSz = 3,
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = (40 + Math.random() * 190) * speedScale;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: pixelSz + (Math.random() > 0.6 ? 2 : 0),
          color: colors[i % colors.length],
          life: 0,
          maxLife: 320 + Math.random() * 420,
        });
      }
    };

    /*
     * Cronograma exato da cena (7.0s de minigame + 1.45s de onda de micro-pixels de cima para baixo):
     * - 0.00s .. 2.60s: Fase 1 — Nave abate esquadrão Space Invaders
     * - 2.60s .. 5.55s: Fase 2 — Boss entra na arena; duelo intenso até HP zerar
     * - 5.55s .. 6.85s: Fase 3 — Boss derrotado entra em colapso e SOBE até o topo da tela
     * - 6.85s .. 7.00s: Detonação Suprema no ponto mais alto da tela
     * - 6.90s .. 8.38s: Fase 4 — Onda de explosão de micro-pixels de cima para baixo abrindo o site
     */
    const BOSS_ENTER_MS = 2600;
    const BOSS_DEFEAT_MS = 5550;
    const BOSS_EXPLODE_TOP_MS = 6850;
    const WAVE_START_MS = 6900;
    const WAVE_DURATION_MS = 1480;
    const TOTAL_DURATION_MS = WAVE_START_MS + WAVE_DURATION_MS;

    const { bgRgb: bg, fgRgb: fg } = initialColorsRef.current;
    const accentGreen = '#4ade80';
    const bossWarnRed = '#f87171';
    const goldSpark = '#facc15';

    let startTime = 0;
    let lastTime = 0;
    let lastPlayerShot = 0;
    let lastEnemyShot = 0;
    let lastAscentSpark = 0;
    let bossSupernovaSpawned = false;
    let heroTriggered = false;
    let score = 0;
    let shipX = width / 2;
    let rafId = 0;

    const render = (now: number) => {
      if (!startTime) {
        startTime = now;
        lastTime = now;
      }
      const elapsed = now - startTime;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      /* Posição Y da nave do jogador */
      const shipBaseY = height - (isMobile ? 96 : 108);

      /* Atualiza posições do esquadrão de aliens */
      const spacingX = Math.min(isMobile ? 54 : 76, (width - 80) / alienCols);
      const formationW = (alienCols - 1) * spacingX;
      const swayX = Math.sin(elapsed * 0.0032) * Math.min(48, width * 0.08);
      const formationStartX = width / 2 - formationW / 2 + swayX;
      const formationStartY = isMobile ? 118 : 132;

      let currentTargetX: number;
      let nextAlienToKill: Alien | null = null;

      for (let i = 0; i < aliens.length; i++) {
        const a = aliens[i];
        a.x = formationStartX + a.col * spacingX;
        a.y = formationStartY + a.row * (isMobile ? 42 : 52) + Math.min(28, elapsed * 0.008);

        if (a.alive && elapsed >= a.killTime) {
          a.alive = false;
          a.exploded = true;
          score += 150;
          spawnExplosion(a.x, a.y, 14, [`rgb(${fg})`, accentGreen, goldSpark], 0.9, 3);
          floatingScores.push({
            x: a.x,
            y: a.y,
            text: '+150',
            life: 0,
            maxLife: 520,
          });
        }

        if (a.alive && (!nextAlienToKill || a.killTime < nextAlienToKill.killTime)) {
          nextAlienToKill = a;
        }
      }

      /* Estado e trajetória do Boss */
      let bossX = width / 2;
      let bossY = -120;
      let bossHp = 1;
      let bossVisible = false;
      let bossHitFlash = false;

      if (elapsed >= BOSS_ENTER_MS && elapsed < BOSS_EXPLODE_TOP_MS) {
        bossVisible = true;
        if (elapsed < 3150) {
          /* Entrada dramática do Boss */
          const p = (elapsed - BOSS_ENTER_MS) / (3150 - BOSS_ENTER_MS);
          const ease = 1 - Math.pow(1 - Math.min(1, p), 3);
          bossY = -80 + ease * ((isMobile ? 150 : 175) + 80);
          bossX = width / 2;
          bossHp = 1;
        } else if (elapsed < BOSS_DEFEAT_MS) {
          /* Combate ativo com o Boss */
          const fightElapsed = elapsed - 3150;
          const fightTotal = BOSS_DEFEAT_MS - 3150;
          bossX =
            width / 2 +
            Math.sin(fightElapsed * 0.0042) * Math.min(width * 0.26, 220) +
            Math.cos(fightElapsed * 0.009) * 28;
          bossY = (isMobile ? 150 : 175) + Math.sin(fightElapsed * 0.006) * 18;
          bossHp = Math.max(0, 1 - fightElapsed / fightTotal);
          bossHitFlash = Math.floor(elapsed / 65) % 3 === 0;
        } else {
          /*
           * Fase 3 (5.55s -> 6.85s): Boss derrotado sobe até a parte mais alta da tela
           * tremendo e soltando faíscas antes da explosão final no topo!
           */
          const ascentP = Math.min(
            1,
            (elapsed - BOSS_DEFEAT_MS) / (BOSS_EXPLODE_TOP_MS - BOSS_DEFEAT_MS),
          );
          const easeInOut =
            ascentP < 0.5 ? 2 * ascentP * ascentP : 1 - Math.pow(-2 * ascentP + 2, 2) / 2;
          const startY = isMobile ? 150 : 175;
          const topApexY = isMobile ? 44 : 52;
          bossY = startY + (topApexY - startY) * easeInOut;
          const centerLerp = width / 2;
          const shakeX = (Math.random() - 0.5) * (10 + ascentP * 18);
          const shakeY = (Math.random() - 0.5) * 8;
          bossX = centerLerp + shakeX;
          bossY += shakeY;
          bossHp = 0;
          bossHitFlash = Math.floor(elapsed / 45) % 2 === 0;

          if (elapsed - lastAscentSpark > 70) {
            lastAscentSpark = elapsed;
            spawnExplosion(
              bossX + (Math.random() - 0.5) * 90,
              bossY + (Math.random() - 0.5) * 36,
              7,
              [bossWarnRed, goldSpark, `rgb(${fg})`],
              0.75,
              3,
            );
          }
        }
      }

      /* Detonação Suprema do Boss no topo da tela */
      const apexX = width / 2;
      const apexY = isMobile ? 44 : 52;
      if (elapsed >= BOSS_EXPLODE_TOP_MS && !bossSupernovaSpawned) {
        bossSupernovaSpawned = true;
        score += 5000;
        spawnExplosion(
          apexX,
          apexY,
          75,
          [`rgb(${fg})`, accentGreen, goldSpark, bossWarnRed],
          1.9,
          4,
        );
        floatingScores.push({
          x: apexX,
          y: apexY + 24,
          text: 'BOSS DEFEATED +5000',
          life: 0,
          maxLife: 800,
        });
      }

      /* Dispara o Motion Graphics do site assim que a onda começa no topo */
      if (!heroTriggered && elapsed >= WAVE_START_MS) {
        heroTriggered = true;
        callbacksRef.current.onHeroReveal?.();
      }

      /* Piloto automático da nave: mira no próximo alien ou no Boss */
      if (elapsed < BOSS_ENTER_MS && nextAlienToKill) {
        currentTargetX = nextAlienToKill.x + Math.sin(elapsed * 0.014) * 14;
      } else if (bossVisible) {
        currentTargetX = bossX + Math.sin(elapsed * 0.011) * 32;
      } else {
        currentTargetX = width / 2;
      }
      shipX += (currentTargetX - shipX) * Math.min(1, dt * 11);

      /* Disparos automáticos da nave do jogador */
      const fireInterval = elapsed >= BOSS_ENTER_MS ? 95 : 135;
      if (elapsed < BOSS_EXPLODE_TOP_MS - 80 && elapsed - lastPlayerShot >= fireInterval) {
        lastPlayerShot = elapsed;
        bullets.push({
          x: shipX - 8,
          y: shipBaseY - 14,
          vx: 0,
          vy: -680,
          fromPlayer: true,
          active: true,
          color: accentGreen,
        });
        bullets.push({
          x: shipX + 8,
          y: shipBaseY - 14,
          vx: 0,
          vy: -680,
          fromPlayer: true,
          color: `rgb(${fg})`,
          active: true,
        });
      }

      /* Disparos inimigos (aliens e Boss) para dinamismo visual */
      if (elapsed < BOSS_DEFEAT_MS && elapsed - lastEnemyShot >= 280) {
        lastEnemyShot = elapsed;
        if (bossVisible && elapsed >= 3150) {
          [-110, 0, 110].forEach((vx) => {
            bullets.push({
              x: bossX,
              y: bossY + 24,
              vx,
              vy: 310,
              fromPlayer: false,
              active: true,
              color: bossWarnRed,
            });
          });
        } else if (nextAlienToKill) {
          bullets.push({
            x: nextAlienToKill.x,
            y: nextAlienToKill.y + 14,
            vx: 0,
            vy: 260,
            fromPlayer: false,
            active: true,
            color: bossWarnRed,
          });
        }
      }

      /* ─── RENDERIZAÇÃO DO CANVAS ─── */
      ctx.clearRect(0, 0, width, height);

      /* Calcula até onde a onda de explosão de cima para baixo já abriu o site */
      const waveProgress =
        elapsed >= WAVE_START_MS
          ? Math.min(1, (elapsed - WAVE_START_MS) / WAVE_DURATION_MS)
          : 0;

      /* Tamanho bem pequeno dos pixels da onda de abertura (6px mobile, 8px desktop) */
      const wavePixelSize = isMobile ? 6 : 8;
      const waveBandHeight = isMobile ? 150 : 190;
      const waveCenterY = waveProgress * (height + waveBandHeight * 1.35);

      /*
       * Se a onda ainda não cobriu 100%, pintamos o fundo espacial na parte ainda fechada
       * e aplicamos a abertura estruturada de cima para baixo pixel por pixel!
       */
      if (waveProgress <= 0) {
        ctx.fillStyle = `rgb(${bg})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        /* Abaixo da banda da onda: ainda totalmente coberto pelo espaço do minigame */
        const solidStartY = Math.max(
          0,
          Math.floor((waveCenterY + waveBandHeight * 0.55) / wavePixelSize) * wavePixelSize,
        );
        if (solidStartY < height) {
          ctx.fillStyle = `rgb(${bg})`;
          ctx.fillRect(0, solidStartY, width, height - solidStartY);
        }
      }

      /* Grade estrutural sutil no fundo do minigame */
      if (waveProgress < 0.85) {
        ctx.strokeStyle = `rgba(${fg}, 0.04)`;
        ctx.lineWidth = 1;
        const gridStep = 48;
        const minGridY = Math.max(0, waveCenterY - waveBandHeight * 0.4);
        ctx.beginPath();
        for (let x = 0; x < width; x += gridStep) {
          ctx.moveTo(x + 0.5, minGridY);
          ctx.lineTo(x + 0.5, height);
        }
        for (let y = Math.floor(minGridY / gridStep) * gridStep; y < height; y += gridStep) {
          ctx.moveTo(0, y + 0.5);
          ctx.lineTo(width, y + 0.5);
        }
        ctx.stroke();
      }

      /* Estrelas em movimento (apenas na região abaixo da onda) */
      ctx.fillStyle = `rgba(${fg}, 0.45)`;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y += s.speed * dt;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }
        if (waveProgress > 0 && s.y < waveCenterY) continue;
        ctx.globalAlpha = s.alpha;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx.globalAlpha = 1;

      /* Atualiza e desenha projéteis */
      const bossHalfW = (BOSS_SPRITE[0].length * bossScale) / 2;
      const bossHalfH = (BOSS_SPRITE.length * bossScale) / 2;

      for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        if (!b.active) continue;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.y < -20 || b.y > height + 20 || b.x < -20 || b.x > width + 20) {
          b.active = false;
          continue;
        }

        /* Colisão visual com o Boss */
        if (
          b.fromPlayer &&
          bossVisible &&
          Math.abs(b.x - bossX) < bossHalfW &&
          Math.abs(b.y - bossY) < bossHalfH
        ) {
          b.active = false;
          score += 45;
          spawnExplosion(b.x, b.y, 4, [accentGreen, `rgb(${fg})`], 0.55, 2);
          continue;
        }

        if (waveProgress > 0 && b.y < waveCenterY - 20) continue;
        ctx.fillStyle = b.color;
        ctx.fillRect(Math.round(b.x - 1.5), Math.round(b.y - 6), 3, 11);
      }

      /* Desenha Aliens Vivos */
      const alienFrame = Math.floor(elapsed / 220) % 2 === 0 ? ALIEN_A_FRAME1 : ALIEN_A_FRAME2;
      for (let i = 0; i < aliens.length; i++) {
        const a = aliens[i];
        if (!a.alive) continue;
        drawPixelSprite(
          ctx,
          alienFrame,
          a.x,
          a.y,
          spriteScale,
          `rgb(${fg})`,
          accentGreen,
        );
      }

      /* Alerta de entrada do Boss */
      if (elapsed >= BOSS_ENTER_MS - 250 && elapsed < 3250) {
        const blink = Math.floor(elapsed / 110) % 2 === 0;
        if (blink) {
          ctx.save();
          ctx.font = '700 12px "Space Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = bossWarnRed;
          ctx.fillText('// WARNING: BOSS DREADNOUGHT DETECTED //', width / 2, isMobile ? 88 : 96);
          ctx.restore();
        }
      }

      /* Desenha o Boss + Barra de HP */
      if (bossVisible) {
        const primaryBossColor = bossHitFlash ? '#ffffff' : `rgb(${fg})`;
        const secondaryBossColor = bossHp <= 0 ? goldSpark : bossWarnRed;
        drawPixelSprite(
          ctx,
          BOSS_SPRITE,
          bossX,
          bossY,
          bossScale,
          primaryBossColor,
          secondaryBossColor,
        );

        /* Barra de HP estruturada acima do Boss */
        const barW = isMobile ? 120 : 168;
        const barH = 6;
        const barX = Math.round(bossX - barW / 2);
        const barY = Math.round(bossY - bossHalfH - 18);

        ctx.fillStyle = `rgba(${bg}, 0.85)`;
        ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
        ctx.strokeStyle = `rgba(${fg}, 0.45)`;
        ctx.strokeRect(barX - 1.5, barY - 1.5, barW + 3, barH + 3);
        ctx.fillStyle = bossHp > 0.25 ? bossWarnRed : goldSpark;
        ctx.fillRect(barX, barY, Math.max(0, Math.round(barW * bossHp)), barH);
      }

      /* Raio Finalizador quando o Boss chega ao topo (6.50s -> 6.85s) */
      if (elapsed >= 6500 && elapsed < BOSS_EXPLODE_TOP_MS) {
        ctx.save();
        ctx.fillStyle = accentGreen;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(Math.round(shipX - 3), apexY, 6, Math.max(0, shipBaseY - apexY - 16));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(shipX - 1), apexY, 2, Math.max(0, shipBaseY - apexY - 16));
        ctx.restore();
      }

      /* Desenha a Nave do Jogador (visível até a onda chegar nela) */
      if (waveCenterY < shipBaseY + 40) {
        drawPixelSprite(
          ctx,
          SHIP_SPRITE,
          shipX,
          shipBaseY,
          spriteScale,
          `rgb(${fg})`,
          accentGreen,
        );
        /* Propulsor em pixel */
        const flameH = 4 + (Math.floor(elapsed / 40) % 3) * 3;
        ctx.fillStyle = accentGreen;
        ctx.fillRect(Math.round(shipX - 3), Math.round(shipBaseY + 15), 6, flameH);
      }

      /*
       * ─── ONDA DE EXPLOSÃO DE MICRO-PIXELS (DE CIMA PARA BAIXO) ───
       * A partir da explosão do Boss no topo da tela (t = 6.9s),
       * abre o site de cima para baixo em micro-pixels estruturados (6px-8px).
       */
      if (waveProgress > 0) {
        const cols = Math.ceil(width / wavePixelSize);
        const minRow = Math.max(
          0,
          Math.floor((waveCenterY - waveBandHeight * 0.85) / wavePixelSize),
        );
        const maxRow = Math.min(
          Math.ceil(height / wavePixelSize),
          Math.ceil((waveCenterY + waveBandHeight * 0.6) / wavePixelSize),
        );

        for (let r = minRow; r < maxRow; r++) {
          const rowY = r * wavePixelSize;
          for (let c = 0; c < cols; c++) {
            const colX = c * wavePixelSize;
            /* Curvatura concêntrica vinda do epicentro da explosão no topo-centro */
            const normDx = (colX + wavePixelSize * 0.5 - apexX) / (width * 0.65);
            const radialLag = Math.min(1, normDx * normDx) * (waveBandHeight * 0.38);
            const bayer = BAYER_8X8[r & 7][c & 7] / 64;
            const cellFrontY = waveCenterY - radialLag - (bayer - 0.5) * (waveBandHeight * 0.72);
            const diff = cellFrontY - rowY;

            if (diff > 28) {
              /* Acima da frente da onda: pixel totalmente aberto mostrando o site! */
              continue;
            } else if (diff > 14) {
              /* Faísca esmeralda/branca na borda da onda de explosão */
              ctx.fillStyle = (r + c) % 3 === 0 ? accentGreen : `rgba(${fg}, 0.75)`;
              ctx.fillRect(colX + 1, rowY + 1, wavePixelSize - 2, wavePixelSize - 2);
            } else if (diff > 0) {
              /* Sub-bloco intermediário na crista da onda */
              ctx.fillStyle = `rgba(${bg}, 0.65)`;
              ctx.fillRect(colX, rowY, wavePixelSize, wavePixelSize);
              ctx.fillStyle = `rgba(${fg}, 0.35)`;
              ctx.fillRect(colX + 1, rowY + 1, wavePixelSize - 2, wavePixelSize - 2);
            } else {
              /* Abaixo da onda: permanece coberto pelo fundo espacial */
              ctx.fillStyle = `rgb(${bg})`;
              ctx.fillRect(colX, rowY, wavePixelSize, wavePixelSize);
            }
          }
        }
      }

      /* Partículas de explosão em pixels (continuam visíveis sobre a abertura) */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt * 1000;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;

      /* Pontuações flutuantes (+150, +5000) */
      ctx.font = '700 10px "Space Mono", monospace';
      ctx.textAlign = 'center';
      for (let i = floatingScores.length - 1; i >= 0; i--) {
        const fs = floatingScores[i];
        fs.life += dt * 1000;
        if (fs.life >= fs.maxLife) {
          floatingScores.splice(i, 1);
          continue;
        }
        fs.y -= 28 * dt;
        ctx.globalAlpha = 1 - fs.life / fs.maxLife;
        ctx.fillStyle = accentGreen;
        ctx.fillText(fs.text, fs.x, fs.y);
      }
      ctx.globalAlpha = 1;

      /* HUD Arcade no topo e barra de progresso de 7s na base (enquanto o minigame roda) */
      if (elapsed < WAVE_START_MS + 350) {
        const hudAlpha =
          elapsed < WAVE_START_MS
            ? 0.9
            : Math.max(0, 1 - (elapsed - WAVE_START_MS) / 350) * 0.9;
        ctx.save();
        ctx.globalAlpha = hudAlpha;
        ctx.font = '700 11px "Space Mono", monospace';
        ctx.fillStyle = `rgb(${fg})`;
        ctx.textAlign = 'left';
        ctx.fillText(
          `SCORE // ${String(score).padStart(6, '0')}`,
          isMobile ? 20 : 48,
          34,
        );

        ctx.textAlign = 'center';
        ctx.fillStyle = accentGreen;
        const statusText =
          elapsed < BOSS_ENTER_MS
            ? 'AUTO-PILOT // SECTOR 01'
            : elapsed < BOSS_DEFEAT_MS
              ? 'BOSS ENGAGED // DREADNOUGHT'
              : 'TARGET CRITICAL // ASCENDING';
        if (!isMobile) {
          ctx.fillText(statusText, width / 2, 34);
        }

        /* Barra de progresso da missão de 7 segundos na base */
        const progW = Math.min(320, width - 48);
        const progX = Math.round((width - progW) / 2);
        const progY = height - 36;
        const gameRatio = Math.min(1, elapsed / WAVE_START_MS);

        ctx.fillStyle = `rgba(${fg}, 0.14)`;
        ctx.fillRect(progX, progY, progW, 3);
        ctx.fillStyle = accentGreen;
        ctx.fillRect(progX, progY, Math.round(progW * gameRatio), 3);
        ctx.restore();
      }

      if (elapsed < TOTAL_DURATION_MS) {
        rafId = requestAnimationFrame(render);
      } else {
        if (!heroTriggered) {
          callbacksRef.current.onHeroReveal?.();
        }
        callbacksRef.current.onComplete?.();
        setDone(true);
      }
    };

    window.addEventListener('resize', setupCanvasSize);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', setupCanvasSize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />
      <button
        type="button"
        onClick={handleSkip}
        aria-label="Pular animação de introdução"
        style={{
          position: 'fixed',
          top: 20,
          right: 24,
          pointerEvents: 'auto',
          background: 'rgba(var(--bg-rgb), 0.78)',
          color: 'var(--fg)',
          border: '1px solid var(--card-border)',
          padding: '6px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        Pular Intro [ESC] →
      </button>
    </div>
  );
}
