import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LineChart, FileText, Search, Bell, LogOut, LibraryBig, MessagesSquare, Gamepad2, Moon, Sun, Layers, Globe, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';
import { useStudent } from '../contexts/StudentContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentInfo, logout } = useStudent();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const navItems = [
    { name: t('Dashboard'), path: '/app', icon: LayoutDashboard },
    { name: t('Study Plans'), path: '/app/study-plans', icon: FileText },
    { name: t('Subjects'), path: '/app/courses', icon: LibraryBig },
    { name: t('Flashcards'), path: '/app/flashcards', icon: Layers },
    { name: t('Gamify'), path: '/app/gamified-learning', icon: Gamepad2 },
    { name: t('Paper Gen'), path: '/app/paper-gen', icon: GraduationCap },
  ];

  return (
    <div className="bg-black text-white/80 min-h-screen flex flex-col font-sans selection:bg-primary/30">
      
      {/* TopNavBar */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="flex justify-between items-center px-4 md:px-6 py-3 w-full sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10 shadow-2xl gap-4"
      >
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">EDU SPARK</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item, idx) => {
              const isActive = item.path === '/app' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all relative group",
                    isActive 
                      ? "text-primary font-black" 
                      : "text-white/40 hover:text-white hover:bg-white/5 font-bold"
                  )}
                >
                  <item.icon className={clsx("w-4 h-4 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                  <span className="text-xs uppercase tracking-widest">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 border border-primary/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden md:flex items-center relative mr-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5" />
             <input className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-[10px] outline-none focus:border-primary/50 w-48 transition-all" placeholder={t('Search resources...')} />
          </div>

          {/* Language Selector */}
          <div className="relative group/lang">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/60 hover:bg-white/10 transition-all uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5 text-primary" />
              {language}
            </button>
            <div className="absolute top-full right-0 pt-2 hidden group-hover/lang:block z-50">
              <div className="bg-black border border-white/10 rounded-xl p-1 w-24 overflow-hidden">
                {['EN', 'HI', 'TA', 'ES'].map((l: any) => (
                  <button 
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={clsx(
                      "w-full text-left px-3 py-2 text-[10px] font-black rounded-lg transition-colors",
                      language === l ? "bg-primary text-black" : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    {l === 'EN' ? 'English' : l === 'HI' ? 'Hindi' : l === 'TA' ? 'Tamil' : 'Spanish'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button 
            onClick={toggleTheme}
            className="p-2.5 text-white/60 hover:bg-white/10 rounded-full transition-colors border border-white/5"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10 group relative">
            <div className="text-right">
              <p className="text-xs font-black text-white uppercase tracking-tighter">{studentInfo?.name || 'Student'}</p>
              <p className="text-[8px] text-primary/60 uppercase font-black tracking-[0.2em]">{studentInfo?.grade || 'Class 10'}</p>
            </div>
            <motion.img 
              alt="Student" 
              className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover cursor-pointer" 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${studentInfo?.name || 'alex'}`} 
            />
            <div className="absolute top-full right-0 pt-4 hidden group-hover:block z-50">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black border border-white/10 rounded-2xl shadow-2xl p-2 w-48"
              >
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 font-bold hover:bg-red-400/10 rounded-xl transition-colors w-full text-left">
                  <LogOut className="w-4 h-4" />
                  {t('Logout')}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BottomNavBar (Mobile) */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] z-40 flex justify-around items-center px-1 py-3 xl:hidden bg-black/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        {navItems.slice(0, 6).map((item) => {
           const isActive = item.path === '/app' ? location.pathname === item.path : location.pathname.startsWith(item.path);
           return (
             <Link
               key={item.name}
               to={item.path}
               className={clsx(
                 "flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all relative",
                 isActive ? "text-primary" : "text-white/40"
               )}
             >
               {isActive && (
                 <motion.div 
                   layoutId="mobile-nav-pill"
                   className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                 />
               )}
               <item.icon className={clsx("w-5 h-5 mb-1", isActive && "animate-pulse")} />
               <span className="text-[7px] font-black uppercase tracking-tighter truncate max-w-[50px]">{item.name}</span>
             </Link>
           );
        })}
      </motion.nav>
    </div>
  );
}
