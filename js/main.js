// App shell: a persistent top bar, a hash router, and the home screen.
import { ACTIVITIES } from './activities/index.js';
import { el, starRow } from './ui.js';
import { getStars, isMuted, saveStars, setMuted } from './store.js';
import { say, stopSpeaking } from './speech.js';
import * as sfx from './sfx.js';

const app = document.getElementById('app');
let teardown = () => {};

const muteButton = el('button', { class: 'icon-btn', type: 'button', onclick: toggleMute });
const view = el('main', { id: 'view' });
app.append(
  el(
    'header',
    { class: 'topbar' },
    el('a', { class: 'brand', href: '#/' }, el('span', { 'aria-hidden': 'true' }, '⭐'), ' Genesis Kids'),
    muteButton,
  ),
  view,
);

function paintMute() {
  muteButton.textContent = isMuted() ? '🔇' : '🔊';
  muteButton.setAttribute('aria-label', isMuted() ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off');
}

function toggleMute() {
  setMuted(!isMuted());
  if (isMuted()) stopSpeaking();
  else sfx.tap();
  paintMute();
}

function openHome() {
  document.title = 'Genesis Kids';
  view.append(
    el('section', { class: 'hero' }, el('h1', {}, 'Let’s learn the ABCs!'), el('p', {}, 'Pick an activity to play.')),
    el(
      'ul',
      { class: 'cards' },
      ACTIVITIES.map((a) =>
        el(
          'li',
          {},
          el(
            'a',
            { class: 'card', href: `#/${a.id}`, style: { '--c': `var(--${a.color})` } },
            el('span', { class: 'card-icon', 'aria-hidden': 'true' }, a.icon),
            el('span', { class: 'card-title' }, a.title),
            el('span', { class: 'badge' }, a.level),
            el('span', { class: 'card-stars', role: 'img', 'aria-label': `${getStars(a.id)} of 3 stars` }, starRow(getStars(a.id))),
          ),
        ),
      ),
    ),
  );
}

function openActivity(activity) {
  document.title = `${activity.title} · Genesis Kids`;
  const root = el('div', { class: 'activity-stage' });
  view.append(
    el(
      'section',
      { class: 'activity', style: { '--c': `var(--${activity.color})` } },
      el(
        'div',
        { class: 'activity-head' },
        el('a', { class: 'btn btn-small', href: '#/', 'aria-label': 'Back to home' }, '⌂ Home'),
        el('h1', {}, `${activity.icon} ${activity.title}`),
      ),
      root,
    ),
  );

  const timers = new Set();
  let cleanup;
  const ctx = {
    root,
    activity,
    say,
    award: (stars) => saveStars(activity.id, stars),
    later(fn, ms) {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    },
    restart: () => run(),
  };

  function dispose() {
    timers.forEach(clearTimeout);
    timers.clear();
    cleanup?.();
    cleanup = undefined;
  }

  function run() {
    dispose();
    root.replaceChildren();
    cleanup = activity.start(ctx);
  }

  teardown = dispose;
  run();
}

function route() {
  teardown();
  teardown = () => {};
  stopSpeaking();
  document.querySelectorAll('.confetti-layer').forEach((layer) => layer.remove());
  view.replaceChildren();
  window.scrollTo(0, 0);
  const id = location.hash.replace(/^#\/?/, '');
  const activity = ACTIVITIES.find((a) => a.id === id);
  if (activity) openActivity(activity);
  else openHome();
}

window.addEventListener('hashchange', route);
paintMute();
route();
