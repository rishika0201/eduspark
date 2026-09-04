export interface CourseCard {
  id: string;
  subject: string;
  title: string;
  grade: string;
  board: string;
  progress: number;
  lessons: number;
  tests: number;
  duration: string;
  level: 'Foundation' | 'Board Ready' | 'Olympiad' | 'Crash Course';
  mentor: string;
  nextClass: string;
  color: string;
  outcomes: string[];
}



export interface DoubtThread {
  id: string;
  subject: string;
  question: string;
  answer: string;
  status: 'Solved' | 'Teacher review' | 'AI draft';
  time: string;
}

export const courseCatalog: CourseCard[] = [
  {
    id: 'math-board-master',
    subject: 'Mathematics',
    title: 'Maths Board Mastery',
    grade: 'Class 10',
    board: 'CBSE',
    progress: 68,
    lessons: 126,
    tests: 32,
    duration: '14 weeks',
    level: 'Board Ready',
    mentor: 'Ananya Rao',
    nextClass: 'Quadratic equations sprint at 6:00 PM',
    color: '#16a34a',
    outcomes: ['NCERT line-by-line coverage', 'Formula recall drills', 'Board-style proof practice'],
  },
  {
    id: 'science-concepts',
    subject: 'Science',
    title: 'Science Concept Lab',
    grade: 'Class 10',
    board: 'CBSE',
    progress: 52,
    lessons: 148,
    tests: 28,
    duration: '16 weeks',
    level: 'Foundation',
    mentor: 'Dr. Kabir Sen',
    nextClass: 'Light reflection experiments at 7:30 PM',
    color: '#16a34a',
    outcomes: ['Animated concept explainers', 'Numerical practice', 'Diagram-based questions'],
  },
  {
    id: 'social-score',
    subject: 'Social Science',
    title: 'Social Science Score Booster',
    grade: 'Class 10',
    board: 'CBSE',
    progress: 41,
    lessons: 96,
    tests: 24,
    duration: '10 weeks',
    level: 'Crash Course',
    mentor: 'Meera Thomas',
    nextClass: 'Nationalism map work at 5:00 PM',
    color: '#facc15',
    outcomes: ['Timeline memory maps', 'Case-study answer writing', 'Map practice'],
  },
  {
    id: 'english-fluency',
    subject: 'English',
    title: 'English Expression Studio',
    grade: 'Class 10',
    board: 'CBSE',
    progress: 74,
    lessons: 84,
    tests: 18,
    duration: '8 weeks',
    level: 'Board Ready',
    mentor: 'Rhea Kapoor',
    nextClass: 'Letter writing workshop at 4:30 PM',
    color: '#ec4899',
    outcomes: ['Literature summaries', 'Grammar error clinics', 'Writing templates'],
  },
  {
    id: 'physics-neet',
    subject: 'Physics',
    title: 'Physics NEET Foundation',
    grade: 'Class 12',
    board: 'CBSE',
    progress: 57,
    lessons: 172,
    tests: 42,
    duration: '20 weeks',
    level: 'Olympiad',
    mentor: 'Arjun Menon',
    nextClass: 'Electrostatics PYQ lab at 8:00 PM',
    color: '#ec4899',
    outcomes: ['Concept-to-PYQ bridge', 'Timed numericals', 'Formula derivation practice'],
  },
  {
    id: 'chem-neet',
    subject: 'Chemistry',
    title: 'Chemistry Rank Builder',
    grade: 'Class 12',
    board: 'CBSE',
    progress: 63,
    lessons: 158,
    tests: 38,
    duration: '18 weeks',
    level: 'Olympiad',
    mentor: 'Ishita Bose',
    nextClass: 'Organic reaction map at 6:45 PM',
    color: '#dc2626',
    outcomes: ['Reaction mechanism maps', 'NCERT in-text drills', 'Mock test strategy'],
  },
];



export const doubtThreads: DoubtThread[] = [
  {
    id: 'doubt-1',
    subject: 'Mathematics',
    question: 'Why does the discriminant decide the number of roots?',
    answer: 'The discriminant tells whether the square-root part of the quadratic formula is positive, zero, or negative, which maps to two, one, or no real roots.',
    status: 'Solved',
    time: '12 min ago',
  },
  {
    id: 'doubt-2',
    subject: 'Science',
    question: 'How do I remember the difference between concave and convex mirrors?',
    answer: 'Use the reflecting surface: concave curves inward like a cave and can focus parallel rays; convex bulges outward and spreads rays.',
    status: 'AI draft',
    time: '24 min ago',
  },
  {
    id: 'doubt-3',
    subject: 'English',
    question: 'What makes an analytical paragraph score full marks?',
    answer: 'Clear trend statement, exact data comparison, one inference, and a concise closing line. Avoid copying every number.',
    status: 'Teacher review',
    time: '41 min ago',
  },
];

export const weeklyPlan = [
  { day: 'Mon', task: 'Concept video', subject: 'Mathematics', minutes: 35, done: true },
  { day: 'Tue', task: 'Adaptive quiz', subject: 'Science', minutes: 25, done: true },
  { day: 'Wed', task: 'Topic review', subject: 'Mathematics', minutes: 55, done: false },
  { day: 'Thu', task: 'Doubt clearing', subject: 'Science', minutes: 20, done: false },
  { day: 'Fri', task: 'Board mock', subject: 'Social Science', minutes: 45, done: false },
];
