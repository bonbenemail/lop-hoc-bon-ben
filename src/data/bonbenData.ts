import { Subject, Lesson, GiftItem, LeaderboardUser, SkillDiagnosis, ArenaQuestion, QuizQuestion, ExerciseType, GradeLevel, ExamTest, DuelOpponent, StudentBadge, ArenaScheduleRound } from '../types';

export const MASCOT_IMAGE = '/src/assets/images/mascot_bonben_1793872988718.jpg';
export const HERO_IMAGE = '/src/assets/images/hero_bonben_classroom_1793872988761.jpg';
export const GIFTS_HERO_IMAGE = '/src/assets/images/gifts_bonben_rewards_1793872989067.jpg';

export const SUBJECTS: Subject[] = [
  {
    id: 'tieng-viet',
    name: 'Tiếng Việt / Ngữ văn',
    iconName: 'BookOpen',
    color: 'from-blue-500 to-cyan-600',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    lessonsCount: 240,
    exercisesCount: 4800,
    description: 'Trọn bộ 20 bài luyện chuyên đề Đọc hiểu, Thực hành Tiếng Việt và Tập làm văn theo đúng khối lớp đang học.',
    badge: '20 bài / khối'
  },
  {
    id: 'toan',
    name: 'Toán học',
    iconName: 'Calculator',
    color: 'from-sky-500 to-blue-600',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    lessonsCount: 240,
    exercisesCount: 4800,
    description: 'Trọn bộ 20 bài luyện chuyên đề Toán học bám sát SGK mới từ cơ bản đến vận dụng cao theo đúng khối lớp đang học.',
    badge: '20 bài / khối'
  },
  {
    id: 'tieng-anh',
    name: 'Tiếng Anh',
    iconName: 'Globe',
    color: 'from-sky-600 to-indigo-600',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    lessonsCount: 240,
    exercisesCount: 4800,
    description: 'Trọn bộ 20 bài luyện chuyên đề Từ vựng, Ngữ pháp, Ngữ âm và Đọc hiểu Tiếng Anh Global Success theo đúng khối lớp.',
    badge: '20 bài / khối'
  }
];

export const LESSON_PRACTICE_20_QUESTIONS: QuizQuestion[] = [
  {
    id: 'lq1',
    question: 'Tính kết quả của phép tính: 2/7 + 3/7 = ?',
    options: ['5/14', '5/7', '6/49', '1/7'],
    correctIndex: 1,
    explanation: 'Hai phân số có cùng mẫu số là 7, ta giữ nguyên mẫu số và cộng hai tử số: 2 + 3 = 5. Kết quả là 5/7.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq2',
    question: 'Rút gọn phân số 18/24 về phân số tối giản ta được:',
    options: ['9/12', '6/8', '3/4', '2/3'],
    correctIndex: 2,
    explanation: 'Chia cả tử số và mẫu số cho ước chung lớn nhất là 6: 18 : 6 = 3, 24 : 6 = 4. Vậy ta được phân số tối giản 3/4.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq3',
    question: 'Phép tính nào sau đây có kết quả bằng 1?',
    options: ['3/4 + 1/4', '2/5 + 2/5', '5/8 - 3/8', '7/9 + 1/9'],
    correctIndex: 0,
    explanation: '3/4 + 1/4 = (3 + 1)/4 = 4/4 = 1.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq4',
    question: 'Quy đồng mẫu số hai phân số 1/3 và 2/5 với mẫu số chung nhỏ nhất là 15, ta được:',
    options: ['5/15 và 6/15', '3/15 và 10/15', '5/15 và 10/15', '1/15 và 2/15'],
    correctIndex: 0,
    explanation: '1/3 = (1 x 5)/(3 x 5) = 5/15; 2/5 = (2 x 3)/(5 x 3) = 6/15.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq5',
    question: 'Thực hiện phép tính: 5/6 - 1/2 = ?',
    options: ['4/4', '2/6', '1/3', '4/6'],
    correctIndex: 2,
    explanation: 'Quy đồng mẫu số: 1/2 = 3/6. Khi đó: 5/6 - 3/6 = 2/6. Rút gọn 2/6 = 1/3.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq6',
    question: 'Tìm x biết: x - 1/4 = 3/8',
    options: ['x = 5/8', 'x = 2/8', 'x = 1/2', 'x = 4/12'],
    correctIndex: 0,
    explanation: 'x = 3/8 + 1/4 = 3/8 + 2/8 = 5/8.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq7',
    question: 'Một lớp học có 36 học sinh, trong đó có 4/9 là học sinh giỏi. Hỏi lớp đó có bao nhiêu học sinh giỏi?',
    options: ['12 em', '16 em', '18 em', '20 em'],
    correctIndex: 1,
    explanation: 'Số học sinh giỏi là: 36 x (4/9) = (36 : 9) x 4 = 16 học sinh.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq8',
    question: 'So sánh hai phân số: 5/8 và 7/12',
    options: ['5/8 > 7/12', '5/8 < 7/12', '5/8 = 7/12', 'Không so sánh được'],
    correctIndex: 0,
    explanation: 'Quy đồng mẫu số chung 24: 5/8 = 15/24; 7/12 = 14/24. Vì 15/24 > 14/24 nên 5/8 > 7/12.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq9',
    question: 'Một tấm vải dài 24m. Người thợ may cắt lấy 3/4 tấm vải để may áo. Chiều dài tấm vải còn lại là:',
    options: ['18m', '6m', '8m', '12m'],
    correctIndex: 1,
    explanation: 'Phần may áo là: 24 x (3/4) = 18m. Chiều dài còn lại là: 24 - 18 = 6m.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq10',
    question: 'Tính giá trị biểu thức: 1 - (1/3 + 1/6) = ?',
    options: ['1/2', '1/3', '2/3', '5/6'],
    correctIndex: 0,
    explanation: '1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2. Biểu thức = 1 - 1/2 = 1/2.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq11',
    question: 'Phân số nào sau đây lớn hơn 1?',
    options: ['7/8', '11/12', '15/14', '9/9'],
    correctIndex: 2,
    explanation: 'Phân số có tử số lớn hơn mẫu số thì lớn hơn 1. Ở đây 15 > 14 nên 15/14 > 1.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq12',
    question: 'Tính: 3/5 x 2/7 = ?',
    options: ['5/12', '6/35', '6/12', '5/35'],
    correctIndex: 1,
    explanation: 'Nhân hai phân số: lấy tử số nhân tử số, mẫu số nhân mẫu số: (3 x 2) / (5 x 7) = 6/35.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq13',
    question: 'Tính kết quả: 4/9 : 2/3 = ?',
    options: ['8/27', '2/3', '6/9', '4/6'],
    correctIndex: 1,
    explanation: 'Chia phân số là nhân với phân số đảo ngược: 4/9 x 3/2 = 12/18 = 2/3.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq14',
    question: 'Tìm phân số nghịch đảo của phân số 5/9:',
    options: ['9/5', '-5/9', '1/5', '1/9'],
    correctIndex: 0,
    explanation: 'Phân số nghịch đảo của a/b (a, b khác 0) là b/a. Nghịch đảo của 5/9 là 9/5.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq15',
    question: 'Một mảnh vườn hình chữ nhật có chiều dài 20m, chiều rộng bằng 3/5 chiều dài. Diện tích mảnh vườn là:',
    options: ['240 m²', '120 m²', '64 m²', '300 m²'],
    correctIndex: 0,
    explanation: 'Chiều rộng là: 20 x (3/5) = 12m. Diện tích = 20 x 12 = 240 m².',
    points: 10,
    difficulty: 'hard'
  },
  {
    id: 'lq16',
    question: 'Tính nhanh: 1/2 + 1/4 + 1/8 + 1/16 + 1/32 = ?',
    options: ['31/32', '32/31', '63/64', '1'],
    correctIndex: 0,
    explanation: 'Ta có thể cộng quy đồng mẫu 32: (16 + 8 + 4 + 2 + 1)/32 = 31/32.',
    points: 10,
    difficulty: 'hard'
  },
  {
    id: 'lq17',
    question: 'Điền số thích hợp vào ô trống: 4/7 = 20/?',
    options: ['28', '35', '42', '25'],
    correctIndex: 1,
    explanation: 'Tử số nhân với 5 (4 x 5 = 20) thì mẫu số cũng phải nhân với 5: 7 x 5 = 35.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'lq18',
    question: 'Số tự nhiên x thỏa mãn: 3/5 < x/10 < 4/5 là:',
    options: ['6', '7', '8', '9'],
    correctIndex: 1,
    explanation: 'Quy đồng mẫu 10: 6/10 < x/10 < 8/10. Do đó x = 7.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'lq19',
    question: 'Một thùng đựng 60 lít dầu. Lần đầu bán đi 1/3 số dầu, lần hai bán 1/4 số dầu còn lại. Hỏi trong thùng còn lại bao nhiêu lít dầu?',
    options: ['20 lít', '30 lít', '40 lít', '25 lít'],
    correctIndex: 1,
    explanation: 'Lần đầu bán: 60 x 1/3 = 20 lít. Còn lại: 60 - 20 = 40 lít. Lần hai bán: 40 x 1/4 = 10 lít. Còn lại: 40 - 10 = 30 lít.',
    points: 15,
    difficulty: 'hard'
  },
  {
    id: 'lq20',
    question: 'Tìm phân số tối giản a/b biết rằng cộng thêm 6 vào tử số thì được phân số mới bằng 1, và b hơn a là 6 đơn vị:',
    options: ['5/11', '7/13', '1/7', 'Tất cả các phân số có mẫu trừ tử bằng 6'],
    correctIndex: 0,
    explanation: 'Khi tử số cộng 6 thì tử bằng mẫu: a + 6 = b. Vậy bất kỳ cặp số nào thỏa b = a + 6 đều đúng; dạng tối giản nhỏ nhất là 5/11.',
    points: 15,
    difficulty: 'hard'
  }
];

export const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'toan-lop-4-phan-so',
    title: 'Phân số và Phép tính cộng, trừ, nhân, chia phân số',
    subjectId: 'toan',
    grade: 4,
    duration: '25 phút',
    difficulty: 'Cơ bản',
    completionRate: 0,
    xpReward: 250,
    diamonds: 20,
    description: 'Trọn bộ 20 câu hỏi luyện tập chuyên sâu về phân số: tử số, mẫu số, quy đồng, rút gọn và các phép tính ứng dụng thực tế.',
    keyPoints: [
      'Phân số gồm tử số và mẫu số (mẫu số luôn khác 0).',
      'Muốn cộng hoặc trừ hai phân số cùng mẫu: cộng/trừ tử số và giữ nguyên mẫu số.',
      'Muốn cộng hoặc trừ hai phân số khác mẫu: quy đồng mẫu số rồi thực hiện phép tính.',
      'Phép nhân: tử nhân tử, mẫu nhân mẫu. Phép chia: nhân với phân số đảo ngược.'
    ],
    sampleQuestions: LESSON_PRACTICE_20_QUESTIONS
  },
  {
    id: 'toan-lop-5-so-thap-phan',
    title: 'Số thập phân và Các phép toán trên số thập phân',
    subjectId: 'toan',
    grade: 5,
    duration: '22 phút',
    difficulty: 'Thông hiểu',
    completionRate: 0,
    xpReward: 250,
    diamonds: 20,
    description: 'Cấu tạo số thập phân gồm phần nguyên và phần thập phân, các phép nhân, chia số thập phân ứng dụng thực tế.',
    keyPoints: [
      'Số thập phân gồm 2 phần: phần nguyên ở bên trái dấu phẩy và phần thập phân ở bên phải.',
      'Khi đặt tính cộng/trừ số thập phân: các chữ số ở cùng một hàng phải đặt thẳng cột với nhau.',
      'Quy tắc dời dấu phẩy khi nhân/chia với 10, 100, 1000.'
    ],
    sampleQuestions: LESSON_PRACTICE_20_QUESTIONS
  },
  {
    id: 'toan-lop-3-nhan-chia',
    title: 'Phép nhân và phép chia trong phạm vi 1000',
    subjectId: 'toan',
    grade: 3,
    duration: '20 phút',
    difficulty: 'Cơ bản',
    completionRate: 0,
    xpReward: 200,
    diamonds: 20,
    description: 'Thành thạo bảng cửu chương, phép nhân số có 2-3 chữ số với số có một chữ số.',
    keyPoints: [
      'Ghi nhớ bảng nhân và chia từ 2 đến 9.',
      'Đặt tính thẳng cột từ phải sang trái, nhớ cộng thêm phần nhớ nếu có.'
    ],
    sampleQuestions: LESSON_PRACTICE_20_QUESTIONS
  },
  {
    id: 'tieng-viet-lop-4-luyen-tu-cau',
    title: 'Luyện từ và câu: Danh từ, Động từ, Tính từ',
    subjectId: 'tieng-viet',
    grade: 4,
    duration: '20 phút',
    difficulty: 'Cơ bản',
    completionRate: 0,
    xpReward: 200,
    diamonds: 20,
    description: 'Phân biệt danh từ chỉ sự vật, động từ chỉ hành động trạng thái, tính từ chỉ tính chất đặc điểm.',
    keyPoints: [
      'Danh từ: từ chỉ người, vật, hiện tượng, khái niệm.',
      'Động từ: từ chỉ hoạt động, trạng thái của sự vật.',
      'Tính từ: từ miêu tả đặc điểm hoặc tính chất của sự vật, hoạt động.'
    ],
    sampleQuestions: LESSON_PRACTICE_20_QUESTIONS
  }
];

export const ARENA_QUESTIONS: ArenaQuestion[] = [
  {
    id: 'aq1',
    subject: 'Toán học',
    grade: 4,
    question: 'Số nào sau đây vừa chia hết cho 2 vừa chia hết cho 5?',
    options: ['245', '180', '312', '415'],
    correctAnswer: 1,
    explanation: 'Số chia hết cho cả 2 và 5 phải có chữ số tận cùng là 0. Trong các số trên, 180 có chữ số tận cùng là 0.'
  },
  {
    id: 'aq2',
    subject: 'Toán học',
    grade: 4,
    question: 'Tìm x biết: x x 6 = 240 + 60',
    options: ['x = 40', 'x = 50', 'x = 60', 'x = 30'],
    correctAnswer: 1,
    explanation: '240 + 60 = 300. Khi đó x = 300 : 6 = 50.'
  },
  {
    id: 'aq3',
    subject: 'Toán học',
    grade: 4,
    question: 'Một hình vuông có chu vi là 36cm. Diện tích của hình vuông đó là:',
    options: ['81 cm²', '72 cm²', '64 cm²', '100 cm²'],
    correctAnswer: 0,
    explanation: 'Cạnh của hình vuông là 36 : 4 = 9cm. Diện tích = 9 x 9 = 81 cm².'
  },
  {
    id: 'aq4',
    subject: 'Tiếng Anh',
    grade: 4,
    question: 'Choose the correct word: "What is your favorite subject?" - "I like ________."',
    options: ['Math', 'playing', 'schoolbag', 'teacher'],
    correctAnswer: 0,
    explanation: '"Math" (Toán học) là tên một môn học, phù hợp với câu hỏi về subject.'
  },
  {
    id: 'aq5',
    subject: 'Toán học',
    grade: 4,
    question: 'Trung bình cộng của ba số: 15, 25 và 50 là:',
    options: ['25', '30', '35', '40'],
    correctAnswer: 1,
    explanation: 'Tổng ba số = 15 + 25 + 50 = 90. Trung bình cộng = 90 : 3 = 30.'
  },
  {
    id: 'aq6',
    subject: 'Toán học',
    grade: 4,
    question: 'Số chẵn bé nhất có 5 chữ số khác nhau là:',
    options: ['10234', '10000', '12340', '10246'],
    correctAnswer: 0,
    explanation: 'Số có 5 chữ số khác nhau bé nhất là 10234 (tận cùng là 4 nên là số chẵn).'
  },
  {
    id: 'aq7',
    subject: 'Toán học',
    grade: 4,
    question: 'Một năm nhuận có bao nhiêu ngày?',
    options: ['364 ngày', '365 ngày', '366 ngày', '367 ngày'],
    correctAnswer: 2,
    explanation: 'Năm thường có 365 ngày, năm nhuận có thêm ngày 29 tháng 2 nên có 366 ngày.'
  },
  {
    id: 'aq8',
    subject: 'Khoa học',
    grade: 4,
    question: 'Nước đóng băng ở nhiệt độ bao nhiêu độ C?',
    options: ['100°C', '0°C', '37°C', '-10°C'],
    correctAnswer: 1,
    explanation: 'Ở áp suất khí quyển tiêu chuẩn, nước tinh khiết đóng băng chuyển thành thể rắn ở 0°C.'
  },
  {
    id: 'aq9',
    subject: 'Toán học',
    grade: 4,
    question: 'Trong các số sau, số nào chia hết cho 9: 234, 345, 456, 567?',
    options: ['234 và 567', 'Chỉ 234', 'Chỉ 345', 'Tất cả các số'],
    correctAnswer: 0,
    explanation: 'Tổng chữ số của 234 là 2+3+4=9 (chia hết cho 9). Tổng của 567 là 5+6+7=18 (chia hết cho 9).'
  },
  {
    id: 'aq10',
    subject: 'Toán học',
    grade: 4,
    question: '2 tấn 50 kg = ........ kg. Số thích hợp điền vào chỗ chấm là:',
    options: ['250 kg', '2050 kg', '2500 kg', '20050 kg'],
    correctAnswer: 1,
    explanation: '1 tấn = 1000 kg. Do đó 2 tấn 50 kg = 2000 + 50 = 2050 kg.'
  },
  {
    id: 'aq11',
    subject: 'Tiếng Việt',
    grade: 4,
    question: 'Thành ngữ nào sau đây mang ý nghĩa ca ngợi sự kiên trì, nỗ lực?',
    options: ['Có công mài sắt có ngày nên kim', 'Đứng núi này trông núi nọ', 'Há miệng chờ sung', 'Nước chảy bèo trôi'],
    correctAnswer: 0,
    explanation: '"Có công mài sắt có ngày nên kim" khuyên nhủ con người kiên trì, bền bỉ sẽ gặt hái thành công.'
  },
  {
    id: 'aq12',
    subject: 'Toán học',
    grade: 4,
    question: 'Tính giá trị: 125 x 8 = ?',
    options: ['900', '1000', '1100', '1025'],
    correctAnswer: 1,
    explanation: '125 x 8 = 1000 (cặp số nhân tròn nghìn rất quen thuộc trong giải toán tính nhanh).'
  },
  {
    id: 'aq13',
    subject: 'Toán học',
    grade: 4,
    question: 'Diện tích hình bình hành có độ dài đáy 15cm và chiều cao 8cm là:',
    options: ['120 cm²', '60 cm²', '46 cm²', '240 cm²'],
    correctAnswer: 0,
    explanation: 'Diện tích hình bình hành = đáy x chiều cao = 15 x 8 = 120 cm².'
  },
  {
    id: 'aq14',
    subject: 'Tiếng Anh',
    grade: 4,
    question: 'How many months are there in a year?',
    options: ['10', '11', '12', '14'],
    correctAnswer: 2,
    explanation: 'There are 12 months in a calendar year (January to December).'
  },
  {
    id: 'aq15',
    subject: 'Toán học',
    grade: 4,
    question: 'Số liền sau của số 99 999 là:',
    options: ['99 998', '100 000', '99 900', '100 001'],
    correctAnswer: 1,
    explanation: 'Muốn tìm số liền sau, ta lấy số đó cộng thêm 1 đơn vị: 99 999 + 1 = 100 000.'
  },
  {
    id: 'aq16',
    subject: 'Toán học',
    grade: 4,
    question: 'Một hình thoi có độ dài hai đường chéo là 8cm và 10cm. Diện tích hình thoi đó là:',
    options: ['80 cm²', '40 cm²', '36 cm²', '20 cm²'],
    correctAnswer: 1,
    explanation: 'Diện tích hình thoi = (đường chéo 1 x đường chéo 2) : 2 = (8 x 10) : 2 = 40 cm².'
  },
  {
    id: 'aq17',
    subject: 'Toán học',
    grade: 4,
    question: 'Giá trị của biểu thức 45 + 55 x 2 là:',
    options: ['200', '155', '145', '190'],
    correctAnswer: 1,
    explanation: 'Nhân chia trước, cộng trừ sau: 55 x 2 = 110. Sau đó 45 + 110 = 155.'
  },
  {
    id: 'aq18',
    subject: 'Lịch sử',
    grade: 4,
    question: 'Chiến thắng Bạch Đằng năm 938 do ai lãnh đạo?',
    options: ['Ngô Quyền', 'Trần Hưng Đạo', 'Lê Lợi', 'Đinh Bộ Lĩnh'],
    correctAnswer: 0,
    explanation: 'Ngô Quyền đã lãnh đạo quân dân ta cắm cọc gỗ trên sông Bạch Đằng đánh tan quân Nam Hán năm 938.'
  },
  {
    id: 'aq19',
    subject: 'Toán học',
    grade: 4,
    question: 'Tìm hai số biết tổng là 100 và hiệu là 20:',
    options: ['60 và 40', '50 và 50', '70 và 30', '55 và 45'],
    correctAnswer: 0,
    explanation: 'Số lớn = (tổng + hiệu) : 2 = (100 + 20) : 2 = 60. Số bé = 60 - 20 = 40.'
  },
  {
    id: 'aq20',
    subject: 'Toán học',
    grade: 4,
    question: 'Thế kỷ XXI bắt đầu từ năm nào đến năm nào?',
    options: ['Từ năm 2000 đến 2099', 'Từ năm 2001 đến 2100', 'Từ năm 1901 đến 2000', 'Từ năm 2101 đến 2200'],
    correctAnswer: 1,
    explanation: 'Thế kỷ 21 bắt đầu từ ngày 1/1/2001 và kết thúc vào ngày 31/12/2100.'
  }
];

export const OFFICIAL_EXAM_20_QUESTIONS: QuizQuestion[] = [
  {
    id: 'eq1',
    question: 'Số gồm 7 trăm nghìn, 5 chục nghìn, 2 trăm và 6 đơn vị viết là:',
    options: ['750 206', '752 006', '750 026', '705 206'],
    correctIndex: 0,
    explanation: 'Chữ số hàng trăm nghìn là 7, chục nghìn là 5, nghìn là 0, trăm là 2, chục là 0, đơn vị là 6. Viết là 750 206.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq2',
    question: 'Làm tròn số 836 492 đến hàng trăm nghìn ta được số:',
    options: ['800 000', '840 000', '830 000', '900 000'],
    correctIndex: 0,
    explanation: 'Chữ số hàng chục nghìn là 3 < 5 nên ta làm tròn xuống thành 800 000.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq3',
    question: 'Góc bẹt có số đo bằng bao nhiêu độ?',
    options: ['90°', '180°', '60°', '360°'],
    correctIndex: 1,
    explanation: 'Góc vuông bằng 90°, góc bẹt bằng 2 lần góc vuông = 180°.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq4',
    question: 'Một hình chữ nhật có chu vi là 48cm. Chiều dài hơn chiều rộng 4cm. Diện tích của hình chữ nhật đó là:',
    options: ['140 cm²', '144 cm²', '192 cm²', '160 cm²'],
    correctIndex: 0,
    explanation: 'Nửa chu vi = 48 : 2 = 24cm. Chiều dài = (24 + 4) : 2 = 14cm. Chiều rộng = 14 - 4 = 10cm. Diện tích = 14 x 10 = 140 cm².',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq5',
    question: 'Trong các phân số sau, phân số nào bằng phân số 3/4?',
    options: ['9/16', '15/20', '12/20', '6/10'],
    correctIndex: 1,
    explanation: 'Nhân cả tử và mẫu với 5: 3 x 5 = 15, 4 x 5 = 20. Ta được phân số 15/20.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq6',
    question: 'Tìm x biết: 345 - x : 3 = 300',
    options: ['x = 135', 'x = 45', 'x = 15', 'x = 120'],
    correctIndex: 0,
    explanation: 'x : 3 = 345 - 300 = 45. Khi đó x = 45 x 3 = 135.',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq7',
    question: 'Một trường tiểu học có 850 học sinh. Số học sinh nữ nhiều hơn số học sinh nam là 50 em. Số học sinh nữ là:',
    options: ['450 em', '400 em', '500 em', '425 em'],
    correctIndex: 0,
    explanation: 'Số học sinh nữ = (850 + 50) : 2 = 450 học sinh.',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq8',
    question: 'Số trung bình cộng của các số: 10, 20, 30, 40, 50 là:',
    options: ['25', '30', '35', '20'],
    correctIndex: 1,
    explanation: 'Dãy số cách đều 10 đơn vị gồm 5 số lẻ, số trung bình cộng chính là số đứng ở giữa: 30.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq9',
    question: 'Tính giá trị biểu thức: 4/5 + 3/10 - 1/2 = ?',
    options: ['3/5', '7/10', '1/2', '4/10'],
    correctIndex: 0,
    explanation: 'Mẫu số chung 10: 8/10 + 3/10 - 5/10 = 6/10. Rút gọn 6/10 = 3/5.',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq10',
    question: '3 giờ 15 phút = ........ phút. Số thích hợp điền vào chỗ chấm là:',
    options: ['195 phút', '185 phút', '315 phút', '165 phút'],
    correctIndex: 0,
    explanation: '3 giờ = 3 x 60 = 180 phút. 180 + 15 = 195 phút.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq11',
    question: 'Một tổ sản xuất theo kế hoạch phải làm 300 sản phẩm. Đến nay đã làm được 2/3 số sản phẩm. Tổ đó còn phải làm bao nhiêu sản phẩm nữa?',
    options: ['100 sản phẩm', '200 sản phẩm', '150 sản phẩm', '50 sản phẩm'],
    correctIndex: 0,
    explanation: 'Số sản phẩm đã làm là: 300 x (2/3) = 200. Số sản phẩm còn lại phải làm là: 300 - 200 = 100.',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq12',
    question: 'Số tự nhiên lớn nhất có 6 chữ số khác nhau là:',
    options: ['999 999', '987 654', '987 650', '986 754'],
    correctIndex: 1,
    explanation: 'Xếp các chữ số lớn nhất từ trái sang phải giảm dần: 987 654.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq13',
    question: 'Cho phân số 15/35. Cần trừ cả tử số và mẫu số đi số tự nhiên nào để được phân số mới bằng 1/3?',
    options: ['5', '3', '7', '10'],
    correctIndex: 0,
    explanation: 'Thử trừ đi 5: (15 - 5)/(35 - 5) = 10/30 = 1/3. Vậy số cần trừ là 5.',
    points: 5,
    difficulty: 'hard'
  },
  {
    id: 'eq14',
    question: 'Đoạn đường từ nhà Nam đến trường dài 1km 50m. Đoạn đường đó dài bao nhiêu mét?',
    options: ['1500m', '1050m', '1005m', '150m'],
    correctIndex: 1,
    explanation: '1km = 1000m. 1000m + 50m = 1050m.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq15',
    question: 'Một hình vuông có diện tích 64 cm². Chu vi của hình vuông đó là:',
    options: ['32 cm', '16 cm', '24 cm', '64 cm'],
    correctIndex: 0,
    explanation: 'Vì 8 x 8 = 64 nên cạnh hình vuông là 8cm. Chu vi = 8 x 4 = 32cm.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq16',
    question: 'Mẹ mua 5kg gạo hết 90 000 đồng. Hỏi mẹ mua 8kg gạo như thế hết bao nhiêu tiền?',
    options: ['144 000 đồng', '135 000 đồng', '150 000 đồng', '160 000 đồng'],
    correctIndex: 0,
    explanation: 'Giá 1kg gạo = 90 000 : 5 = 18 000 đồng. Mua 8kg = 18 000 x 8 = 144 000 đồng.',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq17',
    question: 'Hai đường thẳng vuông góc với nhau tạo thành mấy góc vuông?',
    options: ['1 góc vuông', '2 góc vuông', '4 góc vuông', '8 góc vuông'],
    correctIndex: 2,
    explanation: 'Hai đường thẳng cắt nhau và vuông góc tạo thành 4 góc vuông tại giao điểm.',
    points: 5,
    difficulty: 'easy'
  },
  {
    id: 'eq18',
    question: 'Tìm số tự nhiên a sao cho: a x 11 = 253',
    options: ['21', '23', '25', '27'],
    correctIndex: 1,
    explanation: 'a = 253 : 11 = 23. (Dấu hiệu nhân với 11: chữ số giữa bằng tổng hai chữ số ngoài 2 + 3 = 5).',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq19',
    question: 'Có bao nhiêu số chẵn có hai chữ số?',
    options: ['45 số', '50 số', '44 số', '90 số'],
    correctIndex: 0,
    explanation: 'Các số chẵn có hai chữ số từ 10 đến 98. Số các số = (98 - 10) : 2 + 1 = 45 số.',
    points: 5,
    difficulty: 'medium'
  },
  {
    id: 'eq20',
    question: 'Một bể bơi hình chữ nhật có chu vi 120m. Chiều rộng bằng 1/3 chiều dài. Thể tích nước nếu đổ đầy bể sâu 2m là:',
    options: ['1350 m³', '900 m³', '675 m³', '1200 m³'],
    correctIndex: 0,
    explanation: 'Nửa chu vi = 120 : 2 = 60m. Tổng số phần = 1 + 3 = 4 phần. Chiều rộng = 60 : 4 = 15m. Chiều dài = 15 x 3 = 45m. Thể tích = 45 x 15 x 2 = 1350 m³.',
    points: 5,
    difficulty: 'hard'
  }
];

export const GIFTS_CATALOG: GiftItem[] = [
  {
    id: 'gift-1',
    name: 'Gấu bông Cú Thông Thái Bon Ben (Size Đại 45cm)',
    category: 'gau_bong',
    diamondsCost: 500,
    image: MASCOT_IMAGE,
    stock: 120,
    badge: 'Quà độc quyền HOT',
    description: 'Thú bông Bon Ben nhung tuyết cao cấp, đội mũ cử nhân và đeo kính trí tuệ. Quà tặng yêu thích số 1 của học sinh Bon Ben.'
  },
  {
    id: 'gift-2',
    name: 'Balo Chống Gù Lớp Học Bon Ben Pro Edition',
    category: 'thoi_trang',
    diamondsCost: 1200,
    image: GIFTS_HERO_IMAGE,
    stock: 45,
    badge: 'Số lượng có hạn',
    description: 'Chất liệu siêu nhẹ chống nước, đệm lưng công thái học chuẩn Châu Âu giúp bảo vệ cột sống tối đa cho học sinh.'
  },
  {
    id: 'gift-3',
    name: 'Bình Giữ Nhiệt Thông Minh Bon Ben 750ml',
    category: 'cong_nghe',
    diamondsCost: 650,
    image: GIFTS_HERO_IMAGE,
    stock: 80,
    badge: 'Mới về',
    description: 'Inox 316 an toàn thực phẩm, giữ nhiệt 24h, nắp hiển thị nhiệt độ cảm ứng LED hiện đại.'
  },
  {
    id: 'gift-4',
    name: 'Bộ Cờ Vua Nam Châm Trí Tuệ Bon Ben',
    category: 'hoc_tap',
    diamondsCost: 400,
    image: GIFTS_HERO_IMAGE,
    stock: 150,
    description: 'Bàn cờ gấp gọn cao cấp có từ tính, giúp rèn luyện tư duy logic chiến thuật sau mỗi giờ học toán.'
  },
  {
    id: 'gift-5',
    name: 'Hộp Bút Đa Năng Biến Hình Bon Ben',
    category: 'hoc_tap',
    diamondsCost: 280,
    image: GIFTS_HERO_IMAGE,
    stock: 210,
    description: 'Nhiều ngăn tiện lợi, đi kèm bộ thước kẻ và bút gel dạ quang Bon Ben chính hãng.'
  },
  {
    id: 'gift-6',
    name: 'Voucher Học Bổng Toàn Phần 6 Tháng Bon Ben',
    category: 'hoc_bong',
    diamondsCost: 1800,
    image: MASCOT_IMAGE,
    stock: 20,
    badge: 'Giá trị cao',
    description: 'Kích hoạt ngay 6 tháng học không giới hạn toàn bộ môn Toán, Tiếng Việt, Tiếng Anh và Đấu trường.'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'user-1',
    rank: 1,
    name: 'Nguyễn Trần Minh Khôi',
    school: 'Tiểu học Archimedes Academy',
    province: 'Hà Nội',
    grade: 4,
    score: 9850,
    diamonds: 3420,
    arenaWins: 142,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Khoi'
  },
  {
    id: 'user-2',
    rank: 2,
    name: 'Lê Hoàng Bảo Ngọc',
    school: 'Tiểu học Lê Quý Đôn',
    province: 'TP. Hồ Chí Minh',
    grade: 4,
    score: 9620,
    diamonds: 3180,
    arenaWins: 135,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ngoc'
  },
  {
    id: 'user-3',
    rank: 3,
    name: 'Đặng Tuấn Kiệt',
    school: 'Tiểu học Thực nghiệm Victory',
    province: 'Đà Nẵng',
    grade: 4,
    score: 9410,
    diamonds: 2950,
    arenaWins: 128,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kiet'
  },
  {
    id: 'user-4',
    rank: 4,
    name: 'Vũ Thảo Linh',
    school: 'Tiểu học Chu Văn An',
    province: 'Hà Nội',
    grade: 4,
    score: 9120,
    diamonds: 2710,
    arenaWins: 119,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Linh'
  },
  {
    id: 'user-5',
    rank: 5,
    name: 'Phạm Minh Quân',
    school: 'Tiểu học Phan Bội Châu',
    province: 'Nghệ An',
    grade: 4,
    score: 8940,
    diamonds: 2540,
    arenaWins: 112,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Quan'
  },
  {
    id: 'user-6',
    rank: 6,
    name: 'Trần Gia Hân',
    school: 'Tiểu học Trần Hưng Đạo',
    province: 'Hải Phòng',
    grade: 4,
    score: 8750,
    diamonds: 2420,
    arenaWins: 104,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Han'
  },
  {
    id: 'user-7',
    rank: 7,
    name: 'Bùi Đức Anh',
    school: 'Tiểu học Ngô Quyền',
    province: 'Cần Thơ',
    grade: 4,
    score: 8520,
    diamonds: 2280,
    arenaWins: 98,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Anh'
  }
];

export const INITIAL_DIAGNOSIS: SkillDiagnosis[] = [
  {
    category: 'Số học & Phép tính cộng trừ',
    mastery: 0,
    status: 'gap',
    recommendedTopic: 'Phép nhân nhẩm số có 2 chữ số',
    totalPracticed: 0
  },
  {
    category: 'Hình học & Đo lường (Chu vi, Diện tích)',
    mastery: 0,
    status: 'gap',
    recommendedTopic: 'Diện tích hình thoi và hình bình hành',
    totalPracticed: 0
  },
  {
    category: 'Phân số và Các phép tính',
    mastery: 0,
    status: 'gap',
    recommendedTopic: 'Quy đồng mẫu số nhiều phân số',
    totalPracticed: 0
  },
  {
    category: 'Giải toán có lời văn (Tỉ số, Hiệu tỉ)',
    mastery: 0,
    status: 'gap',
    recommendedTopic: 'Bài toán Tìm hai số khi biết Tổng và Tỉ số',
    totalPracticed: 0
  },
  {
    category: 'Toán logic & Chuyên đề nâng cao',
    mastery: 0,
    status: 'gap',
    recommendedTopic: 'Phương pháp khử và giả thiết tạm',
    totalPracticed: 0
  }
];

export const PRICING_PACKAGES = [
  {
    id: 'plan-3m',
    name: 'Gói Trải Nghiệm 3 Tháng',
    badge: 'Bắt đầu dễ dàng',
    popular: false,
    priceMonthly: '180.000đ',
    totalPrice: '540.000đ',
    originalPrice: '750.000đ',
    duration: '3 tháng học',
    features: [
      'Toàn bộ bài giảng hoạt hình 1 môn học',
      'Kho 30.000+ câu hỏi luyện tập AI',
      'Tham gia Đấu trường Bon Ben hàng tuần',
      'Báo cáo kết quả gửi qua email phụ huynh',
      'Mở khóa 20 bài luyện chuyên sâu mỗi môn'
    ],
    bonus: 'Tặng bộ đề luyện thi Học kì chuẩn Bộ GD&ĐT'
  },
  {
    id: 'plan-12m',
    name: 'Gói Toàn Diện 1 Năm (Khuyên dùng)',
    badge: 'Tiết kiệm 55% - Phổ biến nhất',
    popular: true,
    priceMonthly: '99.000đ',
    totalPrice: '1.188.000đ',
    originalPrice: '2.600.000đ',
    duration: '12 tháng học',
    features: [
      'Mở khóa TOÀN BỘ môn Toán, Văn, Anh theo khối lớp',
      'Trợ lý học tập AI chẩn đoán lỗ hổng 24/7',
      'Đấu trường Bon Ben không giới hạn lượt thi',
      'Chương trình bồi dưỡng Học sinh giỏi & Violympic',
      'Báo cáo biểu đồ năng lực thời gian thực cho phụ huynh',
      'Tài khoản phụ huynh chuyên biệt kết nối giáo viên'
    ],
    bonus: 'Mở khóa trọn bộ Đề thi Học sinh giỏi & Thách đấu 1vs1'
  },
  {
    id: 'plan-combo',
    name: 'Gói Siêu Cấp 2 Năm (Combo Toàn Diện)',
    badge: 'Ưu đãi cao nhất',
    popular: false,
    priceMonthly: '82.000đ',
    totalPrice: '1.980.000đ',
    originalPrice: '4.800.000đ',
    duration: '24 tháng học',
    features: [
      'Toàn quyền truy cập Toán + Ngữ văn + Tiếng Anh + KHTN',
      'Luyện thi chứng chỉ Quốc tế Cambridge / SASMO',
      'Cố vấn học tập 1-1 hỗ trợ giải đáp bài khó',
      'Ưu tiên xếp hạng & vinh danh Đấu trường Quốc gia',
      'Bảo lưu thời gian học khi cần nghỉ lễ'
    ],
    bonus: 'Đặc quyền cố vấn học tập AI cá nhân hóa 24 tháng'
  }
];

export const NEWS_LIST = [
  {
    id: 'news-1',
    date: '04/11/2026',
    title: 'Khởi tranh Vòng sơ khảo Đấu trường Trí tuệ Bon Ben toàn quốc 2026',
    summary: 'Quy tụ hơn 500.000 học sinh từ 63 tỉnh thành tranh tài ở cả 3 môn Toán, Ngữ văn và Tiếng Anh với hệ thống câu hỏi phân hóa chuẩn quốc tế.',
    tag: 'Sự kiện Đấu trường',
    image: HERO_IMAGE
  },
  {
    id: 'news-2',
    date: '01/11/2026',
    title: 'Phương pháp giúp con bứt phá điểm 9-10 môn Toán, Văn, Anh chỉ với 20 phút mỗi ngày',
    summary: 'Chuyên gia giáo dục chia sẻ kinh nghiệm rèn luyện tính tự giác và phương pháp lấp lỗ hổng kiến thức chính xác cho học sinh phổ thông.',
    tag: 'Kinh nghiệm học tốt',
    image: MASCOT_IMAGE
  },
  {
    id: 'news-3',
    date: '28/10/2026',
    title: 'Vinh danh Top 100 trạng nguyên nhí dẫn đầu Bảng Vàng Lớp học Bon Ben tháng 10',
    summary: 'Danh sách các bạn học sinh xuất sắc hoàn thành trọn bộ 20 bài luyện chuyên sâu môn Toán, Ngữ văn và Tiếng Anh với điểm số tuyệt đối.',
    tag: 'Vinh danh bảng vàng',
    image: GIFTS_HERO_IMAGE
  }
];

export const FAQS = [
  {
    q: 'Lớp học Bon Ben khác gì so với các chương trình học thông thường?',
    a: 'Lớp học Bon Ben ứng dụng trí tuệ nhân tạo (AI) để phân tích năng lực của từng học sinh theo thời gian thực. Hệ thống chỉ ra chính xác con đang hổng kiến thức ở điểm nào và đề xuất bài luyện 20 câu đúng trọng tâm, giúp con tiết kiệm 50% thời gian nhưng hiệu quả gấp đôi.'
  },
  {
    q: 'Mỗi môn Toán, Ngữ văn và Tiếng Anh có bao nhiêu bài luyện và câu hỏi?',
    a: 'Mỗi môn học đều được trang bị hệ thống ít nhất 20 bài luyện chuyên sâu chia theo từng chuyên đề từ cơ bản đến nâng cao. Đặc biệt, mỗi bài luyện đều có đầy đủ 20 câu hỏi tương tác kèm gợi ý AI và lời giải chi tiết từng bước.'
  },
  {
    q: 'Phụ huynh có thể theo dõi việc học của con như thế nào?',
    a: 'Phụ huynh có giao diện riêng để xem báo cáo học bạ điện tử chi tiết: thời gian con học, số bài luyện 20 câu đã hoàn thành, điểm số từng kỹ năng và nhận xét khuyến nghị của AI sau mỗi buổi học.'
  },
  {
    q: 'Chương trình Bon Ben có bám sát sách giáo khoa mới không?',
    a: 'Có. Toàn bộ nội dung bài học, bài luyện 20 câu và đề luyện thi được xây dựng bám sát 100% theo Chương trình Giáo dục phổ thông mới của Bộ Giáo dục & Đào tạo (Kết nối tri thức, Cánh Diều, Chân trời sáng tạo).'
  }
];

export const GRADE_EXERCISE_TYPES: Record<GradeLevel, ExerciseType[]> = {
  1: [
    {
      id: 'g1-d1',
      grade: 1,
      subject: 'Toán học',
      name: 'Dạng 1: Phép cộng, phép trừ trong phạm vi 10 & 20',
      description: 'Đếm thêm, đếm bớt, làm quen với que tính ảo và trục số sinh động.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Nền tảng',
      iconName: 'Calculator'
    },
    {
      id: 'g1-d2',
      grade: 1,
      subject: 'Toán học',
      name: 'Dạng 2: Nhận biết Hình vuông, Tròn, Tam giác & Chữ nhật',
      description: 'Phân loại hình khối qua đồ vật quen thuộc trong đời sống.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Shapes'
    },
    {
      id: 'g1-d3',
      grade: 1,
      subject: 'Toán học',
      name: 'Dạng 3: Bài toán So sánh Nhiều hơn, Ít hơn',
      description: 'Ghép cặp đôi tương ứng, rèn tư duy logic so sánh số lượng.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm',
      iconName: 'Scale'
    },
    {
      id: 'g1-d4',
      grade: 1,
      subject: 'Tiếng Việt',
      name: 'Dạng 4: Ghép vần, Luyện âm & Điền từ ngữ đúng dấu thanh',
      description: 'Nhận diện thanh hỏi, ngã, sắc, huyền, nặng và viết chính tả câu đơn.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'BookOpen'
    }
  ],
  2: [
    {
      id: 'g2-d1',
      grade: 2,
      subject: 'Toán học',
      name: 'Dạng 1: Phép cộng, trừ có nhớ trong phạm vi 100',
      description: 'Đặt tính rồi tính thẳng cột, kỹ thuật nhớ 1 sang hàng chục.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hay sai',
      iconName: 'Calculator'
    },
    {
      id: 'g2-d2',
      grade: 2,
      subject: 'Toán học',
      name: 'Dạng 2: Bảng nhân 2, nhân 5 và Bảng chia tương ứng',
      description: 'Học thuộc và ứng dụng nhân chia nhẩm siêu tốc cùng AI.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Zap'
    },
    {
      id: 'g2-d3',
      grade: 2,
      subject: 'Toán học',
      name: 'Dạng 3: Tìm thành phần chưa biết (Tìm x: số hạng, số bị trừ)',
      description: 'Quy tắc tìm x trong các biểu thức cộng trừ nhân chia.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Thi học kỳ',
      iconName: 'Target'
    },
    {
      id: 'g2-d4',
      grade: 2,
      subject: 'Toán học',
      name: 'Dạng 4: Đại lượng đo lường: Ki-lô-gam (kg), Lít (l), Đề-xi-mét (dm)',
      description: 'Quy đổi đơn vị và các bài toán thực tế đo lường dung tích, cân nặng.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Compass'
    }
  ],
  3: [
    {
      id: 'g3-d1',
      grade: 3,
      subject: 'Toán học',
      name: 'Dạng 1: Bảng nhân, chia từ 6 đến 9 & Phép chia có dư',
      description: 'Thành thạo bảng cửu chương mở rộng, số dư luôn nhỏ hơn số chia.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Calculator'
    },
    {
      id: 'g3-d2',
      grade: 3,
      subject: 'Toán học',
      name: 'Dạng 2: Chu vi & Diện tích Hình chữ nhật, Hình vuông',
      description: 'Công thức tính chu vi và diện tích qua các bài toán trải nghiệm.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm',
      iconName: 'Shapes'
    },
    {
      id: 'g3-d3',
      grade: 3,
      subject: 'Toán học',
      name: 'Dạng 3: Bài toán Rút về đơn vị (Dạng 1 & Dạng 2)',
      description: 'Tìm giá trị của 1 phần rồi nhân lên hoặc chia ra theo yêu cầu.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hay thi',
      iconName: 'TrendingUp'
    },
    {
      id: 'g3-d4',
      grade: 3,
      subject: 'Toán học',
      name: 'Dạng 4: Đọc số La Mã, Xem đồng hồ chính xác đến phút',
      description: 'Kỹ năng thực tế nhận diện I, V, X và tính khoảng thời gian trôi qua.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Clock'
    }
  ],
  4: [
    {
      id: 'g4-d1',
      grade: 4,
      subject: 'Toán học',
      name: 'Dạng 1: Phân số & Các phép tính Cộng, Trừ, Nhân, Chia phân số',
      description: 'Quy đồng mẫu số, rút gọn phân số tối giản và 4 phép tính cơ bản.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm số 1',
      iconName: 'Calculator'
    },
    {
      id: 'g4-d2',
      grade: 4,
      subject: 'Toán học',
      name: 'Dạng 2: Bài toán Tìm hai số khi biết Tổng và Hiệu',
      description: 'Công thức: Số lớn = (Tổng + Hiệu) : 2; Số bé = (Tổng - Hiệu) : 2.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Thi giữa kỳ',
      iconName: 'TrendingUp'
    },
    {
      id: 'g4-d3',
      grade: 4,
      subject: 'Toán học',
      name: 'Dạng 3: Bài toán Tìm hai số khi biết Tổng (hoặc Hiệu) và Tỉ số',
      description: 'Vẽ sơ đồ đoạn thẳng, tìm tổng số phần bằng nhau rồi tính từng số.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Điểm 9-10',
      iconName: 'Scale'
    },
    {
      id: 'g4-d4',
      grade: 4,
      subject: 'Toán học',
      name: 'Dạng 4: Hình bình hành & Hình thoi: Tính Chu vi và Diện tích',
      description: 'Diện tích hình bình hành = đáy x cao; Diện tích hình thoi = (d1 x d2) : 2.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Shapes'
    },
    {
      id: 'g4-d5',
      grade: 4,
      subject: 'Toán học',
      name: 'Dạng 5: Dấu hiệu chia hết cho 2, 3, 5, 9 & Số trung bình cộng',
      description: 'Nhận biết số dư và giải nhanh các bài toán tính tổng nhanh chữ số.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Zap'
    }
  ],
  5: [
    {
      id: 'g5-d1',
      grade: 5,
      subject: 'Toán học',
      name: 'Dạng 1: Số thập phân & 4 phép toán trên số thập phân',
      description: 'Đặt tính thẳng cột dấu phẩy, dời dấu phẩy khi nhân/chia với 10, 100, 1000.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Nền tảng',
      iconName: 'Calculator'
    },
    {
      id: 'g5-d2',
      grade: 5,
      subject: 'Toán học',
      name: 'Dạng 2: Bài toán Tỉ số phần trăm & Ứng dụng thực tế',
      description: 'Tính tỉ số %, tìm a% của một số, tìm số biết a% của nó, bài toán lãi suất.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hay thi',
      iconName: 'TrendingUp'
    },
    {
      id: 'g5-d3',
      grade: 5,
      subject: 'Toán học',
      name: 'Dạng 3: Bài toán Chuyển động đều (s = v x t, Chuyển động cùng/ngược chiều)',
      description: 'Thời gian gặp nhau = Quãng đường : Tổng vận tốc; Hai xe đuổi kịp nhau.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Điểm 10',
      iconName: 'Zap'
    },
    {
      id: 'g5-d4',
      grade: 5,
      subject: 'Toán học',
      name: 'Dạng 4: Hình tròn, Hình thang & Hình hộp chữ nhật (Thể tích, Diện tích toàn phần)',
      description: 'Chu vi, diện tích hình tròn (r x r x 3.14), diện tích hình thang, thể tích hộp.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Shapes'
    }
  ],
  6: [
    {
      id: 'g6-d1',
      grade: 6,
      subject: 'Toán học',
      name: 'Dạng 1: Tập hợp số nguyên Z & Quy tắc bỏ dấu ngoặc, chuyển vế',
      description: 'Thực hiện phép tính với số âm, biểu diễn số đối trên trục số.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Nền tảng THCS',
      iconName: 'Calculator'
    },
    {
      id: 'g6-d2',
      grade: 6,
      subject: 'Toán học',
      name: 'Dạng 2: Phân tích ra thừa số nguyên tố, Tìm ƯCLN và BCNN',
      description: 'Ứng dụng chia đều phần quà, chia số học sinh trong hoạt động thực tiễn.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm',
      iconName: 'TrendingUp'
    },
    {
      id: 'g6-d3',
      grade: 6,
      subject: 'Toán học',
      name: 'Dạng 3: Phân số số học, Hỗn số và 3 bài toán cơ bản về phân số',
      description: 'Tìm giá trị phân số của một số, tìm một số biết giá trị phân số của nó.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Scale'
    },
    {
      id: 'g6-d4',
      grade: 6,
      subject: 'Toán học',
      name: 'Dạng 4: Điểm, Đoạn thẳng, Trung điểm của đoạn thẳng và Góc',
      description: 'Tính độ dài đoạn thẳng, chứng minh một điểm là trung điểm của đoạn thẳng.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Shapes'
    }
  ],
  7: [
    {
      id: 'g7-d1',
      grade: 7,
      subject: 'Toán học',
      name: 'Dạng 1: Tập hợp số hữu tỉ Q, Số vô tỉ và Căn bậc hai số học',
      description: 'Lũy thừa của số hữu tỉ, quy tắc nhân chia lũy thừa cùng cơ số.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Calculator'
    },
    {
      id: 'g7-d2',
      grade: 7,
      subject: 'Toán học',
      name: 'Dạng 2: Tỉ lệ thức & Dãy tỉ số bằng nhau',
      description: 'Bài toán chia phần tỉ lệ thuận và tỉ lệ nghịch trong cuộc sống.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Thi học kỳ',
      iconName: 'TrendingUp'
    },
    {
      id: 'g7-d3',
      grade: 7,
      subject: 'Toán học',
      name: 'Dạng 3: Các trường hợp bằng nhau của Tam giác (c-c-c, c-g-c, g-c-g)',
      description: 'Chứng minh hai tam giác bằng nhau, suy ra hai góc hoặc hai cạnh bằng nhau.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hình học',
      iconName: 'Shapes'
    },
    {
      id: 'g7-d4',
      grade: 7,
      subject: 'Toán học',
      name: 'Dạng 4: Biểu thức đại số, Đa thức một biến & Nghiệm của đa thức',
      description: 'Thu gọn đa thức, sắp xếp theo lũy thừa giảm dần, tìm nghiệm của P(x).',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Zap'
    }
  ],
  8: [
    {
      id: 'g8-d1',
      grade: 8,
      subject: 'Toán học',
      name: 'Dạng 1: 7 Hằng đẳng thức đáng nhớ & Phân tích đa thức thành nhân tử',
      description: 'Áp dụng các hằng đẳng thức bậc 2 và bậc 3 để tính nhanh và tìm x.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Bắt buộc',
      iconName: 'Calculator'
    },
    {
      id: 'g8-d2',
      grade: 8,
      subject: 'Toán học',
      name: 'Dạng 2: Phân thức đại số: Rút gọn & Tính giá trị biểu thức',
      description: 'Quy đồng mẫu thức, tìm điều kiện xác định và rút gọn phân thức đại số.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Scale'
    },
    {
      id: 'g8-d3',
      grade: 8,
      subject: 'Toán học',
      name: 'Dạng 3: Định lý Ta-lét & Tam giác đồng dạng',
      description: 'Tính độ dài đoạn thẳng và tỉ số diện tích giữa hai tam giác đồng dạng.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hình học 8',
      iconName: 'Shapes'
    },
    {
      id: 'g8-d4',
      grade: 8,
      subject: 'Toán học',
      name: 'Dạng 4: Phương trình bậc nhất một ẩn và Giải bài toán bằng cách lập PT',
      description: 'Toán chuyển động, toán năng suất và bài toán phần trăm dung dịch.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Thi học kỳ',
      iconName: 'TrendingUp'
    }
  ],
  9: [
    {
      id: 'g9-d1',
      grade: 9,
      subject: 'Toán học',
      name: 'Dạng 1: Rút gọn biểu thức chứa căn bậc hai & Câu hỏi phụ',
      description: 'Trục căn thức ở mẫu, tìm x nguyên để biểu thức đạt giá trị nguyên/nhỏ nhất.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Vào 10 (2 điểm)',
      iconName: 'Calculator'
    },
    {
      id: 'g9-d2',
      grade: 9,
      subject: 'Toán học',
      name: 'Dạng 2: Hệ hai phương trình bậc nhất hai ẩn & Giải bài toán lập hệ',
      description: 'Phương pháp cộng đại số, phương pháp thế và bài toán thực tế chuyển động.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm',
      iconName: 'TrendingUp'
    },
    {
      id: 'g9-d3',
      grade: 9,
      subject: 'Toán học',
      name: 'Dạng 3: Phương trình bậc hai & Hệ thức Vi-ét',
      description: 'Tính nhẩm nghiệm x1, x2, tìm m để phương trình có 2 nghiệm thỏa mãn hệ thức.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Phân loại',
      iconName: 'Target'
    },
    {
      id: 'g9-d4',
      grade: 9,
      subject: 'Toán học',
      name: 'Dạng 4: Tứ giác nội tiếp đường tròn & Tiếp tuyến',
      description: '4 dấu hiệu chứng minh tứ giác nội tiếp và quan hệ góc với đường tròn.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Vào 10 (Hình)',
      iconName: 'Shapes'
    }
  ],
  10: [
    {
      id: 'g10-d1',
      grade: 10,
      subject: 'Toán học',
      name: 'Dạng 1: Mệnh đề, Tập hợp & Các phép toán giao, hợp, hiệu',
      description: 'Xác định tập xác định, chứng minh mệnh đề chứa với mọi và tồn tại.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Calculator'
    },
    {
      id: 'g10-d2',
      grade: 10,
      subject: 'Toán học',
      name: 'Dạng 2: Bất phương trình bậc hai một ẩn & Dấu của tam thức',
      description: 'Lập bảng xét dấu, giải hệ bất phương trình và tìm tham số m.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm',
      iconName: 'TrendingUp'
    },
    {
      id: 'g10-d3',
      grade: 10,
      subject: 'Toán học',
      name: 'Dạng 3: Vectơ, Tích vô hướng & Hệ thức lượng trong tam giác',
      description: 'Định lý sin, định lý cosin, tính diện tích tam giác và độ dài đường trung tuyến.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Shapes'
    },
    {
      id: 'g10-d4',
      grade: 10,
      subject: 'Toán học',
      name: 'Dạng 4: Phương pháp tọa độ Oxy: Đường thẳng & Đường tròn',
      description: 'Viết phương trình đường thẳng, tính khoảng cách từ điểm đến đường thẳng.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Thi học kỳ',
      iconName: 'Target'
    }
  ],
  11: [
    {
      id: 'g11-d1',
      grade: 11,
      subject: 'Toán học',
      name: 'Dạng 1: Hàm số lượng giác & Phương trình lượng giác cơ bản',
      description: 'Tìm tập xác định, giải phương trình sin x, cos x, tan x và bài toán thực tế.',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Calculator'
    },
    {
      id: 'g11-d2',
      grade: 11,
      subject: 'Toán học',
      name: 'Dạng 2: Dãy số, Cấp số cộng & Cấp số nhân',
      description: 'Tìm số hạng tổng quát, tính tổng n số hạng đầu tiên của CSC và CSN.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hay thi',
      iconName: 'TrendingUp'
    },
    {
      id: 'g11-d3',
      grade: 11,
      subject: 'Toán học',
      name: 'Dạng 3: Giới hạn dãy số, Giới hạn hàm số & Đạo hàm',
      description: 'Khử dạng vô định 0/0, quy tắc tính đạo hàm và viết phương trình tiếp tuyến.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm',
      iconName: 'Zap'
    },
    {
      id: 'g11-d4',
      grade: 11,
      subject: 'Toán học',
      name: 'Dạng 4: Quan hệ vuông góc trong không gian (Đường thẳng vuông góc mặt phẳng)',
      description: 'Chứng minh đường vuông góc mặt, tính góc giữa đường thẳng và mặt phẳng.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Hình không gian',
      iconName: 'Shapes'
    }
  ],
  12: [
    {
      id: 'g12-d1',
      grade: 12,
      subject: 'Toán học',
      name: 'Dạng 1: Đơn điệu, Cực trị & Giá trị lớn nhất/nhỏ nhất của hàm số',
      description: 'Khảo sát hàm bậc 3, hàm phân thức, đọc bảng biến thiên và đồ thị f\'(x).',
      difficulty: 'Cơ bản',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Tốt nghiệp THPT',
      iconName: 'TrendingUp'
    },
    {
      id: 'g12-d2',
      grade: 12,
      subject: 'Toán học',
      name: 'Dạng 2: Hàm số Mũ, Hàm số Logarit & Phương trình mũ, logarit',
      description: 'Tìm tập xác định, giải phương trình và bất phương trình logarit.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      iconName: 'Calculator'
    },
    {
      id: 'g12-d3',
      grade: 12,
      subject: 'Toán học',
      name: 'Dạng 3: Nguyên hàm, Tích phân & Ứng dụng tính diện tích, thể tích',
      description: 'Phương pháp đổi biến số, nguyên hàm từng phần và bài toán thực tế.',
      difficulty: 'Nâng cao',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Trọng tâm 12',
      iconName: 'Scale'
    },
    {
      id: 'g12-d4',
      grade: 12,
      subject: 'Toán học',
      name: 'Dạng 4: Phương pháp tọa độ trong không gian Oxyz',
      description: 'Phương trình mặt phẳng, phương trình đường thẳng và phương trình mặt cầu.',
      difficulty: 'Vận dụng',
      totalQuestions: 20,
      completedQuestions: 0,
      badge: 'Oxyz',
      iconName: 'Shapes'
    }
  ]
};

// ==================== NGÂN HÀNG 20 CÂU HỎI TIẾNG VIỆT & NGỮ VĂN ====================
export const VIETNAMESE_PRACTICE_20_QUESTIONS: QuizQuestion[] = [
  {
    id: 'tv1',
    question: 'Trong các từ sau, từ nào là từ láy?',
    options: ['Xanh xao', 'Xanh lam', 'Xanh lục', 'Xanh thắm'],
    correctIndex: 0,
    explanation: '"Xanh xao" là từ láy âm đầu, diễn tả sắc da tái mét thiếu sức sống. Các từ còn lại là từ ghép chính phụ.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv2',
    question: 'Biện pháp tu từ nào được sử dụng trong câu: "Trăng nằm sóng soài trên cành liễu"?',
    options: ['So sánh', 'Nhân hóa', 'Ẩn dụ', 'Điệp từ'],
    correctIndex: 1,
    explanation: 'Từ "nằm sóng soài" là hành động, tư thế của con người được gán cho "Trăng", do đó đây là biện pháp nhân hóa.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv3',
    question: 'Từ nào sau đây viết ĐÚNG chính tả?',
    options: ['Sắp sếp', 'Sắp xếp', 'Xắp sếp', 'Xắp xếp'],
    correctIndex: 1,
    explanation: '"Sắp xếp" viết đúng chính tả tiếng Việt ("sắp" với âm đầu s, "xếp" với âm đầu x).',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv4',
    question: 'Thành ngữ "Học một biết mười" nói về phẩm chất gì?',
    options: ['Chăm chỉ làm việc', 'Thông minh, sáng dạ', 'Hiền lành, thật thà', 'Dũng cảm, kiên cường'],
    correctIndex: 1,
    explanation: '"Học một biết mười" ca ngợi trí thông minh, khả năng tiếp thu và tư duy mở rộng xuất sắc.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv5',
    question: 'Câu nào sau đây là câu ghép có quan hệ tương phản?',
    options: [
      'Vì trời mưa nên đường trơn.',
      'Mặc dù trời mưa to nhưng Nam vẫn đến lớp đúng giờ.',
      'Nếu em chăm học thì em sẽ đạt điểm cao.',
      'Trời vừa hửng sáng, chim chóc đã hót ríu rít.'
    ],
    correctIndex: 1,
    explanation: 'Cặp quan hệ từ "Mặc dù... nhưng..." biểu thị mối quan hệ tương phản đối lập giữa hai vế câu ghép.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'tv6',
    question: 'Chủ ngữ trong câu: "Dưới bóng tre xanh của làng quê Việt Nam, người nông dân dựng nhà dựng cửa" là gì?',
    options: ['Dưới bóng tre xanh', 'Làng quê Việt Nam', 'Người nông dân', 'Dựng nhà dựng cửa'],
    correctIndex: 2,
    explanation: '"Dưới bóng tre xanh của làng quê Việt Nam" là trạng ngữ chỉ nơi chốn. Chủ ngữ trả lời cho câu hỏi "Ai?" chính là "người nông dân".',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'tv7',
    question: 'Từ đồng nghĩa với từ "Bao la" là:',
    options: ['Mênh mông', 'Chật hẹp', 'Cao vút', 'Thăm thẳm'],
    correctIndex: 0,
    explanation: '"Bao la" đồng nghĩa với "Mênh mông", cùng chỉ không gian rộng lớn không cùng.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv8',
    question: 'Tác giả của bài thơ "Hạt gạo làng ta" là ai?',
    options: ['Xuân Quỳnh', 'Trần Đăng Khoa', 'Phạm Tiến Duật', 'Huy Cận'],
    correctIndex: 1,
    explanation: 'Bài thơ thiếu nhi nổi tiếng "Hạt gạo làng ta" do thần đồng thơ Trần Đăng Khoa sáng tác năm 1968.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv9',
    question: 'Đoạn văn miêu tả cảnh buổi sáng trên quê hương thuộc thể loại văn nào?',
    options: ['Văn kể chuyện', 'Văn miêu tả', 'Văn biểu cảm', 'Văn nghị luận'],
    correctIndex: 1,
    explanation: 'Tái hiện đường nét, màu sắc, âm thanh của sự vật hiện tượng là đặc trưng của văn miêu tả.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv10',
    question: 'Từ "chân" trong câu nào sau đây mang NGHĨA CHUYỂN?',
    options: ['Bé bị ngã đau chân.', 'Cầu thủ đá bóng bằng chân thuận.', 'Dưới chân núi có một dòng suối mát.', 'Chân tôi bước đi thoăn thoắt.'],
    correctIndex: 2,
    explanation: '"Chân núi" mang nghĩa chuyển (phần đáy dưới cùng tiếp giáp mặt đất của núi). Các câu còn lại mang nghĩa gốc là bộ phận cơ thể.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'tv11',
    question: 'Điền từ thích hợp vào câu tục ngữ: "Uống nước nhớ ......"?',
    options: ['nguồn', 'sông', 'suối', 'bến'],
    correctIndex: 0,
    explanation: 'Tục ngữ Việt Nam: "Uống nước nhớ nguồn" dạy đạo lý biết ơn tổ tiên, cội nguồn.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv12',
    question: 'Từ nào sau đây KHÔNG cùng nhóm với các từ còn lại?',
    options: ['Bác sĩ', 'Giáo viên', 'Kỹ sư', 'Bệnh viện'],
    correctIndex: 3,
    explanation: '"Bệnh viện" là danh từ chỉ nơi chốn, trong khi 3 từ còn lại là danh từ chỉ nghề nghiệp con người.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv13',
    question: 'Dấu câu nào dùng để đánh dấu lời nói trực tiếp của nhân vật hoặc phần trích dẫn?',
    options: ['Dấu chấm lửng (...)', 'Dấu hai chấm (:) và ngoặc kép (" ")', 'Dấu gạch ngang đơn', 'Dấu chấm phẩy (;)'],
    correctIndex: 1,
    explanation: 'Dấu hai chấm kết hợp dấu ngoặc kép hoặc gạch đầu dòng dùng để dẫn lời nói trực tiếp.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'tv14',
    question: 'Câu nào sau đây là câu cảm thán biểu lộ cảm xúc?',
    options: ['Hôm nay trời nắng đẹp quá!', 'Bạn đi đâu đấy?', 'Hãy mở cửa sổ ra.', 'Tôi là học sinh lớp Bon Ben.'],
    correctIndex: 0,
    explanation: 'Câu "Hôm nay trời nắng đẹp quá!" kết thúc bằng dấu chấm than bộc lộ trực tiếp cảm xúc khen ngợi.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv15',
    question: 'Từ "dũng cảm" trái nghĩa với từ nào sau đây?',
    options: ['Hèn nhát', 'Gan dạ', 'Anh dũng', 'Kiên cường'],
    correctIndex: 0,
    explanation: '"Hèn nhát" biểu thị tính cách sợ sệt, thiếu bản lĩnh, trái ngược hoàn toàn với "dũng cảm".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv16',
    question: 'Trong câu: "Mùa xuân, cây cối đâm chồi nảy lộc", bộ phận "Mùa xuân" là thành phần gì?',
    options: ['Chủ ngữ', 'Vị ngữ', 'Trạng ngữ chỉ thời gian', 'Bổ ngữ'],
    correctIndex: 2,
    explanation: '"Mùa xuân" đứng đầu câu ngăn cách bởi dấu phẩy là trạng ngữ chỉ thời gian.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv17',
    question: 'Từ "đậu" trong hai câu "Chim đậu trên cành hoa" và "Mẹ nấu chè đậu xanh" có mối quan hệ gì?',
    options: ['Từ đồng nghĩa', 'Từ trái nghĩa', 'Từ nhiều nghĩa', 'Từ đồng âm'],
    correctIndex: 3,
    explanation: 'Hai từ phát âm giống hệt nhau nhưng nghĩa hoàn toàn khác biệt (hành động đứng yên vs loại hạt thực vật), đó là hiện tượng từ đồng âm.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'tv18',
    question: 'Nghĩa của từ "Tự trọng" là gì?',
    options: ['Tự coi mình là quan trọng nhất', 'Biết coi trọng và giữ gìn phẩm giá của chính mình', 'Tự làm mọi việc không cần ai giúp', 'Tự chịu trách nhiệm về lời nói'],
    correctIndex: 1,
    explanation: 'Tự trọng là phẩm chất đạo đức biết giữ gìn danh dự và nhân cách của bản thân.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'tv19',
    question: 'Đại từ xưng hô nào thể hiện thái độ tôn kính nhất?',
    options: ['Tôi - Cậu', 'Kính thưa Thầy - Em', 'Tao - Mày', 'Mình - Bạn'],
    correctIndex: 1,
    explanation: 'Cặp từ "Kính thưa Thầy - Em" thể hiện truyền thống tôn sư trọng đạo và lễ phép cao nhất.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'tv20',
    question: 'Nêu ý nghĩa biểu trưng của hình ảnh "Cây tre" trong tâm hồn và văn hóa dân tộc Việt Nam:',
    options: [
      'Sự kiêu hãnh và xa hoa lộng lẫy',
      'Phẩm chất cần cù, kiên cường, đoàn kết và bất khuất',
      'Sự cô đơn và xa cách cuộc đời',
      'Chỉ dùng để làm vũ khí đánh giặc'
    ],
    correctIndex: 1,
    explanation: 'Cây tre tượng trưng cho cốt cách thanh cao, dẻo dai, kiên cường và tinh thần đoàn kết keo sơn của người Việt.',
    points: 10,
    difficulty: 'hard'
  }
];

// ==================== NGÂN HÀNG 20 CÂU HỎI TIẾNG ANH (ENGLISH 20 QUESTIONS) ====================
export const ENGLISH_PRACTICE_20_QUESTIONS: QuizQuestion[] = [
  {
    id: 'en1',
    question: 'Choose the correct form: She ........... to school by bicycle every morning.',
    options: ['go', 'goes', 'going', 'went'],
    correctIndex: 1,
    explanation: 'Present Simple tense with third-person singular subject "She" requires the verb + "es": "goes".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en2',
    question: 'What is the opposite of the word "GENEROUS"?',
    options: ['Kind', 'Selfish', 'Polite', 'Friendly'],
    correctIndex: 1,
    explanation: '"Generous" means willing to give or share. The opposite is "Selfish" (mean, greedy).',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en3',
    question: 'Choose the correct preposition: We have lived in Hanoi ........... 2018.',
    options: ['for', 'since', 'in', 'at'],
    correctIndex: 1,
    explanation: 'Present Perfect tense with a specific point in time (2018) uses "since".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en4',
    question: 'Which word has the underlined part pronounced differently: pl<u>a</u>te, l<u>a</u>te, c<u>a</u>t, d<u>a</u>te?',
    options: ['plate', 'late', 'cat', 'date'],
    correctIndex: 2,
    explanation: '"cat" is pronounced /æ/, while "plate", "late", and "date" are pronounced /eɪ/.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en5',
    question: 'If it ........... tomorrow, we will stay at home.',
    options: ['rains', 'will rain', 'rained', 'is raining'],
    correctIndex: 0,
    explanation: 'First Conditional: If + Present Simple (rains), will + base verb (will stay).',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en6',
    question: 'Tom is the ........... student in our class.',
    options: ['taller', 'tallest', 'more tall', 'most tall'],
    correctIndex: 1,
    explanation: 'Superlative of one-syllable adjective "tall" is "the tallest".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en7',
    question: 'Choose the correct response: "Thank you very much for your great help!" - "..........."',
    options: ['Never mind.', 'You are welcome!', 'Yes, of course.', 'I agree with you.'],
    correctIndex: 1,
    explanation: '"You are welcome!" is the standard polite response to "Thank you".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en8',
    question: 'He enjoys ........... badminton with his father on weekends.',
    options: ['play', 'playing', 'to play', 'played'],
    correctIndex: 1,
    explanation: 'The verb "enjoy" is followed by a gerund (V-ing): "enjoy playing".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en9',
    question: 'This book was written ........... a famous Vietnamese author in 1995.',
    options: ['with', 'by', 'of', 'from'],
    correctIndex: 1,
    explanation: 'Passive voice agent is preceded by the preposition "by".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en10',
    question: 'Look at those dark clouds! It ........... rain.',
    options: ['is going to', 'will', 'is', 'shall'],
    correctIndex: 0,
    explanation: 'Predictions based on present evidence (dark clouds) use "be going to".',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en11',
    question: 'Which of the following is a healthy lifestyle habit?',
    options: ['Staying up very late', 'Eating lots of junk food', 'Drinking plenty of water daily', 'Skipping breakfast'],
    correctIndex: 2,
    explanation: 'Drinking plenty of water daily maintains hydration and optimal body function.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en12',
    question: 'Choose the correct question tag: "You didn\'t do your homework, ...........?"',
    options: ['did you', 'didn\'t you', 'do you', 'don\'t you'],
    correctIndex: 0,
    explanation: 'A negative statement takes a positive tag: "didn\'t" -> "did you?".',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en13',
    question: 'Find the synonym of "INTELLIGENT":',
    options: ['Clever', 'Stupid', 'Lazy', 'Clumsy'],
    correctIndex: 0,
    explanation: '"Intelligent" and "Clever" both describe someone sharp and bright.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en14',
    question: 'The Eiffel Tower is located in which European capital city?',
    options: ['London', 'Berlin', 'Rome', 'Paris'],
    correctIndex: 3,
    explanation: 'The iconic Eiffel Tower is situated on the Champ de Mars in Paris, France.',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en15',
    question: 'My mother asked me where I ........... the previous Sunday.',
    options: ['went', 'had gone', 'go', 'have gone'],
    correctIndex: 1,
    explanation: 'Reported speech for past simple backshifts to past perfect: "had gone".',
    points: 10,
    difficulty: 'hard'
  },
  {
    id: 'en16',
    question: 'How ........... water should an adult drink each day?',
    options: ['many', 'much', 'often', 'far'],
    correctIndex: 1,
    explanation: '"Water" is an uncountable noun, so we ask quantity with "How much".',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'en17',
    question: 'Although she was tired, ........... she completed all her assignments.',
    options: ['but', 'so', '(no word needed)', 'because'],
    correctIndex: 2,
    explanation: 'In English, "Although / Even though" clauses must NOT be followed by "but".',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en18',
    question: 'The flight was cancelled ........... the severe thunderstorm.',
    options: ['because', 'because of', 'despite', 'in spite'],
    correctIndex: 1,
    explanation: '"Because of" is followed by a noun phrase ("the severe thunderstorm"). "Because" requires a full clause.',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en19',
    question: 'What is the past participle of the irregular verb "SWIM"?',
    options: ['Swam', 'Swum', 'Swimming', 'Swimmed'],
    correctIndex: 1,
    explanation: 'Conjugation: Swim - Swam - Swum (Past Participle is "swum").',
    points: 10,
    difficulty: 'medium'
  },
  {
    id: 'en20',
    question: 'Choose the sentence that is closest in meaning: "It is impossible for us to finish this project today."',
    options: [
      'We can certainly finish this project today.',
      'We cannot finish this project today.',
      'We may finish this project today if we hurry.',
      'We finished this project yesterday.'
    ],
    correctIndex: 1,
    explanation: '"It is impossible to..." means "We cannot..." finish it.',
    points: 10,
    difficulty: 'hard'
  }
];

// ==================== LỊCH THI ĐẤU ĐẤU TRƯỜNG VIOEDU THEO VÒNG (ARENA SCHEDULE) ====================
export const ARENA_SCHEDULE_ROUNDS: ArenaScheduleRound[] = [
  {
    id: 'round-1',
    title: 'Đấu trường Sơ loại - Vòng 1',
    subject: 'Toán học',
    grade: 4,
    roundNumber: 1,
    date: 'Thứ Ba hàng tuần',
    timeSlot: '19:30 - 20:00',
    status: 'completed',
    participantsCount: 142500,
    totalQuestions: 20,
    durationMinutes: 20
  },
  {
    id: 'round-2',
    title: 'Đấu trường Sơ loại - Vòng 2',
    subject: 'Toán học',
    grade: 4,
    roundNumber: 2,
    date: 'Thứ Năm hàng tuần',
    timeSlot: '19:30 - 20:00',
    status: 'completed',
    participantsCount: 156800,
    totalQuestions: 20,
    durationMinutes: 20
  },
  {
    id: 'round-3',
    title: 'Đấu trường Sơ loại - Vòng 3 (Đang diễn ra)',
    subject: 'Toán học',
    grade: 4,
    roundNumber: 3,
    date: 'Hôm nay',
    timeSlot: '20:00 - 20:30',
    status: 'live',
    participantsCount: 189200,
    totalQuestions: 20,
    durationMinutes: 20
  },
  {
    id: 'round-4',
    title: 'Đấu trường Sơ loại - Vòng 4',
    subject: 'Toán học',
    grade: 4,
    roundNumber: 4,
    date: 'Thứ Bảy tuần này',
    timeSlot: '20:00 - 20:30',
    status: 'upcoming',
    participantsCount: 120000,
    totalQuestions: 20,
    durationMinutes: 20
  },
  {
    id: 'round-school',
    title: 'Vòng Chung kết Cấp Trường VioEdu',
    subject: 'Toán & Tiếng Việt',
    grade: 4,
    roundNumber: 10,
    date: '15/12/2026',
    timeSlot: '08:30 - 09:15',
    status: 'upcoming',
    participantsCount: 85000,
    totalQuestions: 20,
    durationMinutes: 30
  },
  {
    id: 'round-district',
    title: 'Vòng Chung kết Cấp Quận / Huyện',
    subject: 'Toán học',
    grade: 4,
    roundNumber: 14,
    date: '10/01/2027',
    timeSlot: '09:00 - 09:45',
    status: 'upcoming',
    participantsCount: 42000,
    totalQuestions: 20,
    durationMinutes: 30
  },
  {
    id: 'round-national',
    title: 'Đại hội Đấu trường Toàn quốc VioEdu',
    subject: 'Toán học & Tiếng Anh',
    grade: 4,
    roundNumber: 18,
    date: '28/03/2027',
    timeSlot: '14:30 - 15:30',
    status: 'upcoming',
    participantsCount: 15000,
    totalQuestions: 20,
    durationMinutes: 45
  }
];

// ==================== ĐỐI THỦ THÁCH ĐẤU 1VS1 (DUEL OPPONENTS POOL) ====================
export const DUEL_OPPONENTS_POOL: DuelOpponent[] = [
  {
    id: 'opp-1',
    name: 'Trần Gia Bảo',
    school: 'Tiểu học Archimedes',
    province: 'Hà Nội',
    avatar: MASCOT_IMAGE,
    level: 18,
    winRate: 88,
    rankTitle: 'Chiến Tướng Vàng'
  },
  {
    id: 'opp-2',
    name: 'Lê Thảo My',
    school: 'Tiểu học Lê Quý Đôn',
    province: 'TP. Hồ Chí Minh',
    avatar: HERO_IMAGE,
    level: 16,
    winRate: 84,
    rankTitle: 'Dũng Sĩ Tốc Độ'
  },
  {
    id: 'opp-3',
    name: 'Đặng Quốc An',
    school: 'Tiểu học Phù Đổng',
    province: 'Đà Nẵng',
    avatar: GIFTS_HERO_IMAGE,
    level: 21,
    winRate: 92,
    rankTitle: 'Cao Thủ Toàn Năng'
  },
  {
    id: 'opp-4',
    name: 'Vũ Minh Hằng',
    school: 'Tiểu học Đinh Tiên Hoàng',
    province: 'Hải Phòng',
    avatar: MASCOT_IMAGE,
    level: 15,
    winRate: 80,
    rankTitle: 'Kỳ Thủ Phân Số'
  }
];

// ==================== BỘ SƯU TẬP HUY HIỆU DANH DỰ (STUDENT BADGES) ====================
export const STUDENT_BADGES_LIST: StudentBadge[] = [
  {
    id: 'b1',
    name: 'Bậc thầy Tính nhẩm',
    description: 'Đạt chuỗi 15 câu trả lời đúng liên tiếp trong Đấu trường tốc độ.',
    icon: '⚡',
    earnedDate: '12/10/2026',
    category: 'accuracy',
    unlocked: true
  },
  {
    id: 'b2',
    name: 'Chiến tướng Đấu trường',
    description: 'Thắng 10 trận đấu trường liên tiếp và lọt Top 10 Bảng vàng tuần.',
    icon: '🏆',
    earnedDate: '28/10/2026',
    category: 'arena',
    unlocked: true
  },
  {
    id: 'b3',
    name: 'Chăm chỉ Không ngừng',
    description: 'Duy trì chuỗi học tập liên tục (Streak) trên 14 ngày không ngắt quãng.',
    icon: '🔥',
    earnedDate: '02/11/2026',
    category: 'streak',
    unlocked: true
  },
  {
    id: 'b4',
    name: 'Xạ thủ 10 Điểm',
    description: 'Đạt điểm tuyệt đối 10/10 trong bài thi kiểm tra học kì 20 câu.',
    icon: '🎯',
    earnedDate: '04/11/2026',
    category: 'accuracy',
    unlocked: true
  },
  {
    id: 'b5',
    name: 'Vua Thách đấu 1vs1',
    description: 'Giành chiến thắng trong 5 trận Thách đấu 1vs1 liên tiếp.',
    icon: '⚔️',
    category: 'arena',
    unlocked: false
  },
  {
    id: 'b6',
    name: 'Thần đồng Ngoại ngữ',
    description: 'Hoàn thành 100% các bài tập Tiếng Anh với độ chính xác trên 90%.',
    icon: '🌍',
    category: 'study',
    unlocked: false
  },
  {
    id: 'b7',
    name: 'Học giả Văn - Anh Toàn Tài',
    description: 'Hoàn thành trọn bộ 20 bài luyện môn Ngữ văn và 20 bài luyện môn Tiếng Anh.',
    icon: '📖',
    category: 'study',
    unlocked: false
  },
  {
    id: 'b8',
    name: 'Đại sứ Học tập Bon Ben',
    description: 'Lọt vào danh sách Bảng Vàng vinh danh xuất sắc cấp Quốc gia.',
    icon: '👑',
    category: 'arena',
    unlocked: false
  }
];

// ==================== DANH SÁCH BỘ ĐỀ THI ĐA MÔN & ĐA KHỐI LỚP (MULTI-SUBJECT EXAMS) ====================
export const MULTI_SUBJECT_EXAMS: ExamTest[] = [
  {
    id: 'exam-toan-hk1',
    title: 'Đề thi Học kì 1 môn Toán học (Chuẩn Bộ GD&ĐT)',
    subject: 'Toán học',
    grade: 4,
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Bao quát phân số, tính toán số tự nhiên, hình học góc bẹt góc tù và giải toán có lời văn.',
    questions: OFFICIAL_EXAM_20_QUESTIONS,
    badge: 'Chính thức'
  },
  {
    id: 'exam-tv-hk1',
    title: 'Đề thi Học kì 1 môn Tiếng Việt & Ngữ văn',
    subject: 'Tiếng Việt / Ngữ văn',
    grade: 4,
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Đọc hiểu văn bản, nhận biết từ ghép từ láy, câu ghép, dấu câu và biện pháp tu từ nhân hóa.',
    questions: VIETNAMESE_PRACTICE_20_QUESTIONS,
    badge: 'Mới ra đề'
  },
  {
    id: 'exam-en-hk1',
    title: 'Đề thi Tiếng Anh Định kỳ Khảo sát Năng lực (CEFR A1-A2)',
    subject: 'Tiếng Anh',
    grade: 4,
    durationMinutes: 30,
    totalQuestions: 20,
    description: 'Kiểm tra ngữ pháp các thì hiện tại và quá khứ, phát âm ngữ âm, từ vựng và đọc hiểu tình huống.',
    questions: ENGLISH_PRACTICE_20_QUESTIONS,
    badge: 'Khảo sát năng lực'
  },
  {
    id: 'exam-hsg-toan',
    title: 'Đề thi Học sinh giỏi Violympic & VioEdu Toán nâng cao',
    subject: 'Toán học',
    grade: 4,
    durationMinutes: 35,
    totalQuestions: 20,
    description: 'Dành cho đội tuyển HSG: Dãy số quy luật, toán logic thời gian, hình học tư duy mở rộng.',
    questions: ARENA_QUESTIONS.map((q, idx) => ({
      id: `hsg-${idx}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctAnswer,
      explanation: q.explanation,
      points: 5,
      difficulty: 'hard' as const
    })),
    badge: 'Nâng cao HSG'
  }
];
