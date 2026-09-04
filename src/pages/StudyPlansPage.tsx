import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Flame, 
  Target, 
  Plus, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Sparkles, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollReveal from '../components/ScrollReveal';
import { generateStudyRecommendations } from '../services/ai';
import { clsx } from 'clsx';

export default function StudyPlansPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [recommendations, setRecommendations] = useState<any[]>([
    { title: t('Focus on Algebra'), content: t('Based on recent quizzes, allocating 20 extra minutes to Algebra will improve your overall math score.'), type: 'focus' },
    { title: t('Revise Physics Notes'), content: t('You have an upcoming assessment in 3 days. We recommend reviewing Chapter 2 tonight.'), type: 'revision' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateStudyRecommendations();
      setRecommendations(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, title: t('Complete Math Quiz'), subject: t('Mathematics'), duration: t('30 mins'), completed: true },
    { id: 2, title: t('Read Science Chapter 4'), subject: t('Science'), duration: t('45 mins'), completed: false },
    { id: 3, title: t('Practice Grammar Exercises'), subject: t('English'), duration: t('20 mins'), completed: false },
  ]);

  const [weeklyMilestones, setWeeklyMilestones] = useState([
    { id: 1, title: t('Master Algebra Basics'), progress: 80, target: t('Friday') },
    { id: 2, title: t('Complete Physics Lab'), progress: 40, target: t('Sunday') },
    { id: 3, title: t('Essay Submission'), progress: 100, target: t('Wednesday') },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const toggleGoal = (id: number) => {
    setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    
    if (activeTab === 'daily') {
      const newTask = {
        id: Date.now(),
        title: newTitle,
        subject: t('General'),
        duration: t('Custom'),
        completed: false
      };
      setDailyGoals(prev => [newTask, ...prev]);
    } else {
      const newMilestone = {
        id: Date.now(),
        title: newTitle,
        progress: 0,
        target: t('Next Week')
      };
      setWeeklyMilestones(prev => [newMilestone, ...prev]);
    }
    
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-screen pb-24 lg:pb-10">
      <ScrollReveal direction="up" delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('Your Journey')}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{t('Study Plans.')}</h1>
            <p className="text-white/60 mt-4 max-w-xl">{t('Organize your learning journey, set goals, and track your milestones to achieve academic excellence.')}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex flex-col items-center shadow-2xl">
              <Flame className="w-6 h-6 text-red-500 mb-1" />
              <span className="font-black text-white text-lg">7 {t('Day')}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{t('Streak')}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex flex-col items-center shadow-2xl">
              <Target className="w-6 h-6 text-primary mb-1" />
              <span className="font-black text-white text-lg">85%</span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{t('Completion')}</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Goals */}
        <div className="lg:col-span-8 space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white/5 p-2 rounded-2xl inline-flex gap-2 border border-white/10">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'daily' ? 'bg-primary text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {t('Daily Goals')}
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'weekly' ? 'bg-primary text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {t('Weekly Milestones')}
            </button>
          </div>

          {/* Goals List */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">
                {activeTab === 'daily' ? t("Today's Tasks") : t("This Week's Milestones")}
              </h2>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                {t('Add New')}
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-4 flex gap-3">
                      <input 
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder={t('Type your task here...')}
                        className="flex-1 bg-transparent border-none outline-none text-white font-bold placeholder:text-white/20"
                      />
                      <button 
                        onClick={addTask}
                        className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-black uppercase"
                      >
                        {t('Save')}
                      </button>
                      <button 
                        onClick={() => { setIsAdding(false); setNewTitle(''); }}
                        className="text-white/40 hover:text-white text-xs font-bold"
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'daily' ? (
                dailyGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-2xl p-5 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <button 
                        onClick={() => toggleGoal(goal.id)}
                        className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                          goal.completed ? 'bg-primary border-primary text-black' : 'border-white/20 text-transparent hover:border-primary/50'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg truncate ${goal.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                          {goal.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {goal.subject}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {goal.duration}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          goal.completed 
                            ? "bg-white/10 text-white/40" 
                            : "bg-primary/20 text-primary hover:bg-primary hover:text-black shadow-lg"
                        )}
                      >
                        {goal.completed ? t('Completed') : t('Mark Done')}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                weeklyMilestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{milestone.title}</h3>
                        <p className="text-sm text-white/50 mt-1">{t('Target')}: {milestone.target}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black">
                          {milestone.progress}%
                        </span>
                        {milestone.progress < 100 && (
                          <button
                            onClick={() => {
                              setWeeklyMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, progress: 100 } : m));
                            }}
                            className="text-[10px] font-black text-primary uppercase hover:underline"
                          >
                            {t('Complete')}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${milestone.progress}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${milestone.progress === 100 ? 'bg-primary' : 'bg-pink-500'}`}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-primary/20 to-pink-500/20 p-[1px] rounded-[2.5rem]">
            <div className="bg-black/80 backdrop-blur-2xl rounded-[2.5rem] p-8 h-full shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-black text-white">{t('AI Recommendations')}</h3>
              </div>
              
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {recommendations.map((rec, i) => (
                    <motion.div 
                      key={`${rec.title}-${i}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.1 }}
                      className={clsx(
                        "border-l-2 pl-4 transition-all",
                        rec.type === 'focus' ? 'border-primary' : 'border-pink-500'
                      )}
                    >
                      <h4 className="text-sm font-bold text-white mb-2">{rec.title}</h4>
                      <p className="text-xs text-white/70 leading-relaxed">{rec.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-8 w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-white py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('Generating...')}
                  </>
                ) : (
                  <>
                    {t('Generate Smart Plan')}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
