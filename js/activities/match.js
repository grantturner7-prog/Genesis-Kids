// Match Up: pair each uppercase letter with its lowercase partner.
import { matchPairs, shuffle, starsForMistakes } from '../logic.js';
import { el, renderResults, shake } from '../ui.js';
import * as sfx from '../sfx.js';

export default {
  id: 'match',
  title: 'Match Up',
  icon: '🔗',
  level: 'Kindergarten',
  color: 'purple',
  intro: 'Match each big letter with its little letter.',

  start(ctx) {
    const pairs = matchPairs(6);
    let selected = null;
    let mistakes = 0;
    let matched = 0;

    const make = (side, letter) => {
      const button = el(
        'button',
        {
          class: `match-btn ${side}`,
          type: 'button',
          'aria-label': `${side === 'upper' ? 'Uppercase' : 'Lowercase'} ${letter.upper}`,
        },
        side === 'upper' ? letter.upper : letter.lower,
      );
      button.addEventListener('click', () => pick(side, letter, button));
      return button;
    };

    function pick(side, letter, button) {
      if (button.disabled) return;
      sfx.tap();
      if (!selected || selected.side === side) {
        selected?.button.classList.remove('selected');
        selected = { side, letter, button };
        button.classList.add('selected');
        ctx.say(letter.say);
        return;
      }
      const other = selected;
      selected = null;
      other.button.classList.remove('selected');
      if (other.letter === letter) {
        for (const b of [other.button, button]) {
          b.disabled = true;
          b.classList.add('matched');
        }
        matched++;
        sfx.correct();
        ctx.say(`${letter.say}. Match!`);
        if (matched === pairs.length) ctx.later(finish, 1200);
      } else {
        mistakes++;
        sfx.wrong();
        shake(other.button);
        shake(button);
        ctx.say('Not a match. Try again.');
      }
    }

    function finish() {
      renderResults(ctx, {
        stars: starsForMistakes(mistakes),
        headline: 'You matched them all!',
        detail: mistakes === 0 ? 'No mix-ups!' : `${mistakes} mix-up${mistakes === 1 ? '' : 's'}`,
        onAgain: ctx.restart,
      });
    }

    ctx.root.append(
      el('p', { class: 'hint' }, 'Tap a big letter, then its little letter.'),
      el(
        'div',
        { class: 'match-board' },
        el('div', { class: 'match-col' }, shuffle(pairs).map((l) => make('upper', l))),
        el('div', { class: 'match-col' }, shuffle(pairs).map((l) => make('lower', l))),
      ),
    );
    ctx.say(ctx.activity.intro);
  },
};
