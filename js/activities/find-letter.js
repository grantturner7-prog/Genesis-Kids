import { runQuiz } from '../quiz.js';
import { findLetterQuestions } from '../logic.js';

export default {
  id: 'find-letter',
  title: 'Find the Letter',
  icon: '🔎',
  level: 'Pre-K',
  color: 'teal',
  intro: 'Listen, then tap the letter you hear.',
  start: (ctx) => runQuiz(ctx, { questions: findLetterQuestions(8) }),
};
