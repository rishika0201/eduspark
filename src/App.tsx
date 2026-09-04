/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import type { ReactNode } from 'react';
import Layout from './components/Layout';
import { StudentProvider, useStudent } from './contexts/StudentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NotificationCenter from './components/NotificationCenter';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading pages with automatic retry on chunk load failure (e.g. network changes)
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Chunk load failed, attempting page reload...', error);
      const hasReloaded = sessionStorage.getItem('chunk_reload_attempted');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
        return new Promise(() => {}) as any;
      }
      throw error;
    }
  });
}

// Lazy loading pages for performance optimization
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Practice = lazyWithRetry(() => import('./pages/Practice'));
const Analytics = lazyWithRetry(() => import('./pages/Analytics'));
const PaperGen = lazyWithRetry(() => import('./pages/PaperGen'));
const Flashcards = lazyWithRetry(() => import('./pages/Flashcards'));
const GamifiedLearning = lazyWithRetry(() => import('./pages/GamifiedLearning'));
const Courses = lazyWithRetry(() => import('./pages/Courses'));
const Doubts = lazyWithRetry(() => import('./pages/Doubts'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Signup = lazyWithRetry(() => import('./pages/Signup'));
const Home = lazyWithRetry(() => import('./pages/Home'));
const StudyPlansPage = lazyWithRetry(() => import('./pages/StudyPlansPage'));
const TeacherLogin = lazyWithRetry(() => import('./pages/TeacherLogin'));
const TeacherDashboard = lazyWithRetry(() => import('./pages/TeacherDashboard'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { studentInfo } = useStudent();
  if (!studentInfo) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
  </div>
);

import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <StudentProvider>
          <ThemeProvider>
            <NotificationProvider>
            <BrowserRouter>
              <NotificationCenter />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/teacher-login" element={<TeacherLogin />} />
                  <Route path="/teacher" element={<TeacherDashboard />} />
                  <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="practice" element={<Practice />} />
                    <Route path="practice/:subjectId/:chapterId" element={<Practice />} />
                    <Route path="flashcards" element={<Flashcards />} />
                    <Route path="doubts" element={<Doubts />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="paper-gen" element={<PaperGen />} />
                    <Route path="gamified-learning" element={<GamifiedLearning />} />
                    <Route path="study-plans" element={<StudyPlansPage />} />
                  </Route>
                  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </ThemeProvider>
      </StudentProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
