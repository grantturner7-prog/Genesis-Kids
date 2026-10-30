// Small DOM helpers shared by every activity.
import * as sfx from './sfx.js';

// el('button', { class: 'btn', onclick: fn }, 'Hello') builds an element.
// `html` is only ever used with our own trusted SVG strings.
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'style') for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child != null && child !== false) node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function starRow(earned, max = 3) {
  return Array.from({ length: max }, (_, i) =>
    el('span', { class: `star${i < earned ? ' on' : ''}`, 'aria-hidden': 'true', style: { '--i': i } }, '★'),
  );
}

// A picture is an emoji, or an inline SVG string.
export function picture(pic, label = '') {
  return pic.startsWith('<svg')
    ? el('span', { class: 'pic pic-svg', role: 'img', 'aria-label': label, html: pic })
    : el('span', { class: 'pic', role: 'img', 'aria-label': label }, pic);
}

export function progressDots(total, index) {
  return el(
    'div',
    { class: 'dots', role: 'img', 'aria-label': `Question ${index + 1} of ${total}` },
    Array.from({ length: total }, (_, i) =>
      el('span', { class: `dot${i < index ? ' done' : ''}${i === index ? ' now' : ''}` }),
    ),
  );
}

export function shake(node) {
  node.classList.remove('shake');
  void node.offsetWidth; // restart the animation
  node.classList.add('shake');
  node.addEventListener('animationend', () => node.classList.remove('shake'), { once: true });
}

export function confetti() {
  const colors = ['#ff5d8f', '#ffc83d', '#3b66ee', '#1fbb73', '#8a5cff', '#ff9331'];
  const layer = el(
    'div',
    { class: 'confetti-layer', 'aria-hidden': 'true' },
    Array.from({ length: 36 }, () =>
      el('i', {
        style: {
          left: `${Math.random() * 100}%`,
          background: colors[Math.floor(Math.random() * colors.length)],
          'animation-delay': `${Math.random() * 0.5}s`,
          'animation-duration': `${1.8 + Math.random() * 1.2}s`,
        },
      }),
    ),
  );
  document.body.append(layer);
  setTimeout(() => layer.remove(), 3800);
}

// The end-of-activity screen: stars, a message, play again / home.
export function renderResults(ctx, { stars: earned, headline = 'All done!', detail = '', onAgain }) {
  ctx.award(earned);
  ctx.root.replaceChildren(
    el(
      'section',
      { class: 'results' },
      el('h2', {}, headline),
      el('div', { class: 'big-stars', role: 'img', 'aria-label': `${earned} out of 3 stars` }, starRow(earned)),
      detail && el('p', {}, detail),
      el(
        'div',
        { class: 'actions' },
        el('button', { class: 'btn btn-primary', type: 'button', onclick: onAgain }, '↻ Play again'),
        el('a', { class: 'btn', href: '#/' }, '⌂ Home'),
      ),
    ),
  );
  confetti();
  sfx.cheer();
  ctx.say(headline);
}
