import { getEnglish20LessonsByGrade } from '../src/data/practiceLessonsData';

const testCases = [
  {
    grade: 4,
    expectedAnswers: ['is', 'There are five books.', 'plays', 'Thank you, Teacher!', 'Notebook'],
  },
  {
    grade: 6,
    expectedAnswers: [
      'plant',
      'who / that',
      'practicing',
      'wanted',
      'That sounds like a great idea!',
    ],
  },
] as const;

for (const { grade, expectedAnswers } of testCases) {
  const lessons = getEnglish20LessonsByGrade(grade);

  for (const lesson of lessons) {
    const questions = lesson.sampleQuestions;
    const correctAnswersMatch = questions.every(
      (question, index) =>
        question.options[question.correctIndex] === expectedAnswers[index % expectedAnswers.length]
    );
    const correctPositions = new Set(questions.map((question) => question.correctIndex));

    if (!correctAnswersMatch) {
      throw new Error(`${lesson.id} has a correct answer index that does not match its answer.`);
    }
    if (correctPositions.size < 3) {
      throw new Error(`${lesson.id} does not distribute correct answers across enough positions.`);
    }
  }
}

console.log('English answer positions are correct and varied for grades 4 and 6.');
