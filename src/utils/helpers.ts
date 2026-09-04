/**
 * Utility functions for EDU SPARK
 */

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const getGradeColor = (grade: number): string => {
  if (grade >= 90) return 'text-green-400';
  if (grade >= 80) return 'text-pink-400';
  if (grade >= 70) return 'text-yellow-400';
  if (grade >= 60) return 'text-yellow-600';
  return 'text-red-400';
};

export const getGradeBg = (grade: number): string => {
  if (grade >= 90) return 'bg-green-500/20';
  if (grade >= 80) return 'bg-pink-500/20';
  if (grade >= 70) return 'bg-yellow-500/20';
  if (grade >= 60) return 'bg-yellow-600/20';
  return 'bg-red-500/20';
};

export const generateStudyPlan = (topic: string, daysAvailable: number): string[] => {
  const subTopics = [
    `Introduction to ${topic}`,
    `Core Concepts of ${topic}`,
    `Advanced Applications`,
    `Practice Problems`,
    `Review and Mastery`
  ];
  
  return subTopics.slice(0, Math.min(daysAvailable, subTopics.length));
};

export interface StudyPlanTask {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
}

export const cleanAIOutput = (value: string): string => {
  return value
    .replace(/^```(?:markdown|md|json)?/gim, '')
    .replace(/```$/gim, '')
    .replace(/[â][^\s]*/g, '')
    .replace(/[^\S\r\n]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[-*]\s*(#{1,6}\s*)?/gm, '- ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/#{1,6}\s?/g, '')
    .trim();
};

export const suggestPersonalizedStudyPlan = (
  subjects: string[],
  averageScore: number,
  daysAvailable: number
): StudyPlanTask[] => {
  const safeSubjects = subjects.length ? subjects : ['Mathematics', 'Science'];
  const focusMinutes = averageScore < 60 ? 70 : averageScore < 80 ? 55 : 40;
  const templates = ['Concept review', 'Solved examples', 'Timed practice', 'Mistake notebook', 'Quick revision'];

  return Array.from({ length: Math.max(1, daysAvailable) }, (_, index) => {
    const subject = safeSubjects[index % safeSubjects.length];
    return {
      id: `suggested-${Date.now()}-${index}`,
      title: `${templates[index % templates.length]}: ${subject}`,
      subject,
      minutes: focusMinutes,
      done: false,
    };
  });
};

export const calculateStreak = (lastActiveDate: Date): number => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastDate = new Date(lastActiveDate);
  
  if (lastDate.toDateString() === today.toDateString()) {
    return 1; // Active today
  }
  
  if (lastDate.toDateString() === yesterday.toDateString()) {
    return 1; // Last active yesterday
  }
  
  return 0; // Streak broken
};

export const getMotivationalQuote = (): string => {
  const quotes = [
    "Success is not final, failure is not fatal. Keep learning! 🎯",
    "Every expert was once a beginner. Keep pushing! 💪",
    "Your future self will thank you for learning today. 📚",
    "Small progress is still progress. Keep going! ⭐",
    "You are capable of amazing things. Believe in yourself! 🚀"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const groupBy = <T,>(array: T[], key: (item: T) => string): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    const groupKey = key(item);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const localStorage_safe = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn(`Failed to set localStorage item: ${key}`);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`Failed to remove localStorage item: ${key}`);
    }
  }
};

/** Parse fetch JSON body; returns null for empty body or invalid JSON (avoids response.json() throwing). */
export async function parseResponseJson<T = Record<string, unknown>>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
