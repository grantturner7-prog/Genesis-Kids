// ABC Explorer: a chart of the alphabet. Tap a letter to hear its name, its sound
// and a picture word.
import { LETTERS } from '../data.js';
import { el, picture } from '../ui.js';
import * as sfx from '../sfx.js';

export default {
  id: 'explore',
  title: 'ABC Explorer',
  icon: '🔤',
  level: 'Pre-K',
  color: 'blue',
  intro: 'Tap a letter to meet it.',

  start(ctx) {
    const seen = new Set();
    let overlay = null;
    let current = 0;

    const tiles = LETTERS.map((l, i) =>
      el(
        'button',
        {
          class: 'tile',
          type: 'button',
          style: { '--hue': Math.round((i * 360) / LETTERS.length) },
          'aria-label': `Letter ${l.upper}`,
          onclick: () => open(i),
        },
        el('span', { class: 'tile-up' }, l.upper),
        el('span', { class: 'tile-lo' }, l.lower),
      ),
    );

    ctx.root.append(el('p', { class: 'hint' }, 'Tap a letter!'), el('div', { class: 'tiles' }, tiles));
    ctx.say(ctx.activity.intro);

    const sayButton = (label, ...lines) =>
      el('button', { class: 'btn', type: 'button', onclick: () => ctx.say(...lines) }, `🔊 ${label}`);

    function open(i) {
      current = (i + LETTERS.length) % LETTERS.length;
      const l = LETTERS[current];
      seen.add(current);
      tiles[current].classList.add('seen');
      const earned = seen.size >= 26 ? 3 : seen.size >= 18 ? 2 : seen.size >= 9 ? 1 : 0;
      if (earned) ctx.award(earned);
      sfx.tap();

      const highlight = l.start === false ? l.word.length - 1 : 0;
      const word = [...l.word].map((ch, k) => (k === highlight ? el('b', {}, ch) : ch));

      const alreadyOpen = overlay !== null;
      overlay?.remove();
      overlay = el(
        'div',
        { class: 'overlay', onclick: (e) => e.target === e.currentTarget && close() },
        el(
          'div',
          {
            class: alreadyOpen ? 'letter-card still' : 'letter-card',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': `Letter ${l.upper}`,
            style: { '--hue': Math.round((current * 360) / LETTERS.length) },
          },
          el('button', { class: 'icon-btn close', type: 'button', 'aria-label': 'Close', onclick: close }, '✕'),
          el('div', { class: 'big-letters' }, el('span', {}, l.upper), el('span', {}, l.lower)),
          el('div', { class: 'letter-pic' }, picture(l.pic, l.word)),
          el('p', { class: 'letter-word' }, word),
          l.note && el('p', { class: 'note' }, l.note),
          el('div', { class: 'say-row' }, sayButton('Letter', l.say), sayButton('Sound', l.sound), sayButton('Word', l.word)),
          el(
            'div',
            { class: 'nav-row' },
            el('button', { class: 'btn', type: 'button', 'aria-label': 'Previous letter', onclick: () => open(current - 1) }, '◀ Back'),
            el('button', { class: 'btn btn-primary', type: 'button', 'aria-label': 'Next letter', onclick: () => open(current + 1) }, 'Next ▶'),
          ),
        ),
      );
      ctx.root.append(overlay);
      overlay.querySelector('.close').focus();
      ctx.say(l.say, l.sound, l.word, l.note);
    }

    function close() {
      overlay?.remove();
      overlay = null;
      tiles[current].focus();
    }

    function onKey(e) {
      if (!overlay) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') open(current + 1);
      else if (e.key === 'ArrowLeft') open(current - 1);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  },
};
