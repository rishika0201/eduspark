import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Camera, CheckCircle2, Clock3, FileText, Lightbulb, MessagesSquare, Mic, Paperclip, Search, Send, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useStudent } from '../contexts/StudentContext';
import { doubtThreads } from '../data/learningContent';
import { generateDoubtMentorReply } from '../services/ai';
import { useLanguage } from '../contexts/LanguageContext';

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
const SUPPORTED_UPLOAD_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function Doubts() {
  const { studentInfo } = useStudent();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState(studentInfo?.interests?.[0] || 'Mathematics');
  const [isAsking, setIsAsking] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const subjects = useMemo(() => {
    const profileSubjects = studentInfo?.interests?.length ? studentInfo.interests : ['Mathematics', 'Science', 'English', 'Social Science'];
    return [...new Set(profileSubjects)];
  }, [studentInfo?.interests]);

  const speechLang = useMemo(() => {
    const m: Record<string, string> = { EN: 'en-US', HI: 'hi-IN', TA: 'ta-IN', ES: 'es-ES' };
    return m[language] || 'en-US';
  }, [language]);

  const stopVoice = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startVoice = useCallback(() => {
    const W = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const Rec = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Rec) {
      setUploadError(t('Voice not supported'));
      return;
    }
    setUploadError('');
    const rec = new Rec();
    rec.lang = speechLang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let piece = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const r = event.results[i];
        if (r.isFinal) piece += r[0]?.transcript ?? '';
      }
      if (piece.trim()) {
        setQuestion((q) => {
          const sep = q.length && !/\s$/.test(q) ? ' ' : '';
          return `${q}${sep}${piece.trim()} `;
        });
      }
    };
    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error === 'aborted' || ev.error === 'no-speech') return;
      setUploadError(t('Voice error'));
      stopVoice();
    };
    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setUploadError(t('Voice not supported'));
    }
  }, [speechLang, stopVoice, t]);

  useEffect(() => () => stopVoice(), [stopVoice]);

  const askDoubt = async () => {
    if (!question.trim()) return;
    const askedQuestion = question.trim();
    const userMessageId = `user-${Date.now()}`;
    const aiMessageId = `ai-${Date.now()}`;
    setIsAsking(true);
    
    // Add to chat history
    setMessages(prev => [
      ...prev,
      { id: userMessageId, role: 'user', content: askedQuestion },
      { id: aiMessageId, role: 'assistant', content: t('Thinking...') }
    ]);
    
    setQuestion('');

    const attachmentNames = attachments.map((file) => file.name).join(', ');
    
    try {
      const explanation = await generateDoubtMentorReply(
        askedQuestion,
        subject,
        studentInfo?.board || 'CBSE',
        attachmentNames || undefined,
      );
      
      // Update chat history
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: explanation } : m));
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: t('Sorry, I encountered an error. Please try again.') } : m));
    } finally {
      setAttachments([]);
      setIsAsking(false);
      // Scroll to bottom
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadError('');
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (!SUPPORTED_UPLOAD_TYPES.includes(file.type)) {
        setUploadError(`${file.name} is not a supported file type.`);
        return;
      }
      if (file.size > MAX_UPLOAD_SIZE) {
        setUploadError(`${file.name} is larger than 8 MB.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length) {
      setAttachments((current) => [...current, ...validFiles].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto w-full px-5 lg:px-10 py-10 pb-28 xl:pb-12">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
        <section className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
              <MessagesSquare className="w-4 h-4" />
              {t('Doubt Center')}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">{t('Ask, solve, and revise every doubt.')}</h1>
            <p className="text-white/55 text-lg mt-5">{t('Built for the real homework loop: type a doubt, attach a photo, get an AI explanation, and keep a mentor review trail.')}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6">
            <div className="flex gap-2 overflow-x-auto pb-3">
              {subjects.map((item) => (
                <button
                  key={item}
                  onClick={() => setSubject(item)}
                  className={clsx(
                    'px-4 py-2 rounded-xl border text-sm font-black whitespace-nowrap transition-all',
                    subject === item ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/55 border-white/10 hover:text-white'
                  )}
                >
                  {t(item)}
                </button>
              ))}
            </div>

            <div className="rounded-3xl bg-black/35 border border-white/10 overflow-hidden flex flex-col min-h-[500px]">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 bg-white/[0.02]">
                <Bot className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-black text-white">{t('EduSpark AI Mentor')}</p>
                  <p className="text-xs text-white/40">{t('Live interaction for instant understanding')}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[360px] max-h-[min(70vh,560px)] scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                    <MessagesSquare className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold max-w-[200px]">{t('Ask anything about your syllabus to start the chat.')}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx(
                        'flex flex-col max-w-[85%]',
                        msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div className={clsx(
                        'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                        msg.role === 'user' ? 'bg-primary text-black font-bold rounded-tr-none' : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                      )}>
                        {msg.role === 'assistant' ? (
                          msg.content.split('\n').map((line, li) => {
                            const isSectionHeader = ['WHAT IS IT?', 'HOW DOES IT WORK?', 'EXAMPLE', 'MEMORY TRICK'].some(h => line.toUpperCase().startsWith(h));
                            if (isSectionHeader) {
                              return <div key={li} className="font-black text-primary mt-3 mb-1 uppercase tracking-wider text-[10px]">{line}</div>;
                            }
                            return <div key={li}>{line}</div>;
                          })
                        ) : msg.content}
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-white/20 mt-1 font-black px-1">
                        {msg.role === 'user' ? t('You') : t('AI Mentor')}
                      </span>
                    </motion.div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/10">
                <div className="relative group">
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        askDoubt();
                      }
                    }}
                    placeholder={t('Type your doubt...')}
                    className="w-full min-h-[100px] bg-black/40 border border-white/10 rounded-2xl p-4 pr-14 outline-none resize-none text-white placeholder:text-white/20 focus:border-primary/30 transition-all"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={askDoubt}
                      disabled={!question.trim() || isAsking}
                      className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-white transition-all disabled:opacity-40"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={SUPPORTED_UPLOAD_TYPES.join(',')}
                    onChange={(event) => handleFiles(event.target.files)}
                    className="hidden"
                  />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-primary/30 text-[10px] font-black uppercase tracking-wider transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    {t('Snap')}
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-primary/30 text-[10px] font-black uppercase tracking-wider transition-all">
                    <Paperclip className="w-3.5 h-3.5" />
                    {t('Attach')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) stopVoice();
                      else startVoice();
                    }}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all',
                      isListening
                        ? 'bg-red-500/15 border-red-500/40 text-red-300 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-primary/30'
                    )}
                    aria-pressed={isListening}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isListening ? t('Listening') : t('Voice')}
                  </button>
                </div>
              </div>
              {(attachments.length > 0 || uploadError) && (
                <div className="border-t border-white/10 px-5 py-4 space-y-2">
                  {uploadError && <p className="text-red-300 text-sm font-bold">{uploadError}</p>}
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file) => (
                      <span key={`${file.name}-${file.lastModified}`} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white/65">
                        <FileText className="w-4 h-4 text-primary" />
                        {file.name}
                        <button
                          onClick={() => setAttachments((current) => current.filter((item) => item !== file))}
                          className="text-white/35 hover:text-red-300"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              [Sparkles, t('AI first answer'), t('Get a clean explanation in seconds.')],
              [ShieldCheck, t('Teacher verified'), t('Escalate hard doubts to mentors.')],
              [Lightbulb, t('Practice from doubt'), t('Turn mistakes into drills.')],
            ].map(([Icon, title, copy]) => {
              const TileIcon = Icon as typeof Sparkles;
              return (
                <div key={title as string} className="bg-white/5 border border-white/10 rounded-3xl p-5">
                  <TileIcon className="w-7 h-7 text-primary mb-4" />
                  <h3 className="font-black text-white">{title as string}</h3>
                  <p className="text-sm text-white/45 mt-2">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-primary text-xs uppercase tracking-[0.2em] font-black">{t('Example threads')}</p>
              <h2 className="text-3xl font-black text-white tracking-tight mt-1">{t('Sample solved doubts')}</h2>
              <p className="text-white/45 text-sm mt-2 max-w-md">{t('New mentor answers appear live in the chat on the left. This list is static reference only.')}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input className="bg-black/30 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/40" placeholder="Search doubts" />
            </div>
          </div>

          <div className="space-y-4">
            {doubtThreads.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-black/30 border border-white/10 rounded-3xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {item.status === 'Solved' ? <CheckCircle2 className="w-6 h-6" /> : <Clock3 className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">{t(item.subject)}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/35">{t(item.time)}</span>
                      <span className={clsx(
                        'text-[10px] uppercase tracking-[0.2em] font-black px-2 py-1 rounded-full',
                        item.status === 'Solved' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-white/55'
                      )}>
                        {t(item.status)}
                      </span>
                    </div>
                    <p className="text-white font-black text-lg leading-snug">{item.question}</p>
                    <div className="mt-4 bg-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-white/45 text-xs uppercase tracking-[0.2em] font-black mb-2">
                        <UserRound className="w-4 h-4" />
                        {t('Explanation')}
                      </div>
                      <p className="text-white/60 whitespace-pre-wrap leading-relaxed">{item.answer}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/app/practice/${encodeURIComponent(item.subject)}/${encodeURIComponent(item.question)}`, { state: { topic: item.question, subject: item.subject } })}
                      className="mt-4 inline-flex items-center gap-2 text-primary font-black text-sm hover:text-white transition-colors"
                    >
                      {t('Create practice drill')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
