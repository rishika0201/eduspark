import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { localStorage_safe } from '../utils/helpers';
import { registerStudent } from '../services/eduPortalStorage';

export interface PerformanceMetrics {
  topicsCompleted: number;
  testsAttempted: number;
  averageScore: number;
  totalLearningMinutes: number;
  streak: number;
  lastActiveDate: Date;
}

export interface StudentInfo {
  name: string;
  email: string;
  grade: string;
  board: string;
  dob?: string;
  institution?: string;
  interests: string[];
  joinedDate?: Date;
  performance?: PerformanceMetrics;
}

interface StudentContextType {
  studentInfo: StudentInfo | null;
  setStudentInfo: (info: StudentInfo) => void;
  login: (info: StudentInfo) => void;
  activeTopic: string | null;
  activeSubject: string | null;
  setActiveTopic: (topic: string, subject: string) => void;
  logout: () => void;
  performance: PerformanceMetrics;
  updatePerformance: (metrics: Partial<PerformanceMetrics>) => void;
  recordTopicCompletion: (topic: string) => void;
  recordTestAttempt: (score: number) => void;
  updateLearningTime: (minutes: number) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const defaultPerformance: PerformanceMetrics = {
  topicsCompleted: 0,
  testsAttempted: 0,
  averageScore: 0,
  totalLearningMinutes: 0,
  streak: 0,
  lastActiveDate: new Date()
};

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [activeTopic, setActiveTopicState] = useState<string | null>(null);
  const [activeSubject, setActiveSubjectState] = useState<string | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics>(defaultPerformance);

  useEffect(() => {
    const stored = localStorage_safe.getItem('student_info');
    if (stored) {
      try {
        const info = JSON.parse(stored);
        setStudentInfo(info);
        if (info.performance) setPerformance(info.performance);
      } catch (e) {
        console.error('Failed to load student info');
      }
    }
  }, []);

  useEffect(() => {
    if (!studentInfo?.email) return;
    registerStudent({
      email: studentInfo.email,
      name: studentInfo.name,
      grade: studentInfo.grade,
      board: studentInfo.board,
      lastSeen: new Date().toISOString(),
      performance: {
        topicsCompleted: performance.topicsCompleted,
        testsAttempted: performance.testsAttempted,
        averageScore: performance.averageScore,
      },
    });
  }, [studentInfo?.email, studentInfo?.name, studentInfo?.grade, studentInfo?.board, performance.topicsCompleted, performance.testsAttempted, performance.averageScore]);

  const syncPerformance = async (metrics: PerformanceMetrics) => {
    if (!studentInfo?.email) return;
    try {
      await fetch('/api/user/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: studentInfo.email, performance: metrics })
      });
    } catch (e) {
      console.warn('Sync failed, will retry later');
    }
  };

  const login = (info: StudentInfo) => {
    setStudentInfo(info);
    if (info.performance) setPerformance(info.performance);
    localStorage_safe.setItem('student_info', JSON.stringify(info));
  };

  const logout = () => {
    setStudentInfo(null);
    localStorage_safe.removeItem('student_info');
    localStorage_safe.removeItem('token');
  };

  const updatePerformance = (metrics: Partial<PerformanceMetrics>) => {
    const updated = { ...performance, ...metrics };
    setPerformance(updated);
    syncPerformance(updated);
    // Update local storage too
    if (studentInfo) {
      const updatedInfo = { ...studentInfo, performance: updated };
      setStudentInfo(updatedInfo);
      localStorage_safe.setItem('student_info', JSON.stringify(updatedInfo));
    }
  };

  const recordTopicCompletion = (topic: string) => {
    updatePerformance({ topicsCompleted: performance.topicsCompleted + 1, lastActiveDate: new Date() });
  };

  const recordTestAttempt = (score: number) => {
    const newTotal = performance.testsAttempted + 1;
    const newAverage = (performance.averageScore * performance.testsAttempted + score) / newTotal;
    updatePerformance({ testsAttempted: newTotal, averageScore: Math.round(newAverage), lastActiveDate: new Date() });
  };

  const updateLearningTime = (minutes: number) => {
    updatePerformance({ totalLearningMinutes: performance.totalLearningMinutes + minutes, lastActiveDate: new Date() });
  };

  return (
    <StudentContext.Provider value={{ 
      studentInfo, setStudentInfo, login, activeTopic, activeSubject, 
      setActiveTopic: (t, s) => { setActiveTopicState(t); setActiveSubjectState(s); }, 
      logout, performance, updatePerformance, recordTopicCompletion, recordTestAttempt, updateLearningTime 
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used within StudentProvider');
  return context;
}
