import { useMemo, useState, useEffect, type FormEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { Heart, Zap, Flame, Trophy, Shield, Scale, Target, Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '../contexts/StudentContext';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollReveal from '../components/ScrollReveal';
import { generateQuestions } from '../services/ai';
import { syllabusData } from '../data/syllabus';

type DifficultyLevel = 'low' | 'medium' | 'high';

const difficultyMap: Record<DifficultyLevel, 'easy' | 'medium' | 'hard'> = {
  low: 'easy',
  medium: 'medium',
  high: 'hard',
};

const difficultyOptions: { value: DifficultyLevel; label: string; copy: string }[] = [
  { value: 'low', label: 'Low', copy: 'Warm-up questions' },
  { value: 'medium', label: 'Medium', copy: 'Balanced exam practice' },
  { value: 'high', label: 'High', copy: 'Challenge mode' },
];

export default function Practice() {
  const { t } = useLanguage();
  const location = useLocation();
  const params = useParams();
  const { studentInfo, activeTopic, activeSubject, recordTestAttempt } = useStudent();
  const isClass10 = studentInfo?.grade === 'Class 10';
  const grade = studentInfo?.grade || 'Class 10';
  const board = studentInfo?.board || 'CBSE';
  
  const syllabus = useMemo(() => {
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    return boardData[grade] || boardData['Class 10'];
  }, [board, grade]);

  const subjects = Object.keys(syllabus);
  const interests = studentInfo?.interests || [];
  const topicFromRoute = params.chapterId ? decodeURIComponent(params.chapterId) : '';
  const subjectFromRoute = params.subjectId ? decodeURIComponent(params.subjectId) : '';
  const topicFromState = location.state?.topic;
  const subjectFromState = location.state?.subject;
  const fallbackSubject = interests.find((subject) => subjects.includes(subject)) || (isClass10 ? 'Mathematics' : subjects[0]);
  const initialSubject = subjects.includes(subjectFromRoute)
    ? subjectFromRoute
    : subjects.includes(subjectFromState)
      ? subjectFromState
      : subjects.includes(activeSubject || '')
        ? activeSubject!
        : fallbackSubject;
  const initialTopic = topicFromState || activeTopic || "General Review";

  const [hasConfiguredSession, setHasConfiguredSession] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [chapterInput, setChapterInput] = useState(topicFromRoute || initialTopic);
  const [customInstructions, setCustomInstructions] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [sessionConfig, setSessionConfig] = useState({
    subject: initialSubject,
    topic: initialTopic,
    count: 5,
    difficulty: 'medium' as DifficultyLevel,
    customInstructions: '',
  });
  const [gameState, setGameState] = useState<'playing' | 'answered' | 'completed'>('playing');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(12450);
  const [combo, setCombo] = useState(3);
  const [lives, setLives] = useState(3);
  const [focus, setFocus] = useState(100);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const subjectStr = sessionConfig.subject;
  const topicStr = sessionConfig.topic;
  
  const rankStr = isClass10 ? 'Senior Scholar' : 'Quantum Initiate';
  const chapterSuggestions = useMemo(() => {
    const subjectSyllabus = syllabus[selectedSubject];
    return subjectSyllabus?.units.flatMap((unit) =>
      unit.topics.map((topic) => (typeof topic === 'string' ? topic : topic.name))
    ) || [];
  }, [selectedSubject, syllabus]);

  useEffect(() => {
    async function loadQuestions() {
      if (!hasConfiguredSession) return;
      setIsLoading(true);
      setGameState('playing');
      setSelectedOption(null);
      setCurrentQuestionIdx(0);
      setCorrectAnswers(0);
      setFocus(100);
      setScore(12450);
      setCombo(3);
      setLives(3);
      const generated = await generateQuestions({
        subjectId: sessionConfig.subject,
        chapterId: sessionConfig.topic,
        difficulty: difficultyMap[sessionConfig.difficulty],
        count: sessionConfig.count,
        grade,
        board: studentInfo?.board || 'CBSE',
        customInstructions: sessionConfig.customInstructions,
      });
      if (Array.isArray(generated) && generated.length > 0) {
        setQuestions(generated.slice(0, sessionConfig.count));
      } else {
        setQuestions(Array.from({ length: sessionConfig.count }, (_, index) => ({
          question: `Question ${index + 1}: Which of the following is a key concept in ${sessionConfig.topic}?`,
          options: ["Fundamental principle", "Unrelated fact", "Random shortcut", "Historical date"],
          correctIndex: 0
        })));
      }
      setIsLoading(false);
    }
    loadQuestions();
  }, [hasConfiguredSession, sessionConfig]);

  useEffect(() => {
    if (gameState !== 'playing' || isLoading) return;
    const timer = setInterval(() => {
      setFocus(t => Math.max(0, t - 0.5));
    }, 100);
    return () => clearInterval(timer);
  }, [gameState, isLoading]);

  const currentQuestion = questions[currentQuestionIdx];
  const options = currentQuestion?.options.map((opt: string, i: number) => ({
    id: i,
    letter: String.fromCharCode(65 + i),
    text: opt,
    correct: i === currentQuestion.correctIndex
  })) || [];

  const handleSelect = (index: number) => {
    if (gameState === 'answered' || isLoading) return;
    setSelectedOption(index);
    setGameState('answered');
    
    if (options[index].correct) {
      setScore(s => s + (50 * combo) + Math.floor(focus / 2));
      setCombo(c => c + 1);
      setCorrectAnswers(c => c + 1);
    } else {
      setCombo(1);
      setLives(l => Math.max(0, l - 1));
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setGameState('playing');
      setSelectedOption(null);
      setFocus(100);
    } else {
      const percentage = questions.length ? Math.round((correctAnswers / questions.length) * 100) : 0;
      recordTestAttempt(percentage);
      setGameState('completed');
    }
  };

  const startPracticeSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedChapter = chapterInput.trim() || initialTopic;
    const safeCount = Math.min(20, Math.max(1, Math.round(questionCount || 5)));
    setQuestionCount(safeCount);
    setSessionConfig({
      subject: selectedSubject,
      topic: trimmedChapter,
      count: safeCount,
      difficulty,
      customInstructions,
    });
    setHasConfiguredSession(true);
  };

  if (!hasConfiguredSession) {
    return (
      <div className="p-4 md:p-6 lg:p-10 max-w-6xl mx-auto w-full pb-24 min-h-screen flex items-center">
        <motion.form
          onSubmit={startPracticeSession}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-black mb-3">{t('Practice Setup')}</p>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{t('Build your session.')}</h1>
              <p className="text-white/80 text-lg mt-4 max-w-2xl">
                {t('Choose the subject, chapter, number of questions, and difficulty before the quiz starts.')}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10">
            <div className="space-y-8">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-3 block">{t('Subject')}</span>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        const nextChapters = syllabus[subject]?.units.flatMap((unit) =>
                          unit.topics.map((topic) => (typeof topic === 'string' ? topic : topic.name))
                        ) || [];
                        setSelectedSubject(subject);
                        setChapterInput(nextChapters[0] || 'General Review');
                      }}
                      className={clsx(
                        "px-4 py-4 rounded-2xl text-xs font-black transition-all border",
                        selectedSubject === subject 
                          ? "bg-primary text-black border-primary" 
                          : "bg-white/5 border-white/5 text-white/60 hover:border-white/20"
                      )}
                    >
                      {t(subject)}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-3 block">{t('Question Count')}</span>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Number(event.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-2xl font-black text-white w-12 text-right">{questionCount}</span>
                </div>
              </label>

              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70 block">{t('Difficulty')}</span>
                <div className="grid grid-cols-3 gap-2">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={clsx(
                        "py-3 rounded-xl text-[10px] font-black uppercase transition-all border",
                        difficulty === option.value
                          ? "bg-primary text-black border-primary"
                          : "bg-white/5 border-white/5 text-white/40"
                      )}
                    >
                      {t(option.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-3 block">{t('Chapter selection')}</span>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                  {chapterSuggestions.map((chapter) => (
                    <button
                      key={chapter}
                      type="button"
                      onClick={() => setChapterInput(chapter)}
                      className={clsx(
                        "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                        chapterInput === chapter
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                      )}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-10 w-full bg-primary text-black py-5 rounded-full font-black text-xl flex items-center justify-center gap-3 hover:bg-white transition-all"
          >
            {t('Start practice')}
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.form>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/10 rounded-full animate-spin border-t-primary"></div>
          <Sparkles className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">Constructing Encounter...</h2>
          <p className="text-white/70 uppercase tracking-[0.3em] text-xs">AI is tailoring challenges for {topicStr}</p>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    const percentage = questions.length ? Math.round((correctAnswers / questions.length) * 100) : 0;

    return (
      <div className="p-4 md:p-6 lg:p-10 max-w-5xl mx-auto w-full pb-24 min-h-screen flex items-center">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/5 backdrop-blur-2xl rounded-[4rem] border border-white/10 p-10 md:p-16 text-center shadow-2xl"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-primary text-black flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(74,222,128,0.28)]">
            <Trophy className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.35em] mb-4">Quiz Completed</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">Final Score: {score.toLocaleString()}</h1>
          <p className="text-white/80 text-xl mb-10">
            You answered {correctAnswers} of {questions.length} correctly for {percentage}% mastery in {topicStr}.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
            <div className="bg-black/30 border border-white/10 rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60 mb-2">Accuracy</p>
              <p className="text-3xl font-black text-primary">{percentage}%</p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60 mb-2">Final Combo</p>
              <p className="text-3xl font-black text-primary">x{combo}</p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60 mb-2">Vitality</p>
              <p className="text-3xl font-black text-primary">{lives}/3</p>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentQuestionIdx(0);
              setSelectedOption(null);
              setCorrectAnswers(0);
              setScore(12450);
              setCombo(3);
              setLives(3);
              setFocus(100);
              setHasConfiguredSession(false);
              setGameState('playing');
            }}
            className="w-full sm:w-auto bg-primary text-black px-12 py-5 rounded-full font-black text-lg inline-flex items-center justify-center gap-3 hover:bg-white transition-all"
          >
            Practice Again
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full pb-24 selection:bg-primary/30 min-h-screen">
      {/* Top HUD */}
      <ScrollReveal direction="down" delay={0.1} className="flex flex-wrap items-center justify-between bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 mb-12 gap-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-primary text-black rounded-3xl flex items-center justify-center font-black text-4xl shadow-[0_0_30px_rgba(74,222,128,0.35)]"
          >
            24
          </motion.div>
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Current Rank</p>
            <p className="font-black text-3xl text-white tracking-tighter">{rankStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-10 md:gap-16">
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map(i => (
                <motion.div key={i} animate={{ scale: i <= lives ? 1.1 : 0.8, opacity: i <= lives ? 1 : 0.2 }}>
                  <Heart className={clsx("w-8 h-8", i <= lives ? "fill-primary text-primary" : "text-white/10")} />
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Vitality</p>
          </div>

          <div className="flex flex-col items-center">
            <motion.div key={combo} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-primary font-black text-4xl tracking-tighter">
              <Flame className={clsx("w-8 h-8 fill-primary", combo > 1 && "animate-pulse")} />
              x{combo}
            </motion.div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Combo</p>
          </div>

          <div className="flex flex-col items-center">
            <motion.p key={score} animate={{ scale: [1, 1.1, 1] }} className="text-4xl font-black text-white tracking-tighter">
              {score.toLocaleString()}
            </motion.p>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">XP Score</p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Encounter Area */}
        <ScrollReveal direction="up" delay={0.15} className="lg:col-span-8">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden relative">
            <div className="h-2 w-full bg-white/5">
              <motion.div 
                className="h-full bg-primary shadow-[0_0_20px_#4ADE80]"
                animate={{ width: `${focus}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            <div className="p-12 md:p-16">
              <div className="flex justify-between items-start mb-12">
                <div className="flex flex-col gap-4">
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-white/10">
                    <Target className="w-4 h-4" />
                    Encounter {currentQuestionIdx + 1} / {questions.length}
                  </span>
                  <p className="text-white/70 font-black uppercase tracking-[0.3em] text-[10px] ml-1">
                    {subjectStr} - {topicStr} - {sessionConfig.difficulty.toUpperCase()}
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.h2 
                  key={currentQuestionIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-16 tracking-tighter"
                >
                  {currentQuestion?.question}
                </motion.h2>
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-6 relative">
                {options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isAnswered = gameState === 'answered';
                  const isCorrect = opt.correct;
                  
                  let btnClass = "border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 text-white/70";
                  if (isAnswered) {
                    if (isCorrect) btnClass = "border-primary bg-primary/10 text-primary font-black shadow-[0_0_30px_rgba(74,222,128,0.24)]";
                    else if (isSelected) btnClass = "border-red-500/50 bg-red-500/10 text-red-400 opacity-80";
                    else btnClass = "border-white/5 bg-white/5 text-white/20 opacity-30 grayscale";
                  }

                  return (
                    <motion.button 
                      key={opt.id}
                      onClick={() => handleSelect(i)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={!isAnswered ? { x: 10, scale: 1.01 } : {}}
                      className={clsx(
                        "text-left p-8 rounded-3xl border-2 transition-all duration-400 flex items-center justify-between group",
                        btnClass
                      )}
                    >
                      <div className="flex items-center gap-8">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all",
                          isAnswered && isCorrect ? "bg-primary text-black" : "bg-white/5 text-white/70"
                        )}>
                          {opt.letter}
                        </div>
                        <span className="text-2xl font-bold">{opt.text}</span>
                      </div>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-8 h-8 text-primary" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-8 h-8 text-red-500" />}
                    </motion.button>
                  )
                })}
              </div>

              <AnimatePresence>
                {gameState === 'answered' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mt-16">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextQuestion}
                      className="w-full md:w-auto bg-primary text-black px-16 py-6 rounded-full font-black text-2xl flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(74,222,128,0.28)] transition-all"
                    >
                      Continue Encounter
                      <ArrowRight className="w-8 h-8" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>

        {/* Sidebar Widget */}
        <ScrollReveal direction="right" delay={0.25} className="lg:col-span-4 space-y-10">
          <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
              <Shield className="w-7 h-7 text-primary" />
              Active Quests
            </h3>
            <div className="space-y-8">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                 <div className="flex justify-between items-start mb-4">
                    <p className="font-black text-white uppercase tracking-wider">Board Scholar</p>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">+500 XP</span>
                 </div>
                 <div className="w-full bg-white/5 rounded-full h-2 mb-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} className="bg-primary h-full rounded-full shadow-[0_0_10px_#4ADE80]" />
                 </div>
                 <p className="text-[10px] text-right font-black text-primary uppercase tracking-[0.2em]">8 / 10 PROGRESS</p>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} className="premium-gradient p-10 rounded-[3rem] text-black relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
                <Sparkles className="w-7 h-7 animate-pulse" />
                Power-ups
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {[Scale, Lightbulb].map((Icon, idx) => (
                   <button key={idx} className="bg-black/10 p-5 rounded-[2.5rem] border border-black/10 flex flex-col items-center gap-3 hover:bg-black/20 transition-all">
                     <Icon className="w-8 h-8" />
                     <span className="text-[10px] font-black uppercase tracking-widest">ACTIVE</span>
                   </button>
                 ))}
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}
