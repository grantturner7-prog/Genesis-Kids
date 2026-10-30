// Pure question-building logic. No DOM access, so it can be unit tested in Node.
import { LETTERS, CONFUSABLE, SOUND_ALIKE_GROUPS, SAME_START_TRIPLES } from './data.js';

export function shuffle(items, rng = Math.random) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = (items, n, rng = Math.random) => shuffle(items, rng).slice(0, n);
export const randInt = (min, max, rng = Math.random) => min + Math.floor(rng() * (max - min + 1));

const BY_CHAR = new Map(LETTERS.flatMap((l) => [[l.upper, l], [l.lower, l]]));
const choiceFor = (char) => ({ value: char, label: char, say: BY_CHAR.get(char).say });

function soundAlikes(upper) {
  const group = SOUND_ALIKE_GROUPS.find((g) => g.includes(upper));
  return group ? group.filter((c) => c !== upper) : [];
}

// Pre-K: hear a letter, tap it. First half uppercase, second half lowercase.
export function findLetterQuestions(count = 8, rng = Math.random) {
  return sample(LETTERS, count, rng).map((target, i) => {
    const lowercase = i >= Math.ceil(count / 2);
    const face = lowercase ? 'lower' : 'upper';
    const answer = target[face];
    const lookalike = lowercase ? shuffle([...(CONFUSABLE[answer] ?? '')], rng).slice(0, 1) : [];
    const rest = shuffle(
      LETTERS.map((l) => l[face]).filter((c) => c !== answer && !lookalike.includes(c)),
      rng,
    );
    const options = [answer, ...[...lookalike, ...rest].slice(0, 3)];
    const spoken = lowercase ? 'Find the lowercase letter.' : 'Find the letter.';
    return {
      prompt: lowercase ? `Find lowercase ${answer}` : `Find the letter ${answer}`,
      speak: `${spoken} ${target.say}.`,
      show: { kind: 'text' },
      choices: shuffle(options, rng).map(choiceFor),
      answer,
    };
  });
}

// K-1: see a picture, pick the letter its word starts with.
export function startsWithQuestions(count = 8, rng = Math.random) {
  const pool = LETTERS.filter((l) => l.start !== false);
  return sample(pool, count, rng).map((target) => {
    const blocked = soundAlikes(target.upper);
    const others = shuffle(
      LETTERS.filter((l) => l.upper !== target.upper && !blocked.includes(l.upper)),
      rng,
    ).slice(0, 2);
    const question = `What letter does ${target.word} start with?`;
    return {
      prompt: question,
      speak: question,
      show: { kind: 'picture', pic: target.pic, word: target.word },
      choices: shuffle([target, ...others], rng).map((l) => choiceFor(l.upper)),
      answer: target.upper,
    };
  });
}

// Grades 1-2: a short run of the alphabet with one letter missing.
export function missingLetterQuestions(count = 8, rng = Math.random) {
  const half = Math.ceil(count / 2);
  return Array.from({ length: count }, (_, i) => {
    const long = i >= half;
    const length = long ? 5 : 4;
    const face = long ? 'lower' : 'upper';
    const start = randInt(0, LETTERS.length - length, rng);
    const run = LETTERS.slice(start, start + length);
    const hidden = randInt(long ? 1 : 0, length - 1, rng);
    const answerLetter = run[hidden];
    const answerIndex = start + hidden;
    const nearby = LETTERS.map((letter, index) => ({ letter, index }))
      .filter(({ index }) => index < start || index >= start + length)
      .sort((a, b) => Math.abs(a.index - answerIndex) - Math.abs(b.index - answerIndex))
      .slice(0, 5);
    const distractors = sample(nearby, 2, rng).map((x) => x.letter);
    return {
      prompt: 'Which letter is missing?',
      speak: 'Which letter is missing?',
      show: { kind: 'sequence', items: run.map((l, j) => (j === hidden ? null : l[face])) },
      choices: shuffle([answerLetter, ...distractors], rng).map((l) => choiceFor(l[face])),
      answer: answerLetter[face],
    };
  });
}

// Grades 2-3: put three words in ABC order. First half differ by first letter,
// second half share a first letter so the second letter decides.
export function wordOrderRounds(count = 6, rng = Math.random) {
  const half = Math.ceil(count / 2);
  const easyWords = LETTERS.filter((l) => l.start !== false).map((l) => l.word);
  const triples = sample(SAME_START_TRIPLES, count - half, rng);
  return Array.from({ length: count }, (_, i) => {
    const easy = i < half;
    const words = easy ? sample(easyWords, 3, rng) : triples[i - half];
    const answer = words.slice().sort();
    let shown = shuffle(words, rng);
    for (let tries = 0; tries < 10 && shown.join() === answer.join(); tries++) shown = shuffle(words, rng);
    if (shown.join() === answer.join()) shown = [shown[1], shown[2], shown[0]];
    return {
      words: shown,
      answer,
      hint: easy
        ? 'Look at the first letter of each word.'
        : 'All three words start with the same letter. Look at the second letter.',
    };
  });
}

export const matchPairs = (count = 6, rng = Math.random) => sample(LETTERS, count, rng);

// Stars for a quiz: 3 for 85%+ right on the first try, 2 for 60%+, else 1 for finishing.
export function starsFor(correct, total) {
  const ratio = total ? correct / total : 0;
  return ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
}

export const starsForMistakes = (mistakes) => (mistakes <= 2 ? 3 : mistakes <= 5 ? 2 : 1);

// Tracing: coverage is the share of the letter that was inked, stray is the share
// of ink that landed away from the letter.
export function traceStars({ coverage, stray }) {
  if (coverage >= 0.85 && stray <= 0.15) return 3;
  if (coverage >= 0.7 && stray <= 0.3) return 2;
  return 1;
}
