import assert from 'node:assert/strict';
import test from 'node:test';
import { createPetMind, petReducer } from '../src/components/pet/petMind.ts';

const care = (state, kind, now) => petReducer(state, { type: 'care', care: kind, now });
const signal = (state, value, now) => petReducer(state, { type: 'signal', signal: value, now });

test('each visit starts with independent, in-memory state', () => {
  const first = care(createPetMind(0), 'pet', 1000);
  const second = createPetMind(0);
  assert.equal(first.pettings, 1);
  assert.equal(second.pettings, 0);
  assert.equal(second.bond, 20);
});

test('care increases bond, remembers affection, and respects cooldown', () => {
  const first = care(createPetMind(0), 'pet', 1000);
  assert.equal(first.mood, 'happy');
  assert.equal(first.bond, 29);
  assert.match(first.notes[0], /1 carinho/);
  assert.equal(care(first, 'pet', 1100), first);
  assert.equal(care(first, 'pet', 1800).pettings, 2);
});

test('snacks replenish energy without overflowing and play consumes it safely', () => {
  const fed = care({ ...createPetMind(0), energy: 99 }, 'feed', 1000);
  assert.equal(fed.energy, 100);
  assert.equal(fed.mood, 'eating');
  const played = care({ ...createPetMind(0), energy: 2 }, 'play', 1000);
  assert.equal(played.energy, 0);
  assert.equal(played.mood, 'playful');
});

test('intentional rest survives page events and can be ended explicitly', () => {
  const asleep = care(createPetMind(0), 'rest', 1000);
  const browsing = signal(asleep, { type: 'section', section: 'skills' }, 30000);
  assert.equal(browsing.mood, 'sleeping');
  assert.equal(browsing.resting, true);
  assert(browsing.visited.includes('skills'));
  const rested = petReducer(browsing, { type: 'tick', now: 60000, idleFor: 0 });
  assert(rested.energy > asleep.energy);
  const awake = care(rested, 'wake', 61000);
  assert.equal(awake.resting, false);
  assert.equal(awake.mood, 'happy');
});

test('section memory distinguishes revisits without duplicating exploration', () => {
  const first = signal(createPetMind(0), { type: 'section', section: 'projetos' }, 20000);
  const second = signal(first, { type: 'section', section: 'projetos' }, 40000);
  assert.deepEqual(second.visited, ['projetos']);
  assert.equal(first.curiosity, second.curiosity);
  assert.match(second.thought.text, /Voltamos/);
});

test('project context is kept while the modal is open and recalled on close', () => {
  const opened = signal(createPetMind(0), { type: 'project-open', title: 'Rusty Pub' }, 20000);
  assert.equal(opened.currentProject, 'Rusty Pub');
  assert.equal(opened.thought.id, 1);
  const closed = signal(opened, { type: 'project-close' }, 25000);
  assert.match(closed.thought.text, /Rusty Pub/);
  assert.equal(closed.currentProject, null);
  const reopened = signal(closed, { type: 'project-open', title: 'Rusty Pub' }, 30000);
  assert.deepEqual(reopened.projects, ['Rusty Pub']);
});

test('passive commentary does not interrupt care or flood the page', () => {
  const petted = care(createPetMind(0), 'pet', 20000);
  const browsing = signal(petted, { type: 'section', section: 'sobre' }, 20100);
  assert.equal(browsing.thought.id, petted.thought.id);
  assert(browsing.visited.includes('sobre'));
  const themed = signal(petted, { type: 'theme', dark: true }, 22000);
  assert.equal(themed.thought.id, petted.thought.id);
});

test('idleness leads to sleep, but activity wakes an automatic nap', () => {
  const asleep = petReducer(createPetMind(0), { type: 'tick', now: 80000, idleFor: 80000 });
  assert.equal(asleep.mood, 'sleeping');
  const awake = petReducer(asleep, { type: 'tick', now: 81000, idleFor: 0 });
  assert.notEqual(awake.mood, 'sleeping');
});

test('resuming after a hidden tab does not charge hours of energy loss', () => {
  const initial = createPetMind(0);
  const resumed = petReducer(initial, { type: 'resume', now: 3600000 });
  const ticked = petReducer(resumed, { type: 'tick', now: 3600000, idleFor: 0 });
  assert.equal(ticked.energy, initial.energy);
});

test('memory and stats stay bounded through repeated interactions', () => {
  let state = createPetMind(0);
  for (let index = 1; index <= 150; index++) {
    state = care(state, ['pet', 'feed', 'play'][index % 3], index * 10000);
    for (const value of [state.energy, state.bond, state.curiosity]) assert(value >= 0 && value <= 100);
    assert(state.notes.length <= 3);
  }
});

test('dismissing a thought keeps its content available in the panel', () => {
  const initial = createPetMind(0);
  const dismissed = petReducer(initial, { type: 'dismiss' });
  assert.equal(dismissed.thought.visible, false);
  assert.equal(dismissed.thought.text, initial.thought.text);
});

test('care controls unlock as soon as the cooldown finishes, before the expression settles', () => {
  const fed = care(createPetMind(0), 'feed', 1000);
  const released = petReducer(fed, { type: 'tick', now: 2830, idleFor: 1830 });
  assert.equal(released.busyUntil, 0);
  assert.equal(released.mood, 'eating');
  const settled = petReducer(released, { type: 'tick', now: 3300, idleFor: 2300 });
  assert.notEqual(settled.mood, 'eating');
});

test('attention follows the current section even while passive thoughts are on cooldown', () => {
  const petted = care(createPetMind(0), 'pet', 20000);
  const browsing = signal(petted, { type: 'section', section: 'sobre' }, 20100);
  assert.equal(browsing.section, 'sobre');
  assert.equal(browsing.thought.id, petted.thought.id);
});

test('manual moves produce varied contextual responses and keep bounded signal memory', () => {
  let state = createPetMind(0);
  const responses = new Set();
  for (let index = 1; index <= 3; index++) {
    state = signal(state, { type: 'moved' }, index * 10000);
    responses.add(state.thought.text);
  }
  assert.equal(responses.size, 3);
  assert.deepEqual(state.observations, { moved: 3 });
});
