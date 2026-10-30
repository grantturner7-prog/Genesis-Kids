import { runQuiz } from '../quiz.js';
import { startsWithQuestions } from '../logic.js';

export default {
  id: 'starts-with',
  title: 'First Sounds',
  icon: '🐻',
  level: 'K–Grade 1',
  color: 'green',
  intro: 'Look at the picture. Which letter does the word start with?',
  start: (ctx) => runQuiz(ctx, { questions: startsWithQuestions(8) }),
};
