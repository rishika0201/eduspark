import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CalendarClock, ChevronRight, GraduationCap, LibraryBig, PlayCircle, Search, Sparkles, Star, Users, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useStudent } from '../contexts/StudentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { syllabusData } from '../data/syllabus';
import { generateLessonContent } from '../services/ai';
import { cleanAIOutput } from '../utils/helpers';

export default function Courses() {
  const { studentInfo, setActiveTopic } = useStudent();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState('');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const grade = studentInfo?.grade || 'Class 10';
  const board = studentInfo?.board || 'CBSE';
  
  const subjects = useMemo(() => {
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    const classData = boardData[grade] || boardData['Class 10'];
    return Object.keys(classData || {});
  }, [board, grade]);

  const filteredSubjects = subjects.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  const openLesson = async (topic: string, subject: string) => {
    setSelectedTopic(topic);
    setActiveTopic(topic, subject);
    
    // Find video URL from syllabus
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    const subjectData = boardData[grade]?.[subject] || boardData['Class 10']?.[subject];
    const unit = subjectData?.units.find((u: any) => u.topics.some((t: any) => (typeof t === 'string' ? t : t.name) === topic));
    const topicObj = unit?.topics.find((t: any) => (typeof t === 'string' ? t : t.name) === topic);
    setCurrentVideoUrl(typeof topicObj === 'object' ? topicObj.videoUrl || null : null);

    setIsLoadingLesson(true);
    setLessonContent('');
    try {
      const content = await generateLessonContent(topic, subject, board);
      setLessonContent(cleanAIOutput(content));
    } catch (e) {
      setLessonContent('## Error loading content. Please check your connection.');
    }
    setIsLoadingLesson(false);
  };

  return (
    <div className="min-h-screen w-full pb-28 xl:pb-12 text-white/80">
      
      {/* Header */}
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.1),transparent_34%)]">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 lg:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <LibraryBig className="w-4 h-4" />
                {t('Learning Hub')}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white max-w-4xl">
                {t('Subjects')} & {t('Chapters')}.
              </h1>
              <p className="text-white/40 text-lg mt-5 max-w-2xl">
                {t('Explore courses')} specifically designed for {grade} ({board}). Select a subject to dive into lessons and real-time practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
        
        <AnimatePresence mode="wait">
          {!selectedSubject ? (
            <motion.div key="subjects-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('Search resources...')}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 outline-none focus:border-primary/50 transition-all text-lg font-bold"
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((sub, index) => (
                  <motion.button
                    key={sub}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedSubject(sub)}
                    className="group bg-white/5 border border-white/10 p-8 rounded-[3rem] text-left hover:border-primary/40 transition-all hover:bg-white/10 relative"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black text-white">{sub}</h3>
                    <p className="text-white/40 font-bold mt-2 uppercase tracking-widest text-[10px]">{grade} • {board}</p>
                    <ChevronRight className="absolute bottom-10 right-10 w-8 h-8 text-white/10 group-hover:text-primary transition-all" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="chapters-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-2 text-white/40 hover:text-white font-black uppercase text-xs tracking-widest">
                <ArrowLeft className="w-4 h-4" /> {t('Back')} to {t('Subjects')}
              </button>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {(syllabusData[board] || syllabusData['CBSE'])[grade]?.[selectedSubject]?.units.map((unit: any, uIdx: number) => (
                  <div key={unit.name} className="bg-white/5 border border-white/10 rounded-[3rem] p-8">
                    <div className="flex items-center gap-4 mb-8">
                       <span className="w-10 h-10 rounded-2xl bg-primary text-black flex items-center justify-center font-black">{uIdx + 1}</span>
                       <h3 className="text-2xl font-black text-white">{unit.name}</h3>
                    </div>
                    <div className="grid gap-3">
                      {unit.topics.map((topic: any) => {
                        const topicName = typeof topic === 'string' ? topic : topic.name;
                        return (
                          <button
                            key={topicName}
                            onClick={() => openLesson(topicName, selectedSubject)}
                            className="flex items-center justify-between p-5 bg-black/20 border border-white/5 rounded-2xl hover:border-primary/30 transition-all group"
                          >
                            <span className="font-bold text-white/60 group-hover:text-white">{topicName}</span>
                            <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Lesson Drawer */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-[60] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTopic(null)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 35 }} className="relative bg-black w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-white/10">
              
              <div className="p-8 border-b border-white/10 flex items-center gap-6">
                <button onClick={() => setSelectedTopic(null)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                   <p className="text-primary font-black uppercase tracking-widest text-xs mb-1">AI Lesson Explainer</p>
                   <h3 className="text-4xl font-black text-white">{selectedTopic}</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                {isLoadingLesson ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-white/30 font-black uppercase tracking-widest text-[10px]">Generating Lesson Assets...</p>
                  </div>
                ) : (
                  <div className="space-y-12 pb-20">
                    <article className="prose prose-invert max-w-none text-white/70 text-xl leading-relaxed space-y-8">
                       {lessonContent.split('\n\n').map((p, i) => {
                         const cleanP = p.replace(/^\d+\.\s*/, ''); // Remove leading "1. ", "2. ", etc.
                         const headers = ['WHAT IS IT?', 'HOW DOES IT WORK?', 'EXAMPLE', 'MEMORY TRICK'];
                         const headerIndex = headers.findIndex(h => cleanP.toUpperCase().startsWith(h));
                         const isMarkdownHeader = p.startsWith('#');
                         
                         if (headerIndex !== -1 || isMarkdownHeader) {
                           const headerText = isMarkdownHeader ? p.replace(/#/g, '').trim() : headers[headerIndex];
                           const contentText = isMarkdownHeader ? '' : cleanP.substring(headers[headerIndex].length).trim();
                           
                           return (
                             <div key={i} className="space-y-4">
                               <h2 className="text-4xl font-black text-primary mt-12 flex items-center gap-4 uppercase tracking-tighter">
                                 {headerIndex !== -1 && <span className="text-white/20 text-6xl">0{headerIndex + 1}</span>}
                                 {headerText}
                               </h2>
                               {contentText && <p className="text-white/70 text-xl leading-relaxed">{contentText}</p>}
                             </div>
                           );
                         }
                         return <p key={i}>{p}</p>;
                       })}
                    </article>

                    {/* YouTube Video Section */}
                    {currentVideoUrl ? (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
                        <div className="flex items-center gap-4 mb-8">
                          <PlayCircle className="w-10 h-10 text-primary" />
                          <h4 className="text-3xl font-black text-white">Watch & Learn</h4>
                        </div>
                        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={currentVideoUrl} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
                        <div className="flex items-center gap-4 mb-8">
                          <PlayCircle className="w-10 h-10 text-primary" />
                          <h4 className="text-3xl font-black text-white">Search for Video</h4>
                        </div>
                        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed?listType=search&list=NCERT+10th+${encodeURIComponent(selectedSubject || '')}+${encodeURIComponent(selectedTopic || '')}`} 
                            frameBorder="0" 
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
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
