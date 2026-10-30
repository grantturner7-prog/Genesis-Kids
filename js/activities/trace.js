// Trace It: trace a big dotted letter with a finger or mouse.
//
// Two hidden canvases are built from the letter's shape: one is the letter itself,
// the other is the letter grown outward a little. After each stroke we compare the
// child's ink against them. "Coverage" is how much of the letter was inked and
// "stray" is how much ink landed away from the letter.
import { LETTERS } from '../data.js';
import { traceStars } from '../logic.js';
import { confetti, el, starRow } from '../ui.js';
import * as sfx from '../sfx.js';

const SIZE = 480;
const FONT = '"Andika", "Century Gothic", "Trebuchet MS", "DejaVu Sans", Arial, sans-serif';
const FONT_PX = 340;
const BRUSH = 50;
const AUTO_FINISH = { coverage: 0.8, stray: 0.3 };
const DONE_BUTTON_AT = 0.5;

const makeCanvas = () => Object.assign(document.createElement('canvas'), { width: SIZE, height: SIZE });

// Where to draw `char` so its shape is centred on the canvas.
function place(g, char) {
  g.font = `bold ${FONT_PX}px ${FONT}`;
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  const m = g.measureText(char);
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  return { x: (SIZE - w) / 2 + m.actualBoundingBoxLeft, y: (SIZE - h) / 2 + m.actualBoundingBoxAscent };
}

export default {
  id: 'trace',
  title: 'Trace It',
  icon: '✏️',
  level: 'Pre-K–K',
  color: 'pink',
  intro: 'Trace the letter with your finger.',

  start(ctx) {
    let index = 0;
    let lower = false;
    let finished = false;
    let completed = 0;
    let mask;
    let zone;

    const guide = el('canvas', { class: 'trace-guide', width: SIZE, height: SIZE });
    const inkCanvas = el('canvas', { class: 'trace-ink', width: SIZE, height: SIZE, 'aria-label': 'Drawing area' });
    const g = guide.getContext('2d');
    const ink = inkCanvas.getContext('2d', { willReadFrequently: true });
    ink.lineCap = ink.lineJoin = 'round';
    ink.lineWidth = BRUSH;
    ink.strokeStyle = ink.fillStyle = '#ff5d8f';

    const title = el('div', { class: 'trace-title' });
    const meterFill = el('span');
    const status = el('p', { class: 'status', 'aria-live': 'polite' });
    const doneButton = el('button', { class: 'btn btn-primary', type: 'button', hidden: true, onclick: () => complete(score()) }, '✓ Done');
    const caseButton = el('button', { class: 'btn', type: 'button', onclick: toggleCase });

    ctx.root.append(
      el(
        'section',
        { class: 'trace' },
        el(
          'div',
          { class: 'trace-top' },
          el('button', { class: 'btn', type: 'button', 'aria-label': 'Previous letter', onclick: () => go(-1) }, '◀'),
          title,
          el('button', { class: 'btn', type: 'button', 'aria-label': 'Next letter', onclick: () => go(1) }, '▶'),
        ),
        el('div', { class: 'trace-board' }, guide, inkCanvas),
        el('div', { class: 'meter', role: 'presentation' }, meterFill),
        el('div', { class: 'trace-actions' }, caseButton, el('button', { class: 'btn', type: 'button', onclick: () => setLetter() }, '↺ Clear'), doneButton),
        status,
      ),
    );

    function currentChar() {
      const l = LETTERS[index];
      return lower ? l.lower : l.upper;
    }

    function setLetter(announce = false) {
      finished = false;
      const l = LETTERS[index];
      const char = currentChar();
      ink.clearRect(0, 0, SIZE, SIZE);
      g.clearRect(0, 0, SIZE, SIZE);

      const at = place(g, char);
      g.fillStyle = '#eef1ff';
      g.fillText(char, at.x, at.y);
      g.setLineDash([12, 10]);
      g.lineWidth = 4;
      g.lineJoin = 'round';
      g.strokeStyle = '#7f89f5';
      g.strokeText(char, at.x, at.y);
      g.setLineDash([]);

      const shape = makeCanvas().getContext('2d', { willReadFrequently: true });
      shape.font = g.font;
      shape.textBaseline = 'alphabetic';
      shape.fillText(char, at.x, at.y);
      mask = shape.getImageData(0, 0, SIZE, SIZE).data;

      const grown = makeCanvas().getContext('2d', { willReadFrequently: true });
      grown.font = g.font;
      grown.textBaseline = 'alphabetic';
      grown.lineJoin = 'round';
      grown.lineWidth = BRUSH + 6;
      grown.fillText(char, at.x, at.y);
      grown.strokeText(char, at.x, at.y);
      zone = grown.getImageData(0, 0, SIZE, SIZE).data;

      title.textContent = `${l.upper} ${l.lower}`;
      caseButton.textContent = lower ? 'ABC' : 'abc';
      caseButton.setAttribute('aria-label', lower ? 'Switch to capital letters' : 'Switch to small letters');
      meterFill.style.width = '0%';
      doneButton.hidden = true;
      status.replaceChildren();
      if (announce) ctx.say(l.say);
    }

    function go(step) {
      index = (index + step + LETTERS.length) % LETTERS.length;
      sfx.tap();
      setLetter(true);
    }

    function toggleCase() {
      lower = !lower;
      sfx.tap();
      setLetter();
    }

    function score() {
      const data = ink.getImageData(0, 0, SIZE, SIZE).data;
      let letterPixels = 0;
      let covered = 0;
      let inkPixels = 0;
      let stray = 0;
      for (let y = 0; y < SIZE; y += 4) {
        for (let x = 0; x < SIZE; x += 4) {
          const i = (y * SIZE + x) * 4 + 3;
          const inked = data[i] > 100;
          if (mask[i] > 100) {
            letterPixels++;
            if (inked) covered++;
          }
          if (inked) {
            inkPixels++;
            if (zone[i] <= 100) stray++;
          }
        }
      }
      return { coverage: letterPixels ? covered / letterPixels : 0, stray: inkPixels ? stray / inkPixels : 0 };
    }

    function strokeEnded() {
      if (finished) return;
      const result = score();
      meterFill.style.width = `${Math.round(Math.min(1, result.coverage / AUTO_FINISH.coverage) * 100)}%`;
      doneButton.hidden = result.coverage < DONE_BUTTON_AT;
      if (result.coverage >= AUTO_FINISH.coverage && result.stray <= AUTO_FINISH.stray) complete(result);
    }

    function complete(result) {
      if (finished) return;
      finished = true;
      completed++;
      const earned = traceStars(result);
      ctx.award(completed >= 6 ? 3 : completed >= 3 ? 2 : 1);
      meterFill.style.width = '100%';
      doneButton.hidden = true;
      status.replaceChildren(
        el('span', { class: 'status-stars', role: 'img', 'aria-label': `${earned} out of 3 stars` }, starRow(earned)),
        ' Great tracing! Tap ▶ for the next letter.',
      );
      confetti();
      sfx.cheer();
      ctx.say('Great tracing!');
    }

    // Drawing with pointer events so mouse, touch and pen all work.
    let drawing = false;
    let last = null;
    const pointAt = (e) => {
      const r = inkCanvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * SIZE) / r.width, y: ((e.clientY - r.top) * SIZE) / r.height };
    };
    inkCanvas.addEventListener('pointerdown', (e) => {
      if (finished) return;
      e.preventDefault();
      inkCanvas.setPointerCapture(e.pointerId);
      drawing = true;
      last = pointAt(e);
      ink.beginPath();
      ink.arc(last.x, last.y, BRUSH / 2, 0, Math.PI * 2);
      ink.fill();
    });
    inkCanvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = pointAt(e);
      ink.beginPath();
      ink.moveTo(last.x, last.y);
      ink.lineTo(p.x, p.y);
      ink.stroke();
      last = p;
    });
    const stop = () => {
      if (!drawing) return;
      drawing = false;
      strokeEnded();
    };
    inkCanvas.addEventListener('pointerup', stop);
    inkCanvas.addEventListener('pointercancel', stop);

    setLetter();
    ctx.say(ctx.activity.intro, LETTERS[index].say);
  },
};
