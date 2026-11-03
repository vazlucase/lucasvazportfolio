export interface Point { x: number; y: number }
export interface Rect { left: number; top: number; right: number; bottom: number }
export interface PetScene {
  width: number;
  height: number;
  pet: { width: number; height: number };
  obstacles: Rect[];
  margin: number;
}
export interface Visit extends Point { section: string }
export interface Journey { destination: Point; points: Point[]; length: number; escaping?: boolean }

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export function petRect(point: Point, scene: PetScene): Rect {
  return { left: point.x, top: point.y, right: point.x + scene.pet.width, bottom: point.y + scene.pet.height };
}

export function isFree(point: Point, scene: PetScene): boolean {
  const rect = petRect(point, scene);
  return rect.left >= scene.margin && rect.top >= scene.margin &&
    rect.right <= scene.width - scene.margin && rect.bottom <= scene.height - scene.margin &&
    !scene.obstacles.some(obstacle => overlaps(rect, obstacle));
}

// Expand obstacles by the entire footprint, including the name label. A line
// segment in this space describes the swept rectangle, not just its center.
export function clearSegment(a: Point, b: Point, scene: PetScene): boolean {
  if (!isFree(a, scene) || !isFree(b, scene)) return false;
  return !scene.obstacles.some(rect => {
    const bounds = {
      left: rect.left - scene.pet.width, right: rect.right,
      top: rect.top - scene.pet.height, bottom: rect.bottom,
    };
    let enter = 0, leave = 1;
    for (const [start, delta, min, max] of [
      [a.x, b.x - a.x, bounds.left, bounds.right],
      [a.y, b.y - a.y, bounds.top, bounds.bottom],
    ]) {
      if (Math.abs(delta) < 0.00001) {
        if (start <= min || start >= max) return false;
      } else {
        const first = (min - start) / delta, last = (max - start) / delta;
        enter = Math.max(enter, Math.min(first, last));
        leave = Math.min(leave, Math.max(first, last));
        if (enter >= leave) return false;
      }
    }
    return enter < leave;
  });
}

export function obstruction(point: Point, scene: PetScene): number {
  const body = petRect(point, scene);
  return scene.obstacles.reduce((area, rect) => area +
    Math.max(0, Math.min(body.right, rect.right) - Math.max(body.left, rect.left)) *
    Math.max(0, Math.min(body.bottom, rect.bottom) - Math.max(body.top, rect.top)), 0);
}

// Scroll can bring content into a previously free position. Leave that overlap
// visibly, reducing it at every step, without entering any additional obstacle.
export function canEscapeSegment(a: Point, b: Point, scene: PetScene): boolean {
  const body = petRect(a, scene);
  const otherObstacles = scene.obstacles.filter(rect => !overlaps(body, rect));
  if (!clearSegment(a, b, { ...scene, obstacles: otherObstacles })) return false;
  let previous = obstruction(a, scene);
  const steps = Math.max(1, Math.ceil(distance(a, b) / 6));
  for (let index = 1; index <= steps; index++) {
    const fraction = index / steps;
    const area = obstruction({ x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction }, scene);
    if (area > previous + 0.01) return false;
    previous = area;
  }
  return true;
}

export function freePlaces(scene: PetScene, random = Math.random): Point[] {
  const maxX = scene.width - scene.margin - scene.pet.width;
  const maxY = scene.height - scene.margin - scene.pet.height;
  if (maxX < scene.margin || maxY < scene.margin) return [];
  const xs = new Set([scene.margin, maxX]), ys = new Set([scene.margin, maxY]);
  // Obstacle edges retain narrow gaps that a coarse grid alone would miss.
  for (const rect of scene.obstacles) {
    for (const x of [rect.left - scene.pet.width - 1, rect.right + 1])
      if (x >= scene.margin && x <= maxX) xs.add(x);
    for (const y of [rect.top - scene.pet.height - 1, rect.bottom + 1])
      if (y >= scene.margin && y <= maxY) ys.add(y);
  }
  for (let x = scene.margin + 32; x < maxX; x += 80) xs.add(x);
  for (let y = scene.margin + 32; y < maxY; y += 80) ys.add(y);
  const places: Point[] = [];
  for (const x of xs) for (const y of ys) {
    const point = { x, y };
    if (isFree(point, scene)) places.push(point);
  }
  // Continuous samples make each visit different, instead of cycling anchors.
  for (let index = 0; index < 100; index++) {
    const point = { x: scene.margin + random() * (maxX - scene.margin), y: scene.margin + random() * (maxY - scene.margin) };
    if (isFree(point, scene)) places.push(point);
  }
  return places;
}

function route(start: Point, end: Point, places: Point[], scene: PetScene, random: () => number): Point[] {
  // Try a fresh bend first, but validate both complete swept segments.
  const bends = places.filter(point => clearSegment(start, point, scene) && clearSegment(point, end, scene))
    .map(point => ({ point, score: random() * 160 + distance(start, point) + distance(point, end) }))
    .sort((a, b) => a.score - b.score);
  const bend = bends.find(({ point }) => distance(start, point) > 28 && distance(end, point) > 28);
  if (bend && distance(start, bend.point) + distance(bend.point, end) < distance(start, end) * 1.65 + 60)
    return [start, bend.point, end];
  if (clearSegment(start, end, scene)) return [start, end];

  // Bounded visibility graph for trips around cards and text blocks.
  const nodes = [start, end, ...places.map(point => ({ point, score: distance(start, point) + distance(point, end) + random() * 100 }))
    .sort((a, b) => a.score - b.score).slice(0, 64).map(({ point }) => point)];
  const costs = nodes.map(() => Infinity), previous = nodes.map(() => -1);
  const pending = new Set(nodes.map((_, index) => index));
  costs[0] = 0;
  while (pending.size) {
    let current = -1;
    for (const index of pending) if (current < 0 || costs[index] < costs[current]) current = index;
    if (current < 0 || !Number.isFinite(costs[current])) break;
    if (current === 1) {
      const path = [end];
      for (let index = previous[1]; index >= 0; index = previous[index]) path.unshift(nodes[index]);
      return path;
    }
    pending.delete(current);
    for (const index of pending) {
      const cost = costs[current] + distance(nodes[current], nodes[index]);
      if (cost < costs[index] && clearSegment(nodes[current], nodes[index], scene)) {
        costs[index] = cost;
        previous[index] = current;
      }
    }
  }
  return [];
}

export function chooseJourney({ scene, start, visits = [], section = 'top', direction = 0, curiosity = 50, random = Math.random }: {
  scene: PetScene; start: Point; visits?: Visit[]; section?: string;
  direction?: number; curiosity?: number; random?: () => number;
}): Journey | null {
  const places = freePlaces(scene, random);
  if (!isFree(start, scene)) {
    const destination = places.sort((a, b) => distance(start, a) - distance(start, b))
      .find(point => canEscapeSegment(start, point, scene));
    return destination ? { destination, points: [start, destination], length: distance(start, destination), escaping: true } : null;
  }
  const recent = visits.slice(-12);
  const unvisited = (radius: number) => places.filter(point => distance(start, point) >= 48 &&
    !recent.some(visit => visit.section === section && distance(visit, point) < radius));
  const spacious = unvisited(44);
  const candidates = spacious.length ? spacious : unvisited(14);
  // Wait for a new opening if all the available places were recently visited.
  // Never trade collision safety or the recent-place exclusion for variety.
  const ranked = candidates.map(point => ({
    point,
    score: random() * 180 + Math.min(distance(start, point), 360) * (0.2 + curiosity / 160) +
      (direction ? (point.y / scene.height - 0.5) * direction * 80 : 0) +
      Math.min(point.x, scene.width - scene.pet.width - point.x, point.y, scene.height - scene.pet.height - point.y) * 0.55 +
      Math.abs(point.x - start.x) * 0.2 +
      Math.min(160, ...recent.filter(visit => visit.section === section).map(visit => distance(visit, point))) * 0.5,
  })).sort((a, b) => b.score - a.score);
  // Prefer reachable destinations. A tempting but disconnected opening must
  // not keep the pet stuck in a corner when other safe journeys are available.
  for (const { point: destination } of ranked.slice(0, 8)) {
    const points = route(start, destination, places, scene, random);
    if (points.length) return { destination, points,
      length: points.reduce((length, point, index) => length + (index ? distance(points[index - 1], point) : 0), 0) };
  }
  const reachable = ranked.find(({ point }) => clearSegment(start, point, scene))?.point;
  return reachable ? { destination: reachable, points: [start, reachable], length: distance(start, reachable) } : null;
}
