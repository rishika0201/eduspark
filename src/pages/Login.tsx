import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, Mail, Lock, ChevronRight, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStudent, type StudentInfo } from '../contexts/StudentContext';
import { parseResponseJson } from '../utils/helpers';
import { syllabusData } from '../data/syllabus';
import { findLocalLogin, upsertLocalAccount } from '../services/localAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStudent();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    board: 'CBSE' as 'CBSE' | 'State Board'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestGrade, setGuestGrade] = useState('Class 10');
  const [guestBoard, setGuestBoard] = useState('CBSE' as 'CBSE' | 'State Board');

  const gradeOptions = useMemo(() => Object.keys(syllabusData['CBSE'] || {}), []);
  const boards = ['CBSE', 'State Board'] as const;

  const tryRemoteLogin = async (force?: boolean): Promise<boolean> => {
    let response: Response;
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...(force ? { forceLogin: true } : {}) })
      });
    } catch {
      return false;
    }
    const data = await parseResponseJson<{ message?: string; user?: StudentInfo; token?: string }>(response);
    if (!response.ok || !data?.user) return false;
    if (data.token) localStorage.setItem('token', data.token);
    
    // Ensure board is set if not provided by server
    const userWithBoard = { ...data.user, board: formData.board || data.user.board || 'CBSE' };
    
    upsertLocalAccount(formData.password, userWithBoard);
    login(userWithBoard);
    navigate('/app');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (await tryRemoteLogin(false)) return;
      const localUser = findLocalLogin(formData.email, formData.password);
      if (localUser) {
        // Update board if it was changed
        const userWithBoard = { ...localUser, board: formData.board };
        login(userWithBoard);
        navigate('/app');
        return;
      }
      setError(t('Login failed'));
    } finally {
      setLoading(false);
    }
  };


  const confirmGuest = () => {
    const subs = Object.keys(syllabusData[guestBoard]?.[guestGrade] || syllabusData['CBSE']?.['Class 10'] || {});
    const interests = subs.length >= 2 ? subs.slice(0, 4) : ['Mathematics', 'Science', 'English'];
    login({
      name: t('Guest learner'),
      email: 'guest@eduspark.com',
      grade: guestGrade,
      board: guestBoard,
      interests,
    });
    navigate('/app');
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
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">{t('Portal login title')}</h2>
            <p className="text-white/40 font-medium text-lg">{t('Enter your credentials to access your portal.')}</p>
          </div>

          {error && <p className="text-red-500 mb-6 font-medium">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={t('Full Name (For first-time login)')}
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

              {/* Board Selection */}
              <div className="grid grid-cols-2 gap-4">
                {boards.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormData({ ...formData, board: b })}
                    className={clsx(
                      "py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all border",
                      formData.board === b 
                        ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(87,120,143,0.3)]" 
                        : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-6 rounded-full font-black text-xl flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(87,120,143,0.35)] transition-all mt-12 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? t('Authenticating...') : t('Access Portal')}
              <ChevronRight className="w-6 h-6" />
            </motion.button>


            {!guestOpen ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setGuestOpen(true)}
                  className="w-full bg-white/5 text-primary py-5 rounded-full font-bold text-lg flex items-center justify-center gap-4 border border-primary/30 mt-4 hover:bg-primary/10 transition-all shadow-[0_0_30px_rgba(87,120,143,0.1)]"
                >
                  {t('Enter as Guest')}
                </motion.button>
            ) : (
              <div className="mt-6 space-y-4 rounded-[2rem] border border-white/10 bg-black/30 p-6">

                <div className="grid grid-cols-2 gap-3">
                  {boards.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setGuestBoard(b)}
                      className={clsx(
                        "py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                        guestBoard === b 
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(87,120,143,0.3)]" 
                          : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/50 font-black text-center uppercase tracking-[0.2em] text-xs">
                  Class 10 • {guestBoard}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={confirmGuest}
                    className="flex-1 bg-primary text-black py-4 rounded-full font-black text-sm hover:bg-white transition-colors"
                  >
                    {t('Continue as guest')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestOpen(false)}
                    className="px-6 py-4 rounded-full border border-white/15 text-white/70 text-sm font-bold hover:bg-white/5"
                  >
                    {t('Back')}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-12 text-center text-white/40">
            {t("Don't have an account?")} <Link to="/signup" className="text-primary hover:underline">{t('Sign up here')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
