import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronRight, Flame, GraduationCap, Sparkles, Target, Trophy, X, Zap } from 'lucide-react';
import { useStudent } from '../contexts/StudentContext';
import { syllabusData, Unit } from '../data/syllabus';
import { courseCatalog } from '../data/learningContent';
import { generateLessonContent } from '../services/ai';

import { cleanAIOutput } from '../utils/helpers';

import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { studentInfo, setActiveTopic, performance } = useStudent();
  const { t } = useLanguage();
  const [selectedSyllabus, setSelectedSyllabus] = useState<{ subject: string; units: Unit[] } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState('');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const name = studentInfo?.name || 'Student';
  const grade = studentInfo?.grade || 'Class 10';
  const board = studentInfo?.board || 'CBSE';
  const interests = studentInfo?.interests?.length ? studentInfo.interests : ['Mathematics', 'Science'];

  const syllabusForGrade = useMemo(() => {
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    return boardData[grade] || boardData['Class 10'];
  }, [board, grade]);

  const recommendedCourses = useMemo(() => {
    const matching = Object.keys(syllabusForGrade).filter(s => interests.includes(s)).slice(0, 3);
    const subjectsToShow = matching.length ? matching : Object.keys(syllabusForGrade).slice(0, 3);
    
    return subjectsToShow.map(s => ({
      id: s,
      title: s,
      subject: s,
      level: 'FOUNDATION',
      progress: Math.floor(Math.random() * 100),
      lessons: syllabusForGrade[s]?.units.length * 5,
      nextClass: 'Ready for Next Chapter',
      color: '#4ADE80'
    }));
  }, [interests, syllabusForGrade]);

  const openSubject = (subjectName: string) => {
    const cleanSubject = subjectName.replace(/ - .*/, '').trim();
    const keys = Object.keys(syllabusForGrade || {});
    
    // Exact match (case-insensitive) first to prevent "Social Science" matching "Science"
    let subjectKey = keys.find((key) => key.toLowerCase() === cleanSubject.toLowerCase());
    if (!subjectKey) {
      subjectKey = keys.find((key) => key.toLowerCase().includes(cleanSubject.toLowerCase()) || cleanSubject.toLowerCase().includes(key.toLowerCase()));
    }

    const subjectData = subjectKey ? syllabusForGrade[subjectKey] : null;

    setSelectedSyllabus({
      subject: subjectKey || cleanSubject,
      units: subjectData?.units || [
        { name: 'Getting Started', topics: [`Introduction to ${cleanSubject}`, 'Important concepts', 'Practice checklist'] },
      ],
    });
  };

  const openLesson = async (topic: string) => {
    if (!selectedSyllabus) return;
    setSelectedTopic(topic);
    setActiveTopic(topic, selectedSyllabus.subject);
    
    // Find video URL from syllabus
    const unit = selectedSyllabus.units.find(u => u.topics.some(t => (typeof t === 'string' ? t : t.name) === topic));
    const topicObj = unit?.topics.find(t => (typeof t === 'string' ? t : t.name) === topic);
    setCurrentVideoUrl(typeof topicObj === 'object' ? topicObj.videoUrl || null : null);

    setIsLoadingLesson(true);
    setLessonContent('');
    const content = await generateLessonContent(topic, selectedSyllabus.subject, board);
    setLessonContent(cleanAIOutput(content));
    setIsLoadingLesson(false);
  };

  const closeLesson = () => {
    setSelectedTopic(null);
    setLessonContent('');
  };

  return (
    <div className="min-h-screen w-full pb-28 xl:pb-12">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(74,222,128,0.18),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(251,113,133,0.13),transparent_30%)]">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 lg:py-14">
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-center">
            <div>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-primary text-xs uppercase tracking-[0.3em] font-black mb-4">
                {grade} - {board} {t('personalized plan')}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white max-w-4xl">
                {t('Welcome back,')} {name}. {t('Your next best lesson is ready.')}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/80 text-lg mt-5 max-w-2xl">
                {t('Continue your adaptive learning path, clear doubts in the mentor chat, and move from concepts to exam-ready practice.')}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link to="/app/courses" className="inline-flex items-center justify-center gap-2 bg-primary text-black rounded-2xl px-6 py-4 font-black hover:bg-white transition-all">
                  {t('Explore courses')}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/app/practice" className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 font-black hover:bg-white/10 transition-all">
                  {t('Start practice')}
                  <Zap className="w-5 h-5 text-primary" />
                </Link>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-white/70 text-sm">{t('Today\'s momentum')}</p>
                  <h2 className="text-3xl font-black text-white">{t('Learning score')}</h2>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-primary text-black flex items-center justify-center font-black text-2xl">
                  {performance.averageScore || 0}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  [Flame, performance.streak || 12, t('Streak')],
                  [BookOpen, performance.topicsCompleted || 18, t('Topics')],
                  [Target, `${performance.averageScore || 76}%`, t('Accuracy')],
                ].map(([Icon, value, label]) => {
                  const StatIcon = Icon as typeof Flame;
                  return (
                    <div key={label as string} className="bg-black/30 rounded-2xl p-4 border border-white/5">
                      <StatIcon className="w-5 h-5 text-primary mb-3" />
                      <p className="text-xl font-black text-white">{value as string | number}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mt-1">{label as string}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 lg:px-10 py-10 space-y-10">
        <div className="grid lg:grid-cols-1 gap-6">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-primary text-xs uppercase tracking-[0.2em] font-black">{t('My Courses')}</p>
                <h2 className="text-3xl font-black text-white tracking-tight mt-1">{t('Continue learning')}</h2>
              </div>
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendedCourses.map((course, index) => (
                <motion.button
                  key={course.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => openSubject(course.subject)}
                  className="text-left bg-black/30 border border-white/10 rounded-3xl p-5 hover:border-primary/35 transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/70">{course.level}</span>
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4">{course.title}</h3>
                  <p className="text-white/70 text-sm mt-2">{course.nextClass}</p>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-6">
                    <div className="h-full rounded-full" style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
                  </div>
                  <p className="text-xs text-white/70 mt-2">{course.progress}% complete - {course.lessons} lessons</p>
                </motion.button>
              ))}
            </div>
          </section>


        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          <section className="bg-primary text-black rounded-3xl p-10 overflow-hidden relative min-h-[300px] flex flex-col justify-center">
            <div className="max-w-2xl">
              <Trophy className="w-16 h-16 mb-8" />
              <h2 className="text-4xl font-black tracking-tight">{t('Weekly challenge')}</h2>
              <p className="mt-4 text-black/85 text-lg font-medium">{t('Complete 3 topic drills and one mock test to unlock the Board Sprint badge.')}</p>
              <div className="h-4 bg-black/10 rounded-full overflow-hidden mt-10">
                <div className="h-full w-[72%] bg-black rounded-full" />
              </div>
              <Link to="/app/gamified-learning" className="inline-flex items-center gap-2 mt-8 font-black text-lg">
                {t('View rewards')}
                <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
          </section>
        </div>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-primary text-xs uppercase tracking-[0.2em] font-black">{t('Quick Syllabus')}</p>
              <h2 className="text-3xl font-black text-white tracking-tight mt-1">{t('Pick a subject to learn now')}</h2>
            </div>
            <Link to="/app/courses" className="text-primary font-black inline-flex items-center gap-2">
              {t('Full learning hub')}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interests.map((subject) => (
              <button key={subject} onClick={() => openSubject(subject)} className="bg-black/30 border border-white/10 rounded-3xl p-5 text-left hover:border-primary/35 transition-all group">
                <BookOpen className="w-7 h-7 text-primary mb-5" />
                <h3 className="text-xl font-black text-white">{subject}</h3>
                <p className="text-white/70 text-sm mt-2">Chapters, AI lesson notes, and practice handoff.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-primary font-black text-sm group-hover:gap-3 transition-all">
                  Open chapters
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedSyllabus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSyllabus(null)} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }} className="relative w-full max-w-3xl max-h-[86vh] overflow-hidden bg-black border border-white/10 rounded-3xl shadow-2xl flex flex-col">
              <div className="p-6 md:p-8 border-b border-white/10 bg-white/5 flex items-start justify-between gap-5">
                <div>
                  <p className="text-primary text-xs uppercase tracking-[0.25em] font-black mb-2">Course chapters</p>
                  <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{selectedSyllabus.subject}</h3>
                </div>
                <button onClick={() => setSelectedSyllabus(null)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {selectedSyllabus.units.map((unit, unitIndex) => (
                  <div key={unit.name} className="bg-white/5 border border-white/10 rounded-3xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="w-10 h-10 bg-primary text-black rounded-2xl flex items-center justify-center font-black">{unitIndex + 1}</span>
                      <h4 className="text-xl font-black text-white">{unit.name}</h4>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {unit.topics.map((topic) => {
                        const topicName = typeof topic === 'string' ? topic : topic.name;
                        return (
                          <button key={topicName} onClick={() => openLesson(topicName)} className="flex items-center justify-between gap-4 text-left bg-black/30 border border-white/5 rounded-2xl p-4 hover:border-primary/35 transition-all group">
                            <span className="font-bold text-white/70 group-hover:text-white">{topicName}</span>
                            <Sparkles className="w-5 h-5 text-primary shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-[60] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeLesson} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 34, stiffness: 300 }} className="relative bg-black w-full max-w-3xl h-full shadow-2xl flex flex-col border-l border-white/10">
              <div className="p-5 md:p-7 border-b border-white/10 bg-white/5 flex items-center gap-5">
                <button onClick={closeLesson} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <p className="text-primary text-xs uppercase tracking-[0.25em] font-black mb-1">AI lesson</p>
                  <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">{selectedTopic}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                {isLoadingLesson ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-white/70 uppercase tracking-[0.3em] text-xs font-black">Creating lesson notes</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {currentVideoUrl && (
                      <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-black/50 shadow-2xl">
                        <iframe
                          src={currentVideoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Lesson Video"
                        />
                      </div>
                    )}
                    <div className="text-white/70 text-lg leading-8 space-y-6">
                      {lessonContent.split('\n\n').map((p, index) => {
                        const cleanP = p.replace(/^\d+\.\s*/, '');
                        const headers = ['WHAT IS IT?', 'HOW DOES IT WORK?', 'EXAMPLE', 'MEMORY TRICK'];
                        const headerIndex = headers.findIndex(h => cleanP.toUpperCase().startsWith(h));
                        const isMarkdownHeader = p.startsWith('#');
                        
                        if (headerIndex !== -1 || isMarkdownHeader) {
                          const headerText = isMarkdownHeader ? p.replace(/#/g, '').trim() : headers[headerIndex];
                          const contentText = isMarkdownHeader ? '' : cleanP.substring(headers[headerIndex].length).trim();
                          
                          return (
                            <div key={index} className="space-y-3">
                              <h2 className="text-3xl font-black text-primary pt-6 flex items-center gap-4 uppercase tracking-tight">
                                {headerIndex !== -1 && <span className="text-white/20 text-5xl">0{headerIndex + 1}</span>}
                                {headerText}
                              </h2>
                              {contentText && <p className="text-white/70 text-lg leading-relaxed">{contentText}</p>}
                            </div>
                          );
                        }
                        return <p key={index}>{p}</p>;
                      })}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                      <Target className="w-10 h-10 text-primary mx-auto mb-4" />
                      <h4 className="text-2xl font-black text-white">Ready to test this?</h4>
                      <p className="text-white/70 mt-2 mb-6">Practice uses this topic as context for adaptive questions.</p>
                      <Link to={`/app/practice/${encodeURIComponent(selectedSyllabus?.subject || 'Mathematics')}/${encodeURIComponent(selectedTopic)}`} state={{ topic: selectedTopic, subject: selectedSyllabus?.subject }} className="inline-flex items-center justify-center gap-2 bg-primary text-black rounded-2xl px-6 py-4 font-black hover:bg-white transition-all">
                        Start practice
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
