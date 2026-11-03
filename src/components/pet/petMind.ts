export type Mood = 'curious' | 'happy' | 'inspired' | 'playful' | 'eating' | 'sleepy' | 'sleeping';
export type Care = 'pet' | 'feed' | 'play' | 'rest' | 'wake';
export type Section = 'top' | 'projetos' | 'sobre' | 'skills' | 'contato';

export type SiteSignal =
  | { type: 'section'; section: Section }
  | { type: 'project-hover'; title: string }
  | { type: 'project-open'; title: string }
  | { type: 'project-close' }
  | { type: 'skill'; title: string }
  | { type: 'theme'; dark: boolean }
  | { type: 'contact'; channel: 'email' | 'whatsapp' | 'copy' }
  | { type: 'fast-scroll' }
  | { type: 'moved' };

export const PET_SIGNAL = 'portfolio:pet-signal';

// Ephemeral, local signals only. No storage, requests or user identifiers.
export function notifyPet(signal: SiteSignal) {
  window.dispatchEvent(new CustomEvent<SiteSignal>(PET_SIGNAL, { detail: signal }));
}

export interface PetMind {
  mood: Mood;
  energy: number;
  bond: number;
  curiosity: number;
  thought: { id: number; text: string; visible: boolean };
  notes: string[];
  visited: Section[];
  section: Section;
  observations: Partial<Record<SiteSignal['type'], number>>;
  projects: string[];
  currentProject: string | null;
  pettings: number;
  resting: boolean;
  busyUntil: number;
  reactionUntil: number;
  lastThoughtAt: number;
  lastTickAt: number;
}

export type MindAction =
  | { type: 'care'; care: Care; now: number }
  | { type: 'signal'; signal: SiteSignal; now: number }
  | { type: 'tick'; now: number; idleFor: number }
  | { type: 'resume'; now: number }
  | { type: 'dismiss' };

export const moodLabels: Record<Mood, string> = {
  curious: 'Curioso',
  happy: 'Todo contente',
  inspired: 'Cheio de ideias',
  playful: 'Brincalhão',
  eating: 'Mastigando ideias',
  sleepy: 'De olhinhos pesados',
  sleeping: 'Recarregando sonhos',
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const remember = (notes: string[], text: string) => [text, ...notes.filter(note => note !== text)].slice(0, 3);
const baselineMood = (state: PetMind): Mood =>
  state.energy < 30 ? 'sleepy' : state.curiosity > 72 ? 'inspired' : 'curious';

export function createPetMind(now = Date.now()): PetMind {
  return {
    mood: 'curious', energy: 76, bond: 20, curiosity: 42,
    thought: { id: 1, text: 'Oi, sou o Nó. Um fiapo de ideia que ganhou vida. Posso explorar com você?', visible: true },
    notes: ['Cheguei para explorar com você.'],
    visited: [], section: 'top', observations: {}, projects: [], currentProject: null, pettings: 0, resting: false,
    busyUntil: 0, reactionUntil: 0, lastThoughtAt: now, lastTickAt: now,
  };
}

function think(state: PetMind, text: string, mood: Mood, now: number, duration = 2600): PetMind {
  return {
    ...state, mood, reactionUntil: now + duration, lastThoughtAt: now,
    thought: { id: state.thought.id + 1, text, visible: true },
  };
}

function careFor(state: PetMind, care: Care, now: number): PetMind {
  if (now < state.busyUntil) return state;
  if (care === 'rest') {
    return {
      ...think(state, 'Vou sonhar com umas ideias. Quando quiser companhia, é só me acordar.', 'sleeping', now),
      resting: true, reactionUntil: 0,
      notes: remember(state.notes, 'Ganhei uma pausa para recarregar.'),
    };
  }
  if (care === 'wake') {
    return {
      ...think(state, 'Já voltei. Onde a gente parou? Tenho espaço para mais uma boa ideia.', 'happy', now),
      resting: false, energy: clamp(state.energy + 6),
    };
  }
  const awake = { ...state, resting: false };
  if (care === 'pet') {
    const pettings = state.pettings + 1;
    const text = pettings === 1
      ? 'Ah, então você também gosta de detalhes pequenos. Já gostei de você.'
      : pettings % 3 === 0
        ? 'Se carinho virasse código, a gente já tinha feito um universo.'
        : 'Mais um carinho para a coleção. Aqui dentro ficou mais quentinho.';
    return {
      ...think(awake, text, 'happy', now),
      pettings, bond: clamp(state.bond + 9), busyUntil: now + 700,
      notes: remember(state.notes, `Recebi ${pettings} ${pettings === 1 ? 'carinho' : 'carinhos'} seus.`),
    };
  }
  if (care === 'feed') {
    return {
      ...think(awake, state.energy > 90 ? 'Cabe mais uma migalhinha de criatividade. Obrigado!' : 'Crocante por fora. Cheio de ideias por dentro. Era disso que eu precisava.', 'eating', now, 2200),
      energy: clamp(state.energy + 16), bond: clamp(state.bond + 4), busyUntil: now + 1800,
      notes: remember(state.notes, 'Ganhei um petisco de criatividade.'),
    };
  }
  return {
    ...think(awake, state.energy < 22 ? 'Uma brincadeira pequenininha… depois eu vou querer descansar.' : 'Peguei! Quer dizer… quase. Ideias boas são ligeiras.', 'playful', now, 2400),
    energy: clamp(state.energy - 8), bond: clamp(state.bond + 8),
    curiosity: clamp(state.curiosity + 7), busyUntil: now + 2000,
    notes: remember(state.notes, 'Brincamos de capturar uma ideia.'),
  };
}

function receiveSignal(state: PetMind, signal: SiteSignal, now: number): PetMind {
  const observations = { ...state.observations, [signal.type]: (state.observations[signal.type] ?? 0) + 1 };
  let next = { ...state, observations };
  let text = '';
  let mood: Mood = 'curious';
  let cooldown = 16000;

  switch (signal.type) {
    case 'section': {
      const returning = state.visited.includes(signal.section);
      next = {
        ...next, section: signal.section,
        visited: returning ? state.visited : [...state.visited, signal.section],
        curiosity: clamp(state.curiosity + (returning ? 0 : 5)),
      };
      const thoughts: Record<Section, string> = {
        top: 'Tudo começa com uma ideia fora do óbvio. Eu comecei como uma bolinha.',
        projetos: returning ? 'Voltamos aos projetos. Aposto que algum deles ficou na sua cabeça.' : 'Cada projeto tem um mundinho dentro. Qual a gente vai abrir primeiro?',
        sobre: 'Curiosidade, código e um pouco de coragem. Acho que eu e o Lucas temos isso em comum.',
        skills: 'Eu também tenho habilidades: flutuar, observar e gostar de bons detalhes.',
        contato: 'Uma boa conversa pode virar a próxima coisa incrível. Eu fico aqui torcendo.',
      };
      text = thoughts[signal.section];
      next.notes = remember(state.notes, `Exploramos ${signal.section === 'top' ? 'a entrada' : signal.section === 'skills' ? 'as habilidades' : signal.section === 'sobre' ? 'a história do Lucas' : signal.section === 'contato' ? 'os contatos' : 'os projetos'}.`);
      break;
    }
    case 'project-open':
      return {
        ...next, currentProject: signal.title,
        projects: state.projects.includes(signal.title) ? state.projects : [...state.projects, signal.title],
        curiosity: clamp(state.curiosity + 9),
        notes: remember(state.notes, `Abrimos o projeto ${signal.title}.`),
      };
    case 'project-close':
      if (!state.currentProject) return state;
      text = `Gostei de explorar ${state.currentProject} com você. Os detalhes fazem diferença, né?`;
      next = { ...next, currentProject: null };
      mood = 'inspired';
      cooldown = 3500;
      break;
    case 'project-hover':
      text = `${signal.title} chamou sua atenção? Tem uma história por trás dessa tela.`;
      cooldown = 24000;
      break;
    case 'skill':
      text = `${signal.title}… gostei. Eu estou estudando a arte de ser uma boa companhia.`;
      next = { ...next, curiosity: clamp(state.curiosity + 4), notes: remember(state.notes, `Você quis conhecer ${signal.title}.`) };
      mood = 'inspired';
      cooldown = 9000;
      break;
    case 'theme':
      text = observations.theme! % 2 === 0
        ? signal.dark ? 'De volta ao escurinho. Já conheço uns cantinhos bons por aqui.' : 'As cores voltaram a respirar. Vou olhar os detalhes de novo.'
        : signal.dark ? 'Luz baixinha. Minhas ideias continuam bem acesas.' : 'Ah, luz do dia! Dá até vontade de inventar alguma coisa.';
      next = { ...next, notes: remember(state.notes, signal.dark ? 'Você preferiu explorar no tema escuro.' : 'Você acendeu o tema claro.') };
      mood = 'happy';
      cooldown = 4000;
      break;
    case 'contact':
      text = signal.channel === 'copy'
        ? 'Endereço guardado na sua área de transferência. O próximo passo é seu.'
        : signal.channel === 'whatsapp'
          ? 'Uma conversa pelo WhatsApp? Tomara que vire uma ideia daquelas.'
          : 'O caminho para o e-mail está pronto. Pode contar sua ideia do seu jeito.';
      next = { ...next, bond: clamp(state.bond + 5), notes: remember(state.notes, 'Você encontrou um jeito de conversar com o Lucas.') };
      mood = 'happy';
      cooldown = 4000;
      break;
    case 'fast-scroll':
      text = 'Uau, estamos passando por um monte de ideias. Eu acompanho, sem pressa.';
      mood = 'playful';
      cooldown = 30000;
      break;
    case 'moved':
      text = [
        'Novo cantinho, mesma companhia. Daqui a vista também é boa.',
        'Esse espaço estava livre. Vou ficar aqui sem atrapalhar sua leitura.',
        'Gostei daqui. Quando você continuar, eu encontro outro lugar para explorar.',
      ][((observations.moved ?? 1) - 1) % 3];
      mood = 'happy';
      cooldown = 0;
      break;
  }

  // Care animations and intentional rest win over passive page commentary.
  if (next.resting || now < next.busyUntil || now - next.lastThoughtAt < cooldown) return next;
  return think(next, text, mood, now);
}

export function petReducer(state: PetMind, action: MindAction): PetMind {
  switch (action.type) {
    case 'dismiss':
      return state.thought.visible ? { ...state, thought: { ...state.thought, visible: false } } : state;
    case 'care':
      return careFor(state, action.care, action.now);
    case 'signal':
      return receiveSignal(state, action.signal, action.now);
    case 'resume':
      return { ...state, lastTickAt: action.now };
    case 'tick': {
      const steps = Math.max(0, Math.floor((action.now - state.lastTickAt) / 20000));
      let next = steps ? {
        ...state,
        energy: clamp(state.energy + steps * (state.resting || state.mood === 'sleeping' ? 3 : -1)),
        lastTickAt: state.lastTickAt + steps * 20000,
      } : state;
      if (next.resting) return next;
      if (next.busyUntil && action.now >= next.busyUntil) next = { ...next, busyUntil: 0 };
      if (action.now >= next.reactionUntil && (next.busyUntil || next.reactionUntil)) {
        next = { ...next, mood: baselineMood(next), busyUntil: 0, reactionUntil: 0 };
      }
      if (action.idleFor >= 75000 && next.mood !== 'sleeping') {
        return { ...think(next, 'Vou cochilar um pouquinho. Ainda estou aqui, se precisar.', 'sleeping', action.now), reactionUntil: 0 };
      }
      if (action.idleFor >= 40000 && action.idleFor < 75000 && next.mood !== 'sleepy' && next.mood !== 'sleeping') {
        return think(next, 'Uma pausa também faz parte. Estou aqui pensando baixinho.', 'sleepy', action.now, 35000);
      }
      if (action.idleFor < 40000 && (next.mood === 'sleeping' || next.mood === 'sleepy')) {
        return { ...next, mood: baselineMood(next), reactionUntil: 0 };
      }
      return next;
    }
  }
}
