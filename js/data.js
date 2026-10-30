// Content for the ABC activities.
//
//   say    - how the letter NAME is spelled for the browser's text-to-speech voice.
//   sound  - a rough spelling of the letter's most common SOUND for text-to-speech.
//   word   - the picture word shown with the letter.
//   pic    - an emoji, or an inline SVG string where no good emoji exists.
//   start  - false when the picture word does not START with the letter.
//
// `say` and `sound` are placeholders until real recorded audio replaces them
// (see "Audio" in the README). Synthetic voices are only approximately right
// for isolated phonics sounds.

const IGLOO = `<svg viewBox="4 30 92 56" aria-hidden="true">
  <path d="M8 80 A42 42 0 0 1 92 80 Z" fill="#eaf5ff" stroke="#6f93c4" stroke-width="3" stroke-linejoin="round"/>
  <path d="M14 64 H86 M22 50 H78 M34 42 H66 M30 64 V50 M70 64 V50 M42 50 V42 M58 50 V42" stroke="#6f93c4" stroke-width="2.5" fill="none"/>
  <path d="M38 80 V68 A12 12 0 0 1 62 68 V80 Z" fill="#5b7aa8"/>
</svg>`;

export const LETTERS = [
  { upper: 'A', lower: 'a', say: 'ay',     sound: 'aah',  word: 'apple',      pic: '🍎' },
  { upper: 'B', lower: 'b', say: 'bee',    sound: 'buh',  word: 'bear',       pic: '🐻' },
  { upper: 'C', lower: 'c', say: 'see',    sound: 'kuh',  word: 'cat',        pic: '🐱' },
  { upper: 'D', lower: 'd', say: 'dee',    sound: 'duh',  word: 'dog',        pic: '🐶' },
  { upper: 'E', lower: 'e', say: 'ee',     sound: 'eh',   word: 'elephant',   pic: '🐘' },
  { upper: 'F', lower: 'f', say: 'eff',    sound: 'fuh',  word: 'fish',       pic: '🐟' },
  { upper: 'G', lower: 'g', say: 'jee',    sound: 'guh',  word: 'goat',       pic: '🐐' },
  { upper: 'H', lower: 'h', say: 'aitch',  sound: 'huh',  word: 'horse',      pic: '🐴' },
  { upper: 'I', lower: 'i', say: 'eye',    sound: 'ih',   word: 'igloo',      pic: IGLOO },
  { upper: 'J', lower: 'j', say: 'jay',    sound: 'juh',  word: 'juice',      pic: '🧃' },
  { upper: 'K', lower: 'k', say: 'kay',    sound: 'kuh',  word: 'key',        pic: '🔑' },
  { upper: 'L', lower: 'l', say: 'el',     sound: 'luh',  word: 'lion',       pic: '🦁' },
  { upper: 'M', lower: 'm', say: 'em',     sound: 'muh',  word: 'monkey',     pic: '🐒' },
  { upper: 'N', lower: 'n', say: 'en',     sound: 'nuh',  word: 'nose',       pic: '👃' },
  { upper: 'O', lower: 'o', say: 'oh',     sound: 'ah',   word: 'octopus',    pic: '🐙' },
  { upper: 'P', lower: 'p', say: 'pee',    sound: 'puh',  word: 'pig',        pic: '🐷' },
  { upper: 'Q', lower: 'q', say: 'cue',    sound: 'kwuh', word: 'question',   pic: '❓' },
  { upper: 'R', lower: 'r', say: 'are',    sound: 'ruh',  word: 'rainbow',    pic: '🌈' },
  { upper: 'S', lower: 's', say: 'ess',    sound: 'suh',  word: 'snake',      pic: '🐍' },
  { upper: 'T', lower: 't', say: 'tee',    sound: 'tuh',  word: 'turtle',     pic: '🐢' },
  { upper: 'U', lower: 'u', say: 'you',    sound: 'uh',   word: 'umbrella',   pic: '☂️' },
  { upper: 'V', lower: 'v', say: 'vee',    sound: 'vuh',  word: 'violin',     pic: '🎻' },
  { upper: 'W', lower: 'w', say: 'double you', sound: 'wuh', word: 'watermelon', pic: '🍉' },
  { upper: 'X', lower: 'x', say: 'ex',     sound: 'ks',   word: 'box',        pic: '📦', start: false, note: 'Box ends with x.' },
  { upper: 'Y', lower: 'y', say: 'why',    sound: 'yuh',  word: 'yarn',       pic: '🧶' },
  { upper: 'Z', lower: 'z', say: 'zee',    sound: 'zuh',  word: 'zebra',      pic: '🦓' },
];

// Lowercase letters that are easy to mix up. Used to make "Find the letter" harder.
export const CONFUSABLE = {
  b: 'dpq', d: 'bpq', p: 'bdq', q: 'bdp', m: 'nw', n: 'mh', u: 'nv', h: 'nb',
  i: 'jl', l: 'ij', o: 'ce', c: 'eo', e: 'co', v: 'uw', w: 'vm', s: 'z', z: 's',
};

// Letters that can start words with the same sound. When one of these is the
// answer to "What letter does it start with?", the others are not offered as
// choices, so the question never has two defensible answers.
export const SOUND_ALIKE_GROUPS = [['C', 'K', 'Q']];

// Word sets that share a first letter, listed already in ABC order.
export const SAME_START_TRIPLES = [
  ['bat', 'bed', 'bus'],
  ['can', 'cow', 'cup'],
  ['dad', 'dig', 'dot'],
  ['fan', 'fig', 'fox'],
  ['hat', 'hen', 'hug'],
  ['jam', 'jet', 'jug'],
  ['map', 'mix', 'mud'],
  ['pan', 'pen', 'pig'],
  ['sad', 'sit', 'sun'],
];
