import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, User, Mail, Lock, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStudent, type StudentInfo } from '../contexts/StudentContext';
import { parseResponseJson } from '../utils/helpers';
import { syllabusData } from '../data/syllabus';
import { upsertLocalAccount } from '../services/localAuth';

function interestsForGrade(grade: string): string[] {
  const keys = Object.keys(syllabusData[grade] ?? syllabusData['Class 10']);
  return keys.length >= 2 ? keys.slice(0, 4) : ['Mathematics', 'Science', 'English', 'Social Science'];
}

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useStudent();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    grade: 'Class 10',
    board: 'CBSE' as 'CBSE' | 'State Board'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const boards = ['CBSE', 'State Board'] as const;

  const interestsForGrade = (grade: string, board: string): string[] => {
    const boardData = syllabusData[board as keyof typeof syllabusData] || syllabusData['CBSE'];
    const keys = Object.keys(boardData[grade as keyof typeof boardData] ?? boardData['Class 10']);
    return keys.length >= 2 ? keys.slice(0, 4) : ['Mathematics', 'Science', 'English', 'Social Science'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let response: Response | null = null;
    try {
      response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch {
      response = null;
    }

    const data = response
      ? await parseResponseJson<{ message?: string; user?: StudentInfo; token?: string }>(response)
      : null;

    if (response?.ok && data?.user) {
      if (data.token) localStorage.setItem('token', data.token);
      upsertLocalAccount(formData.password, { ...data.user, board: formData.board });
      login({ ...data.user, board: formData.board });
      navigate('/app');
      setLoading(false);
      return;
    }

    if (response && !response.ok && data?.message) {
      setError(data.message);
      setLoading(false);
      return;
    }

    const user: StudentInfo = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      grade: formData.grade,
      board: formData.board,
      interests: interestsForGrade(formData.grade, formData.board),
    };
    upsertLocalAccount(formData.password, user);
    login(user);
    navigate('/app');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="flex flex-col items-center mb-16">
          <Link to="/" className="flex items-center gap-4 mb-6 group">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transition-transform group-hover:rotate-12">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="font-black text-4xl tracking-tighter text-white">EDU SPARK</span>
          </Link>
          <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">{t('AI Learning Protocol')}</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl shadow-black/50"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">{t('Create Account.')}</h2>
            <p className="text-white/40 font-medium text-lg">{t('Join the future of AI-powered education.')}</p>
          </div>

          {error && <p className="text-red-500 mb-6 font-medium">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={t('Full Name')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-16 py-5 text-white outline-none focus:border-primary/50 transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder={t('Academic Email')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-16 py-5 text-white outline-none focus:border-primary/50 transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder={t('Secure Password')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-16 py-5 text-white outline-none focus:border-primary/50 transition-all font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {boards.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFormData({ ...formData, board: b })}
                  className={clsx(
                    "py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all border",
                    formData.board === b 
                      ? "bg-primary text-black border-primary" 
                      : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-white/60 font-black text-center uppercase tracking-widest text-xs">
              {formData.grade} • {formData.board} Syllabus
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black py-6 rounded-full font-black text-xl flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(87,120,143,0.24)] transition-all mt-8 hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? t('Initializing...') : t('Create Account')}
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </form>

          <p className="mt-8 text-center text-white/40">
            {t('Already have an account?')} <Link to="/login" className="text-primary hover:underline">{t('Login here')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
