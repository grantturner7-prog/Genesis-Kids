import test from 'node:test';
import assert from 'node:assert/strict';
import { LETTERS, SAME_START_TRIPLES, SOUND_ALIKE_GROUPS } from '../js/data.js';
import {
  findLetterQuestions,
  matchPairs,
  missingLetterQuestions,
  shuffle,
  startsWithQuestions,
  starsFor,
  starsForMistakes,
  traceStars,
  wordOrderRounds,
} from '../js/logic.js';
import { ACTIVITIES } from '../js/activities/index.js';

const RUNS = 300; // questions are random, so check many of them

const distinct = (list) => new Set(list).size === list.length;

test('the alphabet data is complete and consistent', () => {
  assert.equal(LETTERS.length, 26);
  LETTERS.forEach((l, i) => {
    assert.equal(l.upper, String.fromCharCode(65 + i));
    assert.equal(l.lower, l.upper.toLowerCase());
    for (const field of ['say', 'sound', 'word', 'pic']) assert.ok(l[field], `${l.upper} needs ${field}`);
    if (l.start !== false) assert.equal(l.word[0].toUpperCase(), l.upper, `${l.word} should start with ${l.upper}`);
  });
  assert.ok(distinct(LETTERS.map((l) => l.word)));
});

test('shuffle keeps every item and does not change the input', () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual(out.slice().sort(), input);
});

test('find-the-letter questions are always answerable', () => {
  for (let n = 0; n < RUNS; n++) {
    const qs = findLetterQuestions(8);
    assert.equal(qs.length, 8);
    assert.ok(distinct(qs.map((q) => q.answer.toLowerCase())), 'targets should not repeat');
    qs.forEach((q, i) => {
      const values = q.choices.map((c) => c.value);
      assert.equal(values.length, 4);
      assert.ok(distinct(values));
      assert.ok(values.includes(q.answer));
      const expectLower = i >= 4;
      assert.ok(values.every((v) => (v === v.toLowerCase()) === expectLower), 'choices match the case being asked about');
      assert.ok(q.choices.every((c) => c.say));
    });
  }
});

test('starts-with questions have exactly one right answer', () => {
  for (let n = 0; n < RUNS; n++) {
    for (const q of startsWithQuestions(8)) {
      const values = q.choices.map((c) => c.value);
      assert.equal(values.length, 3);
      assert.ok(distinct(values));
      assert.ok(values.includes(q.answer));
      assert.equal(q.show.word[0].toUpperCase(), q.answer);
      assert.notEqual(q.answer, 'X', 'box does not start with x');
      const group = SOUND_ALIKE_GROUPS.find((g) => g.includes(q.answer)) ?? [];
      const rivals = group.filter((c) => c !== q.answer);
      assert.ok(!values.some((v) => rivals.includes(v)), `no sound-alike choices for ${q.answer}`);
    }
  }
});

test('missing-letter questions fit the alphabet', () => {
  for (let n = 0; n < RUNS; n++) {
    missingLetterQuestions(8).forEach((q, i) => {
      const items = q.show.items;
      assert.equal(items.length, i >= 4 ? 5 : 4);
      assert.equal(items.filter((x) => x === null).length, 1);
      const hole = items.indexOf(null);
      const known = items.findIndex((x) => x !== null);
      const step = items[known].charCodeAt(0) - known;
      assert.equal(q.answer.charCodeAt(0), step + hole, 'answer continues the alphabet');
      const values = q.choices.map((c) => c.value);
      assert.equal(values.length, 3);
      assert.ok(distinct(values));
      assert.ok(values.includes(q.answer));
      const shown = items.filter(Boolean);
      assert.ok(values.filter((v) => v !== q.answer).every((v) => !shown.includes(v)), 'distractors are not already on screen');
    });
  }
});

test('word-order rounds have a correct, shuffled answer', () => {
  for (let n = 0; n < RUNS; n++) {
    const rounds = wordOrderRounds(6);
    assert.equal(rounds.length, 6);
    rounds.forEach((r, i) => {
      assert.equal(r.words.length, 3);
      assert.ok(distinct(r.words));
      assert.deepEqual(r.answer, r.words.slice().sort());
      assert.notDeepEqual(r.words, r.answer, 'words should start out of order');
      if (i >= 3) assert.ok(r.answer.every((w) => w[0] === r.answer[0][0]), 'later rounds share a first letter');
    });
  }
});

test('same-first-letter word sets really are in ABC order', () => {
  for (const set of SAME_START_TRIPLES) {
    assert.deepEqual(set, set.slice().sort());
    assert.ok(set.every((w) => w[0] === set[0][0]));
    assert.ok(distinct(set.map((w) => w[1])), 'second letters differ so order is unambiguous');
  }
});

test('match pairs are distinct letters', () => {
  for (let n = 0; n < RUNS; n++) assert.ok(distinct(matchPairs(6).map((l) => l.upper)));
});

test('star ratings', () => {
  assert.equal(starsFor(8, 8), 3);
  assert.equal(starsFor(7, 8), 3);
  assert.equal(starsFor(5, 8), 2);
  assert.equal(starsFor(0, 8), 1);
  assert.equal(starsForMistakes(0), 3);
  assert.equal(starsForMistakes(4), 2);
  assert.equal(starsForMistakes(9), 1);
  assert.equal(traceStars({ coverage: 0.95, stray: 0.05 }), 3);
  assert.equal(traceStars({ coverage: 0.75, stray: 0.2 }), 2);
  assert.equal(traceStars({ coverage: 0.95, stray: 0.6 }), 1);
});

test('every activity is wired up correctly', () => {
  const palette = ['blue', 'pink', 'green', 'orange', 'purple', 'teal', 'yellow'];
  assert.ok(distinct(ACTIVITIES.map((a) => a.id)));
  for (const a of ACTIVITIES) {
    for (const field of ['id', 'title', 'icon', 'level', 'intro']) assert.ok(a[field], `${a.id} needs ${field}`);
    assert.ok(palette.includes(a.color), `${a.id} has an unknown colour`);
    assert.equal(typeof a.start, 'function');
  }
});
