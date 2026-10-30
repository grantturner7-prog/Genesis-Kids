// A reusable "look, then tap the right answer" activity. Find the Letter, Starts
// With and Missing Letter are all just different question generators fed to this.
import { el, picture, progressDots, renderResults, shake } from './ui.js';
import { starsFor } from './logic.js';
import * as sfx from './sfx.js';

const PRAISE = ['Great job!', 'You got it!', 'Awesome!', 'Super!', 'Way to go!', 'Yes!'];
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

export function runQuiz(ctx, { questions }) {
  let index = 0;
  let firstTry = 0;
  let locked = false;
  let missed = false;

  function stageFor(q) {
    const hear = el(
      'button',
      { class: 'btn-hear', type: 'button', 'aria-label': 'Hear the question again', onclick: () => ctx.say(q.speak) },
      '🔊',
    );
    let body = null;
    if (q.show.kind === 'picture') {
      body = el('div', { class: 'big-pic' }, picture(q.show.pic, q.show.word));
    } else if (q.show.kind === 'sequence') {
      body = el(
        'div',
        { class: 'seq' },
        q.show.items.map((item) => el('span', { class: item ? 'seq-item' : 'seq-item blank' }, item ?? '?')),
      );
    }
    return el('div', { class: 'stage' }, el('div', { class: 'prompt-row' }, el('p', { class: 'prompt' }, q.prompt), hear), body);
  }

  function show() {
    const q = questions[index];
    locked = false;
    missed = false;
    const buttons = q.choices.map((choice) => {
      const button = el('button', { class: 'choice', type: 'button' }, choice.label);
      button.addEventListener('click', () => choose(choice, button));
      return button;
    });
    ctx.root.replaceChildren(
      el(
        'section',
        { class: 'quiz' },
        progressDots(questions.length, index),
        stageFor(q),
        el('div', { class: 'choices', 'data-count': q.choices.length }, buttons),
      ),
    );
    ctx.say(...(index === 0 ? [ctx.activity.intro, q.speak] : [q.speak]));
  }

  function choose(choice, button) {
    if (locked || button.disabled) return;
    const q = questions[index];
    if (choice.value === q.answer) {
      locked = true;
      if (!missed) firstTry++;
      button.classList.add('correct');
      sfx.correct();
      ctx.say(choice.say, pickPraise());
      ctx.later(next, 1700);
    } else {
      missed = true;
      button.disabled = true;
      button.classList.add('wrong');
      shake(button);
      sfx.wrong();
      ctx.say(`${choice.say}.`, 'Try again.');
    }
  }

  function next() {
    index++;
    if (index < questions.length) show();
    else finish();
  }

  function finish() {
    const stars = starsFor(firstTry, questions.length);
    renderResults(ctx, {
      stars,
      headline: stars === 3 ? 'Amazing!' : 'Nice work!',
      detail: `${firstTry} of ${questions.length} right on the first try`,
      onAgain: ctx.restart,
    });
  }

  show();
}
