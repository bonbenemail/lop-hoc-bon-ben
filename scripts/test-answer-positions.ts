import {
  getEnglish20LessonsByGrade,
  getMath20LessonsByGrade,
  getVietnamese20LessonsByGrade,
} from '../src/data/practiceLessonsData';

const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

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

console.log('Correct answers and varied positions verified for grades 1–12 in all three subjects.');
