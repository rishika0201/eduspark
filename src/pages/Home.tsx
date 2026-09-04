import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Sun, 
  Moon, 
  X, 
  Menu, 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  PlayCircle, 
  Sparkles, 
  ShieldCheck, 
  MessagesSquare, 
  BarChart3, 
  Trophy, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { courseCatalog } from '../data/learningContent';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const featuredCourses = courseCatalog.slice(0, 4);
  const navLinks = [
    { name: t('Courses'), href: '#courses' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30 overflow-hidden">
      <section className="relative min-h-[92vh] flex flex-col border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-45">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.70)_48%,rgba(0,0,0,0.35)_100%)]" />
        </div>

        <nav className="relative z-20 px-5 lg:px-10 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-black flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-black text-xl tracking-tight">EDU SPARK</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors">
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Link to="/teacher-login" className="hidden md:inline px-4 py-3 rounded-2xl border border-primary/30 text-primary font-black text-sm hover:bg-primary/10 transition-all">
                {t('Teachers portal')}
              </Link>
              <button onClick={toggleTheme} className="p-3 rounded-2xl bg-white/5 border border-white/10 font-black hover:bg-white/10 transition-all" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 font-black hover:bg-white/10 transition-all">
                {t('Log in')}
              </Link>
              <Link to="/signup" className="px-5 py-3 rounded-2xl bg-primary text-black font-black hover:bg-white transition-all">
                {t('Start free')}
              </Link>
            </div>

            <button className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10" onClick={() => setIsMenuOpen((value) => !value)} aria-label="Toggle navigation">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="fixed inset-x-4 top-20 z-40 rounded-3xl border border-white/10 bg-black/95 p-5 lg:hidden">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-2xl text-white/75 hover:bg-white/5">
                    {link.name}
                  </a>
                ))}
                <Link to="/signup" className="mt-2 px-4 py-3 rounded-2xl bg-primary text-black font-black text-center">{t('Start free')}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 flex-1 max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-[1fr_440px] gap-10 items-center w-full py-10">
          <div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs uppercase tracking-[0.25em] font-black mb-7">
              <GraduationCap className="w-4 h-4" />
              {t('Classes 6-12 - CBSE, ICSE, State Boards')}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.94] max-w-5xl">
              EDU SPARK
              <span className="block text-primary">{t('Learn like toppers revise.')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="text-lg md:text-xl text-white/60 max-w-2xl mt-7 leading-8">
              {t('Animated lessons, instant doubt solving, adaptive practice, analytics, rewards, and exam paper generation in one student app.')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link to="/signup" className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-pink-500 text-black px-7 py-4 rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(22,163,74,0.35)] transition-all transform hover:-translate-y-1">
                {t('Build my plan')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#courses" className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-7 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-all transform hover:-translate-y-1">
                {t('View courses')}
                <BookOpen className="w-5 h-5 text-pink-400" />
              </a>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }} className="hidden lg:block bg-black/45 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <p className="text-xs text-primary uppercase tracking-[0.25em] font-black">{t('Today')}</p>
                <h2 className="text-2xl font-black">{t('Class 10 board plan')}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary text-black flex items-center justify-center font-black">84</div>
            </div>
            <div className="space-y-3">
              {[
                [t('Quadratic Equations'), t('35 min concept video'), PlayCircle],
                [t('Light Reflection'), t('18 adaptive questions'), Sparkles],
                [t('History Map Work'), t('Interactive drill session'), ShieldCheck],
              ].map(([title, meta, Icon]) => {
                const RowIcon = Icon as typeof PlayCircle;
                return (
                  <div key={title as string} className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <RowIcon className="w-6 h-6 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-black truncate">{title as string}</p>
                      <p className="text-sm text-white/45">{meta as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </section>

      <section id="courses" className="max-w-7xl mx-auto px-5 lg:px-10 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.25em] font-black">{t('Course Library')}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">{t('Structured like coaching, personal like a tutor.')}</h2>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 text-primary font-black">
            {t('Start learning')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {featuredCourses.map((course) => (
            <motion.article 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -5, scale: 1.02 }}
              key={course.id} 
              className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-primary/50 transition-colors shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-md" style={{ backgroundColor: `${course.color}22`, color: course.color }}>
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">{t(course.title)}</h3>
              <p className="text-white/45 text-sm mt-2">{course.lessons} {t('lessons')} - {course.tests} {t('tests')} - {t(course.mentor)}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${course.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full rounded-full" 
                  style={{ backgroundColor: course.color }} 
                />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section id="features" className="border-y border-white/10 bg-white/[0.03]">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="max-w-7xl mx-auto px-5 lg:px-10 py-16 grid lg:grid-cols-3 gap-5"
        >
          {[
            [MessagesSquare, t('Doubt solving'), t('AI explanations with mentor review.'), 'from-green-400 to-pink-400'],
            [BarChart3, t('Performance analytics'), t('Weak-topic heatmaps and exam readiness.'), 'from-yellow-400 to-red-500'],
            [Trophy, t('Rewards'), t('Streaks, badges, XP, and weekly challenges.'), 'from-pink-500 to-red-500'],
          ].map(([Icon, title, copy, gradient]) => {
            const FeatureIcon = Icon as typeof MessagesSquare;
            return (
              <motion.div 
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                whileHover={{ scale: 1.05 }}
                key={title as string} 
                className="bg-black/35 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient as string} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <FeatureIcon className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black text-white relative z-10">{title as string}</h3>
                <p className="text-white/50 mt-3 relative z-10">{copy as string}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section id="results" className="max-w-7xl mx-auto px-5 lg:px-10 py-16">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.25em] font-black">{t('Exam Ready')}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2">{t('From concept clarity to board-paper confidence.')}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ['94%', t('Average chapter completion')],
              ['3x', t('More practice after doubts')],
              ['24/7', t('AI study support')],
            ].map(([value, label]) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <p className="text-4xl font-black text-white">{value}</p>
                <p className="text-white/45 mt-3">{label}</p>
                <CheckCircle2 className="w-6 h-6 text-primary mt-6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
