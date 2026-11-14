import type { QuizQuestion } from '../types';

export const shuffleQuestionOptions = (
  options: string[],
  correctIndex: number,
  seed: string
): { options: string[]; correctIndex: number } => {
  const shuffledIndices = options.map((_, index) => index);
  let state = 2166136261;

  for (const character of seed) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  }

  for (let index = shuffledIndices.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffledIndices[index], shuffledIndices[swapIndex]] = [
      shuffledIndices[swapIndex],
      shuffledIndices[index],
    ];
  }

  return {
    options: shuffledIndices.map((index) => options[index]),
    correctIndex: shuffledIndices.indexOf(correctIndex),
  };
};

export const shuffleQuestionsForAttempt = <T extends QuizQuestion>(
  questions: T[],
  random: () => number = Math.random
): { questions: T[]; optionOrders: Record<string, number[]> } => {
  const shuffle = <V,>(items: V[]): V[] => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  const optionOrders: Record<string, number[]> = {};
  const shuffledQuestions = questions.map((question) => {
    const optionOrder = shuffle(question.options.map((_, index) => index));
    optionOrders[question.id] = optionOrder;
    const correctIndex = optionOrder.indexOf(question.correctIndex);
    const correctLetter = String.fromCharCode(65 + correctIndex);
    return {
      ...question,
      options: optionOrder.map((index) => question.options[index]),
      correctIndex,
      explanation: /^Đáp án đúng là [A-Z]:/.test(question.explanation)
        ? question.explanation.replace(
            /^Đáp án đúng là [A-Z]:/,
            `Đáp án đúng là ${correctLetter}:`
          )
        : question.explanation,
    };
  });

  return {
    questions: shuffle(shuffledQuestions),
    optionOrders,
  };
};
