import { runQuiz } from '../quiz.js';
import { missingLetterQuestions } from '../logic.js';

export default {
  id: 'missing-letter',
  title: 'Missing Letter',
  icon: '🧩',
  level: 'Grades 1–2',
  color: 'orange',
  intro: 'One letter is missing from the alphabet. Can you find it?',
  start: (ctx) => runQuiz(ctx, { questions: missingLetterQuestions(8) }),
};
