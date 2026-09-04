import { BarChart2, TrendingUp, Target, Award, Brain, Zap, Clock, Calendar, ChevronRight, Star, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { useStudent } from '../contexts/StudentContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Analytics() {
  const { performance } = useStudent();
  const { t } = useLanguage();

  const stats = [
    { label: t('Mastery Level'), value: `${performance.averageScore || 0}%`, icon: Target, color: 'text-primary' },
    { label: t('Study Streak'), value: `${performance.streak || 0} ${t('Days')}`, icon: Flame, color: 'text-primary' },
    { label: t('Total XP'), value: ((performance.topicsCompleted || 0) * 1000 + (performance.testsAttempted || 0) * 500).toLocaleString(), icon: Zap, color: 'text-primary' },
    { label: t('Time Spent'), value: `${Math.round((performance.totalLearningMinutes || 0) / 60)}h`, icon: Clock, color: 'text-primary' },
  ];

  const subjects = [
    { name: t('Mathematics'), progress: performance.averageScore || 0, color: 'bg-primary' },
    { name: t('Science'), progress: Math.max(0, (performance.averageScore || 0) - 10), color: 'bg-primary' },
    { name: t('Social Science'), progress: Math.min(100, (performance.averageScore || 0) + 5), color: 'bg-primary' },
    { name: t('English'), progress: Math.max(0, (performance.averageScore || 0) - 5), color: 'bg-primary' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-10 min-h-screen text-white/80">
      <ScrollReveal direction="up" delay={0.1} className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <TrendingUp className="w-8 h-8 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('Intelligence Hub')}</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter">{t('Your Progress.')}</h2>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="font-black text-white uppercase tracking-widest text-sm">{t('Academic Year 2025-26')}</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <ScrollReveal key={idx} direction="up" delay={0.1 * idx}>
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-primary/40" />
              </div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-2 relative z-10">{stat.label}</p>
              <p className="text-4xl font-black text-white tracking-tighter relative z-10">{stat.value}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Subject Mastery */}
        <ScrollReveal direction="up" delay={0.4} className="lg:col-span-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-2xl h-full">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                <Brain className="w-8 h-8 text-primary" />
                {t('Subject Mastery')}
              </h3>
              <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">{t('Full Report')}</button>
            </div>

            <div className="space-y-10">
              {subjects.map((subject, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black text-white tracking-tight">{subject.name}</span>
                    <span className="text-sm font-black text-primary">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-4 p-1 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className={`${subject.color} h-full rounded-full shadow-[0_0_15px_#4ADE80]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Achievements */}
        <ScrollReveal direction="right" delay={0.5} className="lg:col-span-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-2xl h-full">
            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
              <Award className="w-7 h-7 text-primary" />
              {t('Achievements')}
            </h3>
            
            <div className="space-y-6">
              {[
                { title: t('Math Maven'), desc: t('Solved 50 Algebra problems'), xp: '+250', icon: Star },
                { title: t('Science Sage'), desc: t('Perfect score in Physics'), xp: '+400', icon: Sparkles },
                { title: t('Social Scholar'), desc: t('Completed History Quiz'), xp: '+150', icon: Target },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="flex items-center justify-between p-6 rounded-3xl border border-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-white tracking-tight uppercase text-xs">{item.title}</p>
                      <p className="text-white/70 text-[10px] font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary">{item.xp} XP</span>
                </motion.div>
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-10 p-5 bg-white/5 rounded-[2rem] border border-white/10 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              {t('View Hall of Fame')}
              <ChevronRight className="w-5 h-5 text-primary" />
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
