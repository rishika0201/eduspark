import { localStorage_safe } from '../utils/helpers';

export const LS_TEACHER_SESSION = 'eduspark_teacher_session';
export const LS_STUDENT_REGISTRY = 'eduspark_student_registry';
export const LS_PAPER_SUBMISSIONS = 'eduspark_paper_submissions';
export const LS_GAMIFY_COINS = 'eduspark_gamify_coins';
export const LS_GAMIFY_LEVELS = 'eduspark_gamify_levels'; // JSON: { [key]: highestLevel }

export interface TeacherSession {
  email: string;
  name: string;
  board: string;
  loggedInAt: string;
}

export interface RegistryStudent {
  email: string;
  name: string;
  grade: string;
  board: string;
  lastSeen: string;
  performance?: {
    topicsCompleted: number;
    testsAttempted: number;
    averageScore: number;
  };
}

export interface PaperSubmission {
  id: string;
  studentEmail: string;
  studentName: string;
  grade: string;
  subject: string;
  board: string;
  totalMarks: number;
  durationMin: number;
  chapters: string[];
  questionsSnapshot: string[];
  studentAnswerText: string;
  attachmentNames: string[];
  status: 'pending' | 'graded';
  score?: number;
  maxScore?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export function getTeacherSession(): TeacherSession | null {
  const raw = localStorage_safe.getItem(LS_TEACHER_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TeacherSession;
  } catch {
    return null;
  }
}

export function setTeacherSession(session: TeacherSession | null) {
  if (!session) localStorage_safe.removeItem(LS_TEACHER_SESSION);
  else localStorage_safe.setItem(LS_TEACHER_SESSION, JSON.stringify(session));
}

export function registerStudent(s: RegistryStudent) {
  const raw = localStorage_safe.getItem(LS_STUDENT_REGISTRY);
  let list: RegistryStudent[] = [];
  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [];
    }
  }
  const idx = list.findIndex((x) => x.email.toLowerCase() === s.email.toLowerCase());
  if (idx >= 0) list[idx] = { ...list[idx], ...s };
  else list.push(s);
  localStorage_safe.setItem(LS_STUDENT_REGISTRY, JSON.stringify(list));
}

export function getStudentRegistry(): RegistryStudent[] {
  const raw = localStorage_safe.getItem(LS_STUDENT_REGISTRY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RegistryStudent[];
  } catch {
    return [];
  }
}

export function getPaperSubmissions(): PaperSubmission[] {
  const raw = localStorage_safe.getItem(LS_PAPER_SUBMISSIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PaperSubmission[];
  } catch {
    return [];
  }
}

export function savePaperSubmission(sub: PaperSubmission) {
  const all = getPaperSubmissions();
  all.unshift(sub);
  localStorage_safe.setItem(LS_PAPER_SUBMISSIONS, JSON.stringify(all));
}

export function updatePaperSubmission(id: string, patch: Partial<PaperSubmission>) {
  const all = getPaperSubmissions();
  const i = all.findIndex((x) => x.id === id);
  if (i < 0) return;
  all[i] = { ...all[i], ...patch };
  localStorage_safe.setItem(LS_PAPER_SUBMISSIONS, JSON.stringify(all));
}

export function getGamifyCoins(): number {
  const v = localStorage_safe.getItem(LS_GAMIFY_COINS);
  return v ? parseInt(v, 10) || 0 : 0;
}

export function addGamifyCoins(amount: number) {
  const next = getGamifyCoins() + amount;
  localStorage_safe.setItem(LS_GAMIFY_COINS, String(next));
  return next;
}

export function getGamifyHighestLevel(key: string): number {
  const raw = localStorage_safe.getItem(LS_GAMIFY_LEVELS);
  if (!raw) return 0;
  try {
    const o = JSON.parse(raw) as Record<string, number>;
    return o[key] || 0;
  } catch {
    return 0;
  }
}

export function setGamifyHighestLevel(key: string, level: number) {
  const raw = localStorage_safe.getItem(LS_GAMIFY_LEVELS);
  let o: Record<string, number> = {};
  if (raw) {
    try {
      o = JSON.parse(raw);
    } catch {
      o = {};
    }
  }
  o[key] = Math.max(o[key] || 0, level);
  localStorage_safe.setItem(LS_GAMIFY_LEVELS, JSON.stringify(o));
}

/** If this browser is logged in as the same student, merge graded paper into stored performance. */
export function patchLocalStudentPerformanceIfMatch(email: string, score: number, maxScore: number) {
  const raw = localStorage_safe.getItem('student_info');
  if (!raw) return;
  try {
    const info = JSON.parse(raw) as {
      email?: string;
      performance?: { testsAttempted?: number; averageScore?: number; topicsCompleted?: number; totalLearningMinutes?: number; streak?: number; lastActiveDate?: string };
    };
    if (!info.email || info.email.toLowerCase() !== email.toLowerCase()) return;
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const prevN = info.performance?.testsAttempted ?? 0;
    const prevAvg = info.performance?.averageScore ?? 0;
    const tests = prevN + 1;
    const averageScore = Math.round((prevAvg * prevN + pct) / tests);
    const next = {
      ...info,
      performance: {
        topicsCompleted: info.performance?.topicsCompleted ?? 0,
        totalLearningMinutes: info.performance?.totalLearningMinutes ?? 0,
        streak: info.performance?.streak ?? 0,
        ...info.performance,
        testsAttempted: tests,
        averageScore,
        lastActiveDate: new Date().toISOString(),
      },
    };
    localStorage_safe.setItem('student_info', JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
