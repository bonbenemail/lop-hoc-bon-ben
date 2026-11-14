import { applyLessonOverrides, saveLessonOverride } from '../src/services/schoolManager';
import type { Lesson, QuizQuestion } from '../src/types';

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

const questions: QuizQuestion[] = [
  {
    id: 'question-1',
    question: 'Câu hỏi đã sửa',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 2,
    explanation: 'Đáp án C',
    points: 10,
    difficulty: 'medium',
  },
];

const lesson: Lesson = {
  id: 'lesson-1',
  title: 'Tiêu đề gốc',
  subjectId: 'toan',
  grade: 4,
  duration: '20:00',
  difficulty: 'Cơ bản',
  completionRate: 0,
  xpReward: 10,
  diamonds: 0,
  description: 'Mô tả gốc',
  keyPoints: [],
  sampleQuestions: [],
};

saveLessonOverride({ lessonId: lesson.id, sampleQuestions: questions });
saveLessonOverride({ lessonId: lesson.id, title: 'Tiêu đề mới' });
const [updated] = applyLessonOverrides([lesson]);

if (updated.title !== 'Tiêu đề mới') {
  throw new Error('Expected the lesson title override to be applied.');
}
if (updated.sampleQuestions[0]?.question !== questions[0].question) {
  throw new Error('Expected the question override to remain after saving lesson metadata.');
}
if (updated.sampleQuestions[0]?.correctIndex !== questions[0].correctIndex) {
  throw new Error('Expected the correct answer index to be preserved.');
}

console.log('Admin lesson content override test passed.');
