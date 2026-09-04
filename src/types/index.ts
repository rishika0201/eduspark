/**
 * Comprehensive TypeScript type definitions for EDU SPARK
 */

// ============= Student & Profile =============
export interface StudentProfile {
  id?: string;
  name: string;
  email?: string;
  grade: string;
  board: string;
  institution?: string;
  dob?: Date;
  joinedDate?: Date;
  interests: string[];
  preferences?: StudentPreferences;
}

export interface StudentPreferences {
  theme?: 'dark' | 'light';
  notifications?: boolean;
  language?: string;
  dailyGoal?: number; // minutes
}

// ============= Performance & Analytics =============
export interface PerformanceMetric {
  topicsCompleted: number;
  testsAttempted: number;
  averageScore: number;
  totalLearningMinutes: number;
  streak: number;
  lastActiveDate: Date;
}

export interface SubjectProgress {
  subject: string;
  topicsCompleted: number;
  totalTopics: number;
  averageScore: number;
  lastStudied?: Date;
}

export interface LearningSession {
  id: string;
  topicId: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  score?: number;
  completed: boolean;
}

// ============= Curriculum & Content =============
export interface Topic {
  name: string;
  subtopics?: string[];
  videoCount?: number;
  questionCount?: number;
  description?: string;
  videoUrl?: string;
}

export interface Unit {
  id?: string;
  name: string;
  topics: (string | Topic)[];
  description?: string;
  page?: string;
}

export interface SubjectSyllabus {
  units: Unit[];
  description?: string;
  totalTopics?: number;
}

export interface Syllabus {
  [subject: string]: SubjectSyllabus;
}

// ============= Quiz & Assessment =============
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
}

export interface QuizAttempt {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  duration: number;
  totalMarks: number;
  passingScore: number;
  createdDate: Date;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId?: string;
  score: number;
  totalMarks: number;
  attempts: QuizAttempt[];
  completedTime: number;
  startedAt: Date;
  completedAt: Date;
  isPassed: boolean;
}

// ============= Question Paper =============
export interface QuestionPaperConfig {
  board: string;
  subject: string;
  chapters: string[];
  totalMarks: number;
  duration?: number;
  difficulty?: 'easy' | 'mixed' | 'hard';
}

export interface QuestionPaperHeader {
  title: string;
  board: string;
  subject: string;
  date?: Date;
  duration?: number;
  totalMarks: number;
}

export interface QuestionPaperSection {
  id: string;
  title: string;
  marks: number;
  questions: string[];
  instructions?: string;
}

export interface QuestionPaper {
  id: string;
  header: QuestionPaperHeader;
  sections: QuestionPaperSection[];
  answer?: string; // Answer paper content
  createdDate: Date;
  modifiedDate?: Date;
}

// ============= Achievements & Gamification =============
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
  totalRequired?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: Date;
}

export interface Leaderboard {
  rank: number;
  studentName: string;
  points: number;
  topicsCompleted: number;
  averageScore: number;
}

// ============= Notifications =============
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  duration?: number;
}

// ============= API & Response =============
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============= Learning Content =============
export interface LessonContent {
  id: string;
  title: string;
  subject: string;
  topic: string;
  content: string; // Markdown
  videoUrl?: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources?: Resource[];
  relatedTopics?: string[];
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'pdf' | 'website';
  duration?: number;
}

// ============= Study Plan =============
export interface StudyPlanDay {
  day: number;
  topic: string;
  subtopics: string[];
  duration: number;
  resources: Resource[];
  quiz?: Quiz;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  topic: string;
  subject: string;
  duration: number; // days
  days: StudyPlanDay[];
  createdDate: Date;
  startDate: Date;
  targetCompletionDate: Date;
}

// ============= Feedback & Reviews =============
export interface ContentFeedback {
  id: string;
  contentId: string;
  rating: number; // 1-5
  feedback: string;
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  timestamp: Date;
}

export interface AnswerFeedback {
  id: string;
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  feedback: string;
  suggestions: string[];
}

// ============= Report & Analytics =============
export interface StudentReport {
  studentId: string;
  reportDate: Date;
  totalLearningTime: number;
  topicsCompleted: number;
  averageScore: number;
  strongSubjects: string[];
  weakSubjects: string[];
  recommendations: string[];
}

export interface AnalyticsData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  learningTime: number[];
  topicsCompleted: number[];
  averageScores: number[];
  dates: Date[];
}
