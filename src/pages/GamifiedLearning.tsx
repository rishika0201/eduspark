import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Lock, ChevronRight, GraduationCap, BookOpen, Crown, CheckCircle2, XCircle, ArrowLeft, Coins } from 'lucide-react';
import { useStudent } from '../contexts/StudentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { syllabusData } from '../data/syllabus';
import { generatePracticeQuestions } from '../services/ai';
import { addGamifyCoins, getGamifyCoins, getGamifyHighestLevel, setGamifyHighestLevel } from '../services/eduPortalStorage';

export default function GamifiedLearning() {
  const { studentInfo, performance, recordTopicCompletion, recordTestAttempt } = useStudent();
  const { t } = useLanguage();

  const [step, setStep] = useState<'subject' | 'chapter' | 'level' | 'quiz' | 'treasure' | 'result'>('subject');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<number>(1);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [resultScore, setResultScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [coinsTotal, setCoinsTotal] = useState(getGamifyCoins());
  const [chestOpened, setChestOpened] = useState(false);
  const [lastCoinEarned, setLastCoinEarned] = useState(0);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
  const [nextLevelUnlocking, setNextLevelUnlocking] = useState(false);
  const coinGrantedRef = useRef(false);

  const grade = studentInfo?.grade || 'Class 10';
  const board = studentInfo?.board || 'CBSE';
  
  const subjects = useMemo(() => {
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    const classData = boardData[grade] || boardData['Class 10'];
    return Object.keys(classData || {});
  }, [board, grade]);

  const progressKey = useMemo(
    () => (selectedSubject && selectedChapter ? `${grade}::${selectedSubject}::${selectedChapter}` : ''),
    [grade, selectedSubject, selectedChapter],
  );

  useEffect(() => {
    setCoinsTotal(getGamifyCoins());
  }, [step]);

  useEffect(() => {
    if (step !== 'treasure' || !chestOpened || coinGrantedRef.current) return;
    coinGrantedRef.current = true;
    const earned = 40 + Math.round(resultScore / 2) + activeLevel * 15;
    setLastCoinEarned(earned);
    const total = addGamifyCoins(earned);
    setCoinsTotal(total);
    
    // Check if milestone badge should be shown
    if (activeLevel > 0 && activeLevel % 5 === 0 && resultScore >= 60) {
      setShowBadgeAnimation(true);
      const tmr = window.setTimeout(() => {
        setShowBadgeAnimation(false);
        setStep('result');
      }, 4000);
      return () => window.clearTimeout(tmr);
    } else {
      const tmr = window.setTimeout(() => setStep('result'), 2200);
      return () => window.clearTimeout(tmr);
    }
  }, [step, chestOpened, resultScore, activeLevel]);

  useEffect(() => {
    if (step !== 'treasure') coinGrantedRef.current = false;
  }, [step]);

  const highestCleared = progressKey ? getGamifyHighestLevel(progressKey) : 0;
  const milestoneBadges = Math.floor(highestCleared / 5);

  const startQuiz = async (level: number) => {
    setActiveLevel(level);
    setLoading(true);
    setStep('quiz');
    setScore(0);
    setCurrentQIndex(0);
    setChestOpened(false);
    coinGrantedRef.current = false;

    try {
      const difficulty = level <= 10 ? 'easy' : level <= 20 ? 'medium' : 'hard';
      const qData = await generatePracticeQuestions(selectedChapter, selectedSubject, difficulty, 5, {
        level,
        board,
        grade,
        subjectId: selectedSubject,
        chapterId: selectedChapter,
      });
      setQuestions(qData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswering || !questions[currentQIndex]) return;

    setIsAnswering(true);
    setSelectedAnswer(index);

    const isCorrect = index === questions[currentQIndex].correctIndex;
    const nextScore = isCorrect ? score + 20 : score;
    if (isCorrect) setScore(nextScore);

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedAnswer(null);
        setIsAnswering(false);
      } else {
        const finalScore = isCorrect ? score + 20 : score;
        setResultScore(finalScore);
        recordTestAttempt(finalScore);
        if (finalScore >= 60) {
          recordTopicCompletion(selectedChapter);
          if (progressKey) {
            setGamifyHighestLevel(progressKey, Math.max(getGamifyHighestLevel(progressKey), activeLevel));
          }
        }
        setSelectedAnswer(null);
        setIsAnswering(false);
        setChestOpened(false);
        coinGrantedRef.current = false;
        if (finalScore >= 60) {
          setStep('treasure');
        } else {
          setStep('result');
        }
      }
    }, 800);
  };

  const goNextLevel = () => {
    if (resultScore >= 60 && activeLevel < 30) {
      setNextLevelUnlocking(true);
      setTimeout(() => {
        setNextLevelUnlocking(false);
        startQuiz(activeLevel + 1);
      }, 1500);
    } else {
      setStep('level');
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full pb-32 lg:pb-10 min-h-screen text-white/80 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              {t('Level')} {activeLevel}
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter">
            {step === 'subject' ? t('Select Subject') : step === 'chapter' ? t('Select Chapter') : selectedChapter}
          </h2>
          {progressKey ? (
            <p className="text-white/70 text-xs font-bold mt-3 uppercase tracking-widest">
              {t('Level badges')}: <span className="text-primary">{milestoneBadges}</span> · {t('Coins')}: {coinsTotal}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-3 shadow-2xl">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="font-black text-white text-lg tracking-tight">
              {t('Coins')}: {coinsTotal}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-3 shadow-2xl">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-black text-white text-lg tracking-tight">XP: {score * 10}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-3 shadow-2xl">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-black text-white text-lg tracking-tight">
              {t('Quiz points')}: {score}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'subject' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setSelectedSubject(sub);
                  setStep('chapter');
                }}
                className="group bg-white/5 border border-white/10 p-10 rounded-[3rem] text-left hover:border-primary/40 transition-all hover:bg-white/10 relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">{t(sub)}</h3>
                <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">
                  {(syllabusData[board] || syllabusData['CBSE'])[grade]?.[sub]?.units?.reduce((n: number, u: { topics: unknown[] }) => n + u.topics.length, 0) || 0}{' '}
                  {t('Chapters')}
                </p>
                <ChevronRight className="absolute bottom-10 right-10 w-8 h-8 text-white/50 group-hover:text-primary group-hover:translate-x-2 transition-all" />
              </button>
            ))}
          </motion.div>
        )}

        {step === 'chapter' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <button type="button" onClick={() => setStep('subject')} className="flex items-center gap-2 text-white/70 hover:text-white font-black uppercase text-xs tracking-widest mb-4">
              <ArrowLeft className="w-4 h-4" /> {t('Back')}
            </button>
            <div className="grid md:grid-cols-2 gap-4">
              {(syllabusData[board] || syllabusData['CBSE'])[grade]?.[selectedSubject]?.units.map((unit: { topics: Array<string | { name: string }> }) =>
                unit.topics.map((topic) => {
                  const topicName = typeof topic === 'string' ? topic : topic.name;
                  return (
                    <button
                      key={topicName}
                      type="button"
                      onClick={() => {
                        setSelectedChapter(topicName);
                        setStep('level');
                      }}
                      className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/50 transition-all group"
                    >
                      <span className="text-xl font-black text-white/80 group-hover:text-white">{topicName}</span>
                      <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-primary" />
                    </button>
                  );
                }),
              )}
            </div>
          </motion.div>
        )}

        {step === 'level' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10">
            <button type="button" onClick={() => setStep('chapter')} className="self-start flex items-center gap-2 text-white/70 hover:text-white font-black uppercase text-xs tracking-widest mb-10">
              <ArrowLeft className="w-4 h-4" /> {t('Back')}
            </button>

            <div className="flex items-center gap-2 mb-8 text-amber-300">
              <Trophy className="w-6 h-6" />
              <span className="text-sm font-black uppercase tracking-widest">
                {t('Level badges')}: {milestoneBadges}
              </span>
            </div>

            <div className="relative flex flex-col items-center gap-12 w-full max-w-md pb-20">
              <div className="absolute top-10 bottom-10 w-1 bg-white/5 left-1/2 -translate-x-1/2" />

              {Array.from({ length: 30 }, (_, i) => i + 1).map((lvl, idx) => {
                const unlocked = lvl <= highestCleared + 1;
                const isOdd = idx % 2 !== 0;

                return (
                  <motion.button
                    key={lvl}
                    type="button"
                    disabled={!unlocked}
                    whileHover={unlocked ? { scale: 1.1 } : {}}
                    whileTap={unlocked ? { scale: 0.95 } : {}}
                    onClick={() => startQuiz(lvl)}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
                      unlocked
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-4 border-white'
                        : 'bg-gray-800 text-white/50 border-4 border-white/5 grayscale'
                    } ${isOdd ? 'translate-x-16' : '-translate-x-16'}`}
                  >
                    <span className="text-3xl font-black italic">{lvl}</span>
                    <div className="absolute -bottom-6 flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${unlocked ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
                      ))}
                    </div>
                    {lvl < 5 && <div className={`absolute top-full h-12 w-1 bg-white/10 -translate-x-1/2 left-1/2 ${unlocked ? 'bg-green-500/30' : ''}`} />}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto w-full">
            {loading ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <p className="text-white/70 font-black uppercase tracking-widest">{t('Gamify loading label')}</p>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-10">
                <div className="flex justify-between items-end">
                  <p className="text-primary font-black uppercase tracking-widest text-xs">
                    {t('Question')} {currentQIndex + 1}/5
                  </p>
                  <p className="text-white/70 font-black text-3xl">{score}</p>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((currentQIndex + 1) / 5) * 100}%` }} className="h-full bg-primary" />
                </div>

                <h3 className="text-2xl md:text-4xl font-black text-white leading-tight">{questions[currentQIndex]?.question}</h3>

                <div className="grid gap-3 md:gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {questions[currentQIndex]?.options.map((opt: string, i: number) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === questions[currentQIndex].correctIndex;
                    const showSuccess = isAnswering && isCorrect;
                    const showError = isAnswering && isSelected && !isCorrect;

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isAnswering}
                        onClick={() => handleAnswer(i)}
                        className={`w-full text-left p-5 md:p-6 rounded-3xl border transition-all font-bold text-base md:text-lg relative overflow-hidden ${
                          showSuccess
                            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                            : showError
                              ? 'bg-red-500/20 border-red-500 text-red-400'
                              : isAnswering && !isCorrect
                                ? 'bg-white/5 border-white/5 opacity-40'
                                : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                              showSuccess ? 'bg-green-500 text-white' : showError ? 'bg-red-500 text-white' : 'bg-white/10'
                            }`}
                          >
                            {showSuccess ? <CheckCircle2 className="w-4 h-4" /> : showError ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                          </div>
                          {opt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'treasure' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg p-6">
            <p className="text-primary font-black uppercase tracking-[0.35em] text-xs mb-4">{t('Treasure reward')}</p>
            <motion.div
              animate={chestOpened ? { scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] } : { y: [0, -6, 0] }}
              transition={{ duration: chestOpened ? 0.6 : 1.2, repeat: chestOpened ? 0 : Infinity }}
              className="relative w-48 h-40 rounded-2xl bg-gradient-to-b from-amber-600 to-amber-900 border-4 border-amber-400/50 shadow-[0_0_60px_rgba(251,191,36,0.4)] flex items-center justify-center"
            >
              <div className="absolute inset-x-8 top-0 h-10 bg-amber-700 rounded-b-xl border-b-4 border-amber-900" />
              <Lock className={`w-16 h-16 text-amber-200 transition-opacity duration-500 ${chestOpened ? 'opacity-0 scale-50' : 'opacity-100'}`} />
              {chestOpened && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Coins className="w-14 h-14 text-yellow-300" />
                  <span className="text-2xl font-black text-white">+{lastCoinEarned || '…'}</span>
                </motion.div>
              )}
            </motion.div>
            <p className="mt-8 text-white/80 text-sm font-bold text-center max-w-xs">{chestOpened ? t('You earned coins') : t('Tap to open chest')}</p>
            {!chestOpened && (
              <button type="button" onClick={() => setChestOpened(true)} className="mt-4 px-8 py-3 rounded-2xl bg-primary text-black font-black">
                {t('Tap to open chest')}
              </button>
            )}
            {chestOpened && getGamifyHighestLevel(progressKey) > 0 && getGamifyHighestLevel(progressKey) % 5 === 0 && resultScore >= 60 && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-amber-300 font-black text-lg">
                {t('Badge unlocked')}
              </motion.p>
            )}
            
            {showBadgeAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg p-6"
              >
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                  >
                    <div className="w-40 h-40 rounded-full border-4 border-yellow-400/30" />
                    <div className="absolute inset-4 rounded-full border-4 border-amber-400/40" />
                    <div className="absolute inset-8 rounded-full border-4 border-orange-400/50" />
                  </motion.div>
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_80px_rgba(251,191,36,0.6)]">
                    <Trophy className="w-20 h-20 text-white" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-black font-black text-lg">{Math.floor(activeLevel / 5)}</span>
                  </motion.div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"
                >
                  MILESTONE BADGE!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 text-white/80 text-lg font-bold"
                >
                  You've completed {activeLevel} levels!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 flex gap-2"
                >
                  {[1, 2, 3, 4, 5].map((star, i) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                    >
                      <Star className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {nextLevelUnlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg p-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
              className="relative"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.5)] border-4 border-white"
              >
                <Lock className="w-16 h-16 text-white" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-green-400/50 border-t-transparent"
                />
              </motion.div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
            >
              LEVEL {activeLevel + 1} UNLOCKED!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-white/80 text-lg font-bold"
            >
              Get ready for the next challenge...
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-[#1a4d2e] to-[#0a1f12] w-full max-w-md rounded-[3rem] p-10 text-center border-4 border-white/20 shadow-[0_0_100px_rgba(34,197,94,0.3)] relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
              </div>

              <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase drop-shadow-lg">
                {resultScore >= 90
                  ? t('Gamify result amazing')
                  : resultScore >= 70
                    ? t('Gamify result great')
                    : resultScore >= 40
                      ? t('Gamify result clear')
                      : t('Gamify result retry')}
              </h2>

              <div className="flex justify-center gap-4 my-10">
                {[1, 2, 3].map((star) => {
                  const isFilled =
                    (star === 1 && resultScore >= 60) || (star === 2 && resultScore >= 80) || (star === 3 && resultScore >= 100);
                  return (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + star * 0.2, type: 'spring' }}
                    >
                      <Star
                        className={`w-16 h-16 ${isFilled ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'text-white/10'}`}
                        strokeWidth={1}
                      />
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-2 mb-10">
                <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-xs">{t('Final Score')}</p>
                <div className="text-7xl font-black text-white italic tracking-tighter">
                  {resultScore}
                  <span className="text-2xl text-white/60 not-italic ml-1">/100</span>
                </div>
              </div>

              <div className="grid gap-4">
                {resultScore >= 60 ? (
                  <button
                    type="button"
                    onClick={goNextLevel}
                    className="w-full py-6 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_10px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {activeLevel < 30 ? t('Next Level') : t('Finish Quiz')} <ChevronRight className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startQuiz(activeLevel)}
                    className="w-full py-6 bg-white hover:bg-gray-100 text-black rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_10px_0_rgb(156,163,175)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    {t('Retry')}
                  </button>
                )}
                <button type="button" onClick={() => setStep('subject')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                  {t('Exit to Menu')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
