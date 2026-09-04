import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Zap, Moon, Sun } from 'lucide-react';
import { setTeacherSession } from '../services/eduPortalStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { clsx } from 'clsx';

export default function TeacherLogin() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [board, setBoard] = useState<'CBSE' | 'State Board'>('CBSE');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(t('Enter email and password.'));
      return;
    }
    setTeacherSession({
      name: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      board,
      loggedInAt: new Date().toISOString(),
    });
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 transition-colors duration-200">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-primary text-sm font-black">
        <Zap className="w-4 h-4" /> EDU SPARK
      </Link>
      <motion.button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white rounded-xl bg-white/5 border border-white/10"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-primary/15 text-primary">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">{t('Teachers')}</p>
            <h1 className="text-3xl font-black tracking-tight">{t('Teacher portal login')}</h1>
          </div>
        </div>
        <p className="text-white/45 text-sm mb-6">{t('Choose your syllabus board to view relevant student submissions.')}</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              type="button" 
              onClick={() => setBoard('CBSE')}
              className={clsx(
                "py-3 rounded-2xl border font-black text-xs transition-all",
                board === 'CBSE' ? "bg-primary border-primary text-black shadow-lg" : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
              )}
            >
              CBSE
            </button>
            <button 
              type="button" 
              onClick={() => setBoard('State Board')}
              className={clsx(
                "py-3 rounded-2xl border font-black text-xs transition-all",
                board === 'State Board' ? "bg-primary border-primary text-black shadow-lg" : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
              )}
            >
              STATE BOARD
            </button>
          </div>
          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Full Name')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/40" placeholder={t('Staff Name')} />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Academic Email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/40" />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Secure Password')}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary/40" />
          </div>
          {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
          <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 hover:bg-white transition-colors">
            {t('Enter portal')} <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-white/35 text-xs mt-6">
          <Link to="/login" className="text-primary font-bold">{t('Student login')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
