// Word Order: tap three words in alphabetical order.
import { wordOrderRounds, starsFor } from '../logic.js';
import { el, progressDots, renderResults, shake } from '../ui.js';
import * as sfx from '../sfx.js';

export default {
  id: 'word-order',
  title: 'Word Order',
  icon: '📚',
  level: 'Grades 2–3',
  color: 'pink',
  intro: 'Tap the words in ABC order. Which word comes first?',

  start(ctx) {
    const rounds = wordOrderRounds(6);
    let index = 0;
    let perfect = 0;

    function show() {
      const round = rounds[index];
      let placed = 0;
      let slipped = false;

      const slots = round.answer.map((_, i) => el('div', { class: 'slot' }, el('span', { class: 'slot-num' }, i + 1)));
      const cards = round.words.map((word) => {
        const button = el('button', { class: 'word-card', type: 'button' }, word);
        button.addEventListener('click', () => tap(word, button));
        return button;
      });

      function tap(word, button) {
        if (button.disabled) return;
        if (word === round.answer[placed]) {
          button.disabled = true;
          slots[placed].classList.add('filled');
          slots[placed].append(el('span', { class: 'placed' }, word));
          placed++;
          sfx.correct();
          ctx.say(word);
          if (placed === round.answer.length) {
            if (!slipped) perfect++;
            ctx.later(next, 1400);
          }
        } else {
          slipped = true;
          sfx.wrong();
          shake(button);
          ctx.say('Not yet.', round.hint);
        }
      }

      ctx.root.replaceChildren(
        el(
          'section',
          { class: 'quiz' },
          progressDots(rounds.length, index),
          el(
            'div',
            { class: 'stage' },
            el(
              'div',
              { class: 'prompt-row' },
              el('p', { class: 'prompt' }, 'Put the words in ABC order'),
              el('button', { class: 'btn-hear', type: 'button', 'aria-label': 'Hear the question again', onclick: () => ctx.say(ctx.activity.intro, round.hint) }, '🔊'),
            ),
            el('p', { class: 'hint' }, round.hint),
            el('div', { class: 'slots' }, slots),
          ),
          el('div', { class: 'word-cards' }, cards),
        ),
      );
      ctx.say(...(index === 0 ? [ctx.activity.intro, round.hint] : [round.hint]));
    }

    function next() {
      index++;
      if (index < rounds.length) show();
      else
        renderResults(ctx, {
          stars: starsFor(perfect, rounds.length),
          headline: perfect === rounds.length ? 'Perfect ABC order!' : 'Nice work!',
          detail: `${perfect} of ${rounds.length} with no mix-ups`,
          onAgain: ctx.restart,
        });
    }

    show();
  },
};
