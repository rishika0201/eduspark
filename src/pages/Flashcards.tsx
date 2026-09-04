import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Layers, RotateCcw, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useStudent } from '../contexts/StudentContext';
import { syllabusData } from '../data/syllabus';
import { flashcardData } from '../data/flashcardContent';

import { useLanguage } from '../contexts/LanguageContext';

const getTopicName = (topic: string | { name: string }) => typeof topic === 'string' ? topic : topic.name;
const getSubtopics = (topic: string | { subtopics?: string[] }) => typeof topic === 'string' ? [] : topic.subtopics || [];

export default function Flashcards() {
  const { studentInfo } = useStudent();
  const { t } = useLanguage();
  const grade = studentInfo?.grade || 'Class 10';
  const board = studentInfo?.board || 'CBSE';
  
  const syllabus = useMemo(() => {
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    return boardData[grade] || boardData['Class 10'];
  }, [board, grade]);

  const subjects = Object.keys(syllabus);
  const [subject, setSubject] = useState(subjects[0]);
  const [chapter, setChapter] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const chapters = useMemo(() => {
    return syllabus[subject]?.units.flatMap((unit) => unit.topics.map(getTopicName)) || [];
  }, [subject, syllabus]);

  const activeChapter = chapter || chapters[0] || 'General Review';

  const flashcards = useMemo(() => {
    const topics = syllabus[subject]?.units.flatMap((unit) => unit.topics) || [];
    const topic = topics.find((item) => getTopicName(item) === activeChapter);
    const subtopics = topic ? getSubtopics(topic) : [];
    const subjectKey = Object.keys(flashcardData).find(k => k.toLowerCase() === subject.toLowerCase().trim());
    const chapterKey = subjectKey ? Object.keys(flashcardData[subjectKey]).find(k => k.toLowerCase() === activeChapter.toLowerCase().trim()) : null;
    const realCards = (subjectKey && chapterKey) ? flashcardData[subjectKey][chapterKey] : null;

    if (realCards && realCards.length > 0) {
      return realCards;
    }

    const baseCards = [
      {
        front: `${activeChapter} — overview`,
        back: `• Chapter: ${activeChapter} (${t(subject)})\n• Terms: note official NCERT definitions for each bold term in the chapter.\n• Core: list every formula/law stated in the chapter in one place.\n• Data: collect named laws, scientists, and SI units mentioned.\n• Apply: one standard numerical or diagram prompt typical of board papers.`,
      },
      ...subtopics.map((subtopic) => ({
        front: `${activeChapter} — ${subtopic}`,
        back: `• Focus: ${subtopic}\n• Define the idea in one line as in the textbook.\n• State the governing relation or classification rule.\n• Give one textbook-style fact or consequence.\n• Give one short application or contrast (with a related idea).`,
      })),
      {
        front: `${activeChapter} — quick recall`,
        back: `• Scan all in-chapter examples; note the given → required pattern.\n• List special cases (e.g., zero, maxima, boundary conditions).\n• Copy key diagrams labels you must reproduce in exams.`,
      },
    ];
    return baseCards;
  }, [activeChapter, subject, syllabus, t]);

  const currentCard = flashcards[cardIndex] || flashcards[0];

  const moveCard = (direction: 1 | -1) => {
    setIsFlipped(false);
    setCardIndex((current) => (current + direction + flashcards.length) % flashcards.length);
  };

  const selectSubject = (nextSubject: string) => {
    const nextChapters = syllabus[nextSubject]?.units.flatMap((unit) => unit.topics.map(getTopicName)) || [];
    setSubject(nextSubject);
    setChapter(nextChapters[0] || '');
    setCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full pb-24 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div>
          <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-black mb-3">{t('Flashcard Learning')}</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{t('Flip through the chapter.')}</h1>
          <p className="text-white/50 text-lg mt-4 max-w-2xl">{t('Choose a subject and chapter, then use animated cards for quick recall and revision.')}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-3xl px-5 py-4">
          <Layers className="w-6 h-6 text-primary" />
          <span className="font-black text-white">{cardIndex + 1} / {flashcards.length}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        <aside className="bg-white/5 border border-white/10 rounded-[2rem] p-5 h-fit">
          <label className="block mb-5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2 block">{t('Subject')}</span>
            <select
              value={subject}
              onChange={(event) => selectSubject(event.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-primary/50"
            >
              {subjects.map((item) => (
                <option key={item} value={item}>{t(item)}</option>
              ))}
            </select>
          </label>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3">{t('Chapter')}</p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {chapters.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setChapter(item);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-2xl border text-sm font-bold transition-all',
                    activeChapter === item
                      ? 'bg-primary text-black border-primary'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-primary/35'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="bg-white/5 border border-white/10 rounded-[3rem] p-5 md:p-10 min-h-[560px] flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-primary text-xs uppercase tracking-[0.2em] font-black">{t(subject)}</p>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{activeChapter}</h2>
            </div>
            <button
              onClick={() => setIsFlipped((value) => !value)}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-primary hover:border-primary/35 transition-all"
              aria-label={t('Flip card')}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center perspective-[1200px]">
            <AnimatePresence mode="wait">
              <motion.button
                key={`${activeChapter}-${cardIndex}-${isFlipped ? 'back' : 'front'}`}
                type="button"
                onClick={() => setIsFlipped((value) => !value)}
                initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90, scale: 0.96 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90, scale: 0.96 }}
                transition={{ duration: 0.28 }}
                className={clsx(
                  'w-full max-w-3xl min-h-[340px] rounded-[3rem] border p-8 md:p-12 text-left shadow-2xl',
                  isFlipped ? 'bg-primary text-black border-primary' : 'bg-black/35 text-white border-white/10'
                )}
              >
                <div className="flex items-center gap-3 mb-8">
                  {isFlipped ? <Sparkles className="w-7 h-7" /> : <BookOpen className="w-7 h-7 text-primary" />}
                  <span className={clsx('text-[10px] uppercase tracking-[0.25em] font-black', isFlipped ? 'text-black/60' : 'text-primary')}>
                    {isFlipped ? t('Answer') : t('Prompt')}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-black tracking-tighter leading-tight whitespace-pre-wrap">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </motion.button>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              onClick={() => moveCard(-1)}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:border-primary/35 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('Previous')}
            </button>
            <button
              onClick={() => moveCard(1)}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-primary text-black font-black hover:bg-white transition-all"
            >
              {t('Next')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
