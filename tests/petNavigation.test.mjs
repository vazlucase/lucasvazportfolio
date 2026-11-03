import assert from 'node:assert/strict';
import test from 'node:test';
import { canEscapeSegment, chooseJourney, clearSegment, distance, freePlaces, isFree, obstruction, overlaps, petRect } from '../src/components/pet/petNavigation.ts';

const scene = (overrides = {}) => ({ width: 1000, height: 700, pet: { width: 108, height: 132 }, margin: 12, obstacles: [], ...overrides });
function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
function verifyTrip(journey, world) {
  assert(isFree(journey.destination, world), 'destination must contain the entire pet');
  for (let index = 1; index < journey.points.length; index++) {
    const a = journey.points[index - 1], b = journey.points[index];
    // Independent dense sampling verifies the swept body, not just waypoints.
    for (let step = 0; step <= 100; step++) {
      const rect = petRect({ x: a.x + (b.x - a.x) * step / 100, y: a.y + (b.y - a.y) * step / 100 }, world);
      assert(!world.obstacles.some(obstacle => overlaps(rect, obstacle)));
    }
  }
}

test('swept body detects thin obstacles between safe endpoints', () => {
  const world = scene({ obstacles: [{ left: 500, top: 200, right: 501, bottom: 400 }] });
  const start = { x: 300, y: 250 }, end = { x: 650, y: 250 };
  assert(isFree(start, world)); assert(isFree(end, world));
  assert.equal(clearSegment(start, end, world), false);
  assert.equal(clearSegment({ x: 300, y: 20 }, { x: 650, y: 20 }, world), true);
});

test('the name label and viewport edges belong to the protected footprint', () => {
  const world = scene({ obstacles: [{ left: 10, top: 125, right: 160, bottom: 140 }] });
  assert.equal(isFree({ x: 12, y: 12 }, world), false);
  assert.equal(isFree({ x: -1, y: 200 }, world), false);
  assert.equal(isFree({ x: 900, y: 600 }, world), false);
});

test('no place is invented when the viewport is full or smaller than the pet', () => {
  const full = scene({ obstacles: [{ left: 0, top: 0, right: 1000, bottom: 700 }] });
  assert.deepEqual(freePlaces(full), []);
  assert.equal(chooseJourney({ scene: full, start: { x: 12, y: 12 } }), null);
  assert.deepEqual(freePlaces(scene({ width: 80, height: 100 })), []);
});

test('unreachable openings do not prevent visible trips in the current free region', () => {
  const world = scene({ obstacles: [{ left: 120, top: 0, right: 800, bottom: 700 }] });
  const journey = chooseJourney({ scene: world, start: { x: 12, y: 12 }, random: seeded(7) });
  assert(journey);
  assert(journey.destination.x + world.pet.width <= 120);
  assert(journey.points.length >= 2);
  assert.deepEqual(journey.points[0], { x: 12, y: 12 });
  verifyTrip(journey, world);
});

test('exploration varies destinations and avoids the recent places of each section', () => {
  const world = scene(); const random = seeded(27); const visits = [];
  let start = { x: 12, y: 12 };
  const paths = new Set();
  for (let index = 0; index < 30; index++) {
    const journey = chooseJourney({ scene: world, start, visits, section: 'projetos', random });
    assert(journey);
    assert(!visits.slice(-12).some(visit => distance(visit, journey.destination) < 44));
    verifyTrip(journey, world);
    paths.add(JSON.stringify(journey.points));
    start = journey.destination;
    visits.push({ ...start, section: 'projetos' });
  }
  assert.equal(paths.size, 30);
});

test('destinations and every visible segment remain safe across responsive layouts', () => {
  for (const width of [320, 390, 768, 1440, 1920]) {
    const world = scene({ width, pet: { width: width < 700 ? 84 : 108, height: width < 700 ? 108 : 132 }, obstacles: [
      { left: 0, top: 0, right: width, bottom: 80 },
      { left: width * 0.3, top: 200, right: width * 0.72, bottom: 440 },
    ] });
    for (let seed = 1; seed <= 15; seed++) {
      const journey = chooseJourney({ scene: world, start: { x: 12, y: 500 }, random: seeded(seed) });
      if (journey) verifyTrip(journey, world);
    }
  }
});

test('scrolling invalidates an old resting place and yields a safe replacement', () => {
  const start = { x: 500, y: 400 };
  const world = scene({ obstacles: [{ left: 480, top: 380, right: 650, bottom: 550 }] });
  assert.equal(isFree(start, world), false);
  const journey = chooseJourney({ scene: world, start, random: seeded(4) });
  assert(journey?.escaping);
  assert(isFree(journey.destination, world));
  assert.deepEqual(journey.points[0], start);
  assert(canEscapeSegment(start, journey.destination, world));
  let previous = obstruction(start, world);
  for (let step = 1; step <= 100; step++) {
    const point = { x: start.x + (journey.destination.x - start.x) * step / 100,
      y: start.y + (journey.destination.y - start.y) * step / 100 };
    const area = obstruction(point, world);
    assert(area <= previous + 0.01, 'recovery must never increase the overlap');
    previous = area;
  }
});

test('exploration crosses the screen and visits interior spaces instead of following a side lane', () => {
  const world = scene({ width: 1440, height: 900, obstacles: [
    { left: 200, top: 220, right: 430, bottom: 420 },
    { left: 950, top: 440, right: 1200, bottom: 650 },
  ] });
  let start = { x: 1300, y: 700 };
  const visits = [], random = seeded(9);
  for (let index = 0; index < 35; index++) {
    const journey = chooseJourney({ scene: world, start, visits, section: 'projetos', random });
    assert(journey?.points.length);
    assert.deepEqual(journey.points[0], start);
    verifyTrip(journey, world);
    start = journey.destination;
    visits.push({ ...start, section: 'projetos' });
  }
  const xs = visits.map(point => point.x);
  assert(Math.min(...xs) < world.width * 0.3);
  assert(Math.max(...xs) > world.width * 0.7);
  assert(visits.filter(point => point.x > world.width * 0.3 && point.x < world.width * 0.7).length >= 5);
});

test('recovery never crosses a different piece of content on the way out', () => {
  const world = scene({ obstacles: [
    { left: 480, top: 380, right: 650, bottom: 550 },
    { left: 720, top: 350, right: 740, bottom: 580 },
  ] });
  assert.equal(canEscapeSegment({ x: 500, y: 400 }, { x: 800, y: 400 }, world), false);
  assert.equal(canEscapeSegment({ x: 500, y: 400 }, { x: 350, y: 400 }, world), true);
});
