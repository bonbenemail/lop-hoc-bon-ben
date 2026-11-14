import {
  getEnglish20LessonsByGrade,
  getMath20LessonsByGrade,
  getVietnamese20LessonsByGrade,
} from '../src/data/practiceLessonsData';
import {
  shuffleQuestionOptions,
  shuffleQuestionsForAttempt,
} from '../src/utils/answerOptionShuffle';
import { createServer } from 'vite';
import type { Lesson, QuizQuestion } from '../src/types';

const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const answerPositions = new Set<number>();
for (let correctIndex = 0; correctIndex < 4; correctIndex++) {
  for (let questionNumber = 0; questionNumber < 20; questionNumber++) {
    const shuffled = shuffleQuestionOptions(
      ['same', 'correct', 'same', 'other'],
      correctIndex,
      `utility-test:${correctIndex}:${questionNumber}`
    );
    if (shuffled.options[shuffled.correctIndex] !== ['same', 'correct', 'same', 'other'][correctIndex]) {
      throw new Error('Shuffling changed the correct answer.');
    }
    answerPositions.add(shuffled.correctIndex);
  }
}
if (answerPositions.size !== 4) {
  throw new Error('The shuffle does not use all four answer positions.');
}

const createRandom = (initialState: number): (() => number) => {
  let state = initialState;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const attemptSourceQuestions = Array.from({ length: 40 }, (_, index) => ({
  id: `attempt-q${index + 1}`,
  question: `Question ${index + 1}`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: index % 4,
  explanation: `Đáp án đúng là ${String.fromCharCode(65 + (index % 4))}: ${['A', 'B', 'C', 'D'][index % 4]}`,
  points: 1,
  difficulty: 'easy' as const,
}));
const firstAttempt = shuffleQuestionsForAttempt(attemptSourceQuestions, createRandom(1));
const secondAttempt = shuffleQuestionsForAttempt(attemptSourceQuestions, createRandom(2));
const sourceQuestionById = new Map(attemptSourceQuestions.map((question) => [question.id, question]));
const secondAttemptById = new Map(secondAttempt.questions.map((question) => [question.id, question]));
const firstAttemptPositions = new Set<number>();
let optionsChangedBetweenAttempts = false;
let correctPositionChangedBetweenAttempts = false;
for (const question of firstAttempt.questions) {
  const sourceQuestion = sourceQuestionById.get(question.id);
  const secondAttemptQuestion = secondAttemptById.get(question.id);
  if (
    !sourceQuestion ||
    !secondAttemptQuestion ||
    question.options[question.correctIndex] !== sourceQuestion.options[sourceQuestion.correctIndex] ||
    question.explanation !==
      `Đáp án đúng là ${String.fromCharCode(65 + question.correctIndex)}: ${sourceQuestion.options[sourceQuestion.correctIndex]}`
  ) {
    throw new Error("A randomized practice attempt changed a question's correct answer.");
  }
  firstAttemptPositions.add(question.correctIndex);
  optionsChangedBetweenAttempts ||= JSON.stringify(question.options) !== JSON.stringify(secondAttemptQuestion.options);
  correctPositionChangedBetweenAttempts ||= question.correctIndex !== secondAttemptQuestion.correctIndex;
}
if (
  firstAttemptPositions.size < 3 ||
  !optionsChangedBetweenAttempts ||
  !correctPositionChangedBetweenAttempts ||
  JSON.stringify(firstAttempt.questions.map((question) => question.id)) ===
    JSON.stringify(secondAttempt.questions.map((question) => question.id))
) {
  throw new Error('New attempts must randomize question order and correct answer positions.');
}

const getMathExpectedAnswers = (grade: number, lessonNumber: number): string[] => {
  const baseA = grade * 3 + lessonNumber;
  const baseB = grade + (lessonNumber % 5) + 2;

  if (grade <= 2) {
    return [
      `${baseA + baseB}`,
      `${baseA}`,
      `${baseA + 11}`,
      `${baseA + 12}`,
      `${baseA + baseB} ngôi sao`,
    ];
  }
  if (grade <= 5) {
    return [
      `${baseA * baseB + 15}`,
      `${2 * (baseA + 10 + baseB + 4)} cm`,
      `x = ${baseA + baseB * 4}`,
      `${baseA + 3}`,
      `${baseA + 8}`,
    ];
  }
  if (grade <= 9) {
    return [
      `x = ${baseB + 2 * lessonNumber}`,
      `${(baseB + 1) * (baseB + 1)}`,
      '10 cm',
      `y = ${grade}`,
      `${baseB + lessonNumber}`,
    ];
  }
  return [
    `${1 + 2 * lessonNumber + grade}`,
    `(${2 * lessonNumber}; ${2 * baseB})`,
    `${baseB + 9}`,
    `D = ℝ \\ {${grade}}`,
    'Vận dụng định nghĩa, định lí và biến đổi tương đương để tìm nghiệm chính xác',
  ];
};

const getVietnameseExpectedAnswers = (grade: number): string[] =>
  grade <= 5
    ? [
        'Chăm chỉ, xuất sắc',
        'Trạng ngữ chỉ thời gian',
        'Nhân hóa (gọi và tả con ong như con người)',
        'Lung linh, ríu rít, xôn xao',
        'Nắm vững quy tắc dùng từ, đặt câu chuẩn xác và cảm nhận vẻ đẹp nhân văn của văn bản',
      ]
    : [
        'Nhan đề, hình tượng trung tâm, mạch cảm xúc hoặc cốt truyện và thông điệp của tác giả',
        'Ẩn dụ dựa trên quan hệ tương đồng (giống nhau), còn Hoán dụ dựa trên quan hệ tương cận (gần gũi)',
        'Lý lẽ sắc bén, hợp lý kết hợp với Bằng chứng (dẫn chứng) xác thực, tiêu biểu',
        'Phép thế',
        'Phân tích được đặc trưng thể loại, giá trị nội dung - nghệ thuật và vận dụng viết văn sáng tạo',
      ];

const getEnglishExpectedAnswers = (grade: number): string[] =>
  grade <= 5
    ? ['is', 'There are five books.', 'plays', 'Thank you, Teacher!', 'Notebook']
    : [
        'plant',
        'who / that',
        'practicing',
        'wanted',
        'That sounds like a great idea!',
      ];

const verifyLessons = (
  subject: string,
  grade: number,
  lessons: ReturnType<typeof getEnglish20LessonsByGrade>,
  expectedAnswersForLesson: (lessonNumber: number) => string[]
) => {
  for (const [lessonIndex, lesson] of lessons.entries()) {
    const expectedAnswers = expectedAnswersForLesson(lessonIndex + 1);
    const correctPositions = new Set<number>();

    for (const [questionIndex, question] of lesson.sampleQuestions.entries()) {
      const expectedAnswer = expectedAnswers[questionIndex % expectedAnswers.length];
      if (question.options[question.correctIndex] !== expectedAnswer) {
        throw new Error(
          `${subject} Grade ${grade}, ${lesson.id}, question ${questionIndex + 1}: expected "${expectedAnswer}" to remain correct.`
        );
      }
      correctPositions.add(question.correctIndex);
    }

    if (correctPositions.size < 3) {
      throw new Error(
        `${subject} Grade ${grade}, ${lesson.id} does not distribute correct answers across at least 3 positions.`
      );
    }
  }
};

for (const grade of grades) {
  verifyLessons('Math', grade, getMath20LessonsByGrade(grade), (lessonNumber) =>
    getMathExpectedAnswers(grade, lessonNumber)
  );
  verifyLessons('Vietnamese', grade, getVietnamese20LessonsByGrade(grade), () =>
    getVietnameseExpectedAnswers(grade)
  );
  verifyLessons('English', grade, getEnglish20LessonsByGrade(grade), () =>
    getEnglishExpectedAnswers(grade)
  );
}

const vite = await createServer({
  configFile: false,
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const data = await vite.ssrLoadModule('/src/data/bonbenData.ts');
  const staticBanks: Array<[string, Array<{ options: string[]; correctIndex: number }>]> = [
    ['fallback math practice', data.LESSON_PRACTICE_20_QUESTIONS],
    ['official exam', data.OFFICIAL_EXAM_20_QUESTIONS],
    ['Vietnamese practice', data.VIETNAMESE_PRACTICE_20_QUESTIONS],
    ['English practice', data.ENGLISH_PRACTICE_20_QUESTIONS],
    ...data.MULTI_SUBJECT_EXAMS.map((exam: { title: string; questions: Array<{ options: string[]; correctIndex: number }> }) => [
      exam.title,
      exam.questions,
    ]),
  ];

  for (const [bankName, questions] of staticBanks) {
    const positions = new Set(questions.map((question) => question.correctIndex));
    if (positions.size < 3) {
      throw new Error(`${bankName} does not distribute correct answers across at least 3 positions.`);
    }
    if (questions.some((question) => question.correctIndex < 0 || question.correctIndex >= question.options.length)) {
      throw new Error(`${bankName} contains an invalid correct answer index.`);
    }
  }

  const arenaPositions = new Set(
    (data.ARENA_QUESTIONS as Array<{ correctAnswer: number }>).map((question) => question.correctAnswer)
  );
  if (arenaPositions.size < 3) {
    throw new Error('Arena questions do not distribute correct answers across at least 3 positions.');
  }
} finally {
  await vite.close();
}

const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const storedValues = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storedValues.get(key) ?? null,
    setItem: (key: string, value: string) => storedValues.set(key, value),
    removeItem: (key: string) => storedValues.delete(key),
    clear: () => storedValues.clear(),
  },
});

try {
  const { getTeacherCustomAssignments } = await import('../src/services/schoolManager');
  const legacyQuestions: QuizQuestion[] = Array.from({ length: 20 }, (_, index) => ({
    id: `legacy-q${index + 1}`,
    question: `Legacy question ${index + 1}`,
    options: [`correct-${index + 1}`, 'wrong-b', 'wrong-c', 'wrong-d'],
    correctIndex: 0,
    explanation: `Đáp án đúng là A: correct-${index + 1}`,
    points: 10,
    difficulty: 'easy',
  }));
  const legacyLesson: Lesson = {
    id: 'teacher-custom-legacy',
    title: 'Legacy assignment',
    subjectId: 'toan',
    grade: 4,
    duration: '20 phút',
    difficulty: 'Cơ bản',
    completionRate: 0,
    xpReward: 0,
    diamonds: 0,
    description: 'Legacy assignment for migration test.',
    keyPoints: [],
    sampleQuestions: legacyQuestions,
  };
  storedValues.set('bonben_teacher_assignments', JSON.stringify([legacyLesson]));

  const migrated = getTeacherCustomAssignments();
  const migratedQuestions = migrated[0]?.sampleQuestions || [];
  const migratedPositions = new Set(migratedQuestions.map((question) => question.correctIndex));
  if (
    migratedQuestions.some((question, index) => {
      const correctAnswer = `correct-${index + 1}`;
      return (
        question.options[question.correctIndex] !== correctAnswer ||
        question.explanation !==
          `Đáp án đúng là ${String.fromCharCode(65 + question.correctIndex)}: ${correctAnswer}`
      );
    })
  ) {
    throw new Error('Migrating teacher assignments changed a correct answer or its explanation.');
  }
  if (migratedPositions.size < 3) {
    throw new Error('Migrated teacher questions do not distribute correct answers across enough positions.');
  }
  if (JSON.stringify(getTeacherCustomAssignments()) !== JSON.stringify(migrated)) {
    throw new Error('Teacher assignment migration is not stable across reads.');
  }
} finally {
  if (localStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', localStorageDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'localStorage');
  }
}

console.log('Correct answers and varied positions verified across all grades, subjects, static banks, exams, arena, and saved teacher assignments.');
