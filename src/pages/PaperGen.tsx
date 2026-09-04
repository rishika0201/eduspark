import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Settings,
  Plus,
  X,
  Clock,
  Shield,
  Sparkles,
  Printer,
  FileDown,
  Upload,
  Lock,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { useStudent } from '../contexts/StudentContext';
import { useLanguage, outputLanguageName } from '../contexts/LanguageContext';
import { syllabusData } from '../data/syllabus';
import { generateQuestionPaper } from '../services/ai';
import { cleanAIOutput } from '../utils/helpers';
import { jsPDF } from 'jspdf';
import { getPaperSubmissions, savePaperSubmission, type PaperSubmission } from '../services/eduPortalStorage';

type GeneratedPaper = {
  header?: {
    title?: string;
    board?: string;
    subject?: string;
    totalMarks?: number;
    duration?: number;
  };
  sections?: Array<{
    title: string;
    marks?: number;
    questions: string[];
  }>;
  answerKey?: string;
};

const MARK_PRESETS = [
  { marks: 50, time: 90, label: '1.5 Hours' },
  { marks: 80, time: 180, label: '3 Hours' },
  { marks: 100, time: 210, label: '3.5 Hours' },
];

const getTopicName = (topic: string | { name: string }) => typeof topic === 'string' ? topic : topic.name;

export default function PaperGen() {
  const { studentInfo } = useStudent();
  const { t, language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<GeneratedPaper | null>(null);
  const [answerNotes, setAnswerNotes] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [submitMsg, setSubmitMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [mySubs, setMySubs] = useState<PaperSubmission[]>([]);
  const [config, setConfig] = useState({
    subject: 'Mathematics',
    board: studentInfo?.board || 'CBSE',
    chapters: [] as string[],
    customTopic: '',
    totalMarks: 80,
    time: 180,
  });

  const paperRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const grade = studentInfo?.grade || 'Class 10';
  const board = studentInfo?.board || 'CBSE';
  
  const syllabus = useMemo(() => {
    const boardData = syllabusData[board] || syllabusData['CBSE'];
    return boardData[grade] || boardData['Class 10'];
  }, [board, grade]);

  const subjects = Object.keys(syllabus);
  const currentSubject = syllabus[config.subject] ? config.subject : subjects[0];
  const availableChapters = syllabus[currentSubject]?.units.flatMap(unit => unit.topics.map(getTopicName)) || [];

  const refreshMySubs = () => {
    const email = studentInfo?.email?.toLowerCase();
    if (!email) {
      setMySubs([]);
      return;
    }
    setMySubs(getPaperSubmissions().filter((s) => s.studentEmail.toLowerCase() === email));
  };

  useEffect(() => {
    refreshMySubs();
  }, [studentInfo?.email]);

  const handleGenerate = async () => {
    if (config.chapters.length === 0 && !config.customTopic.trim()) return;
    setIsGenerating(true);
    setSubmitMsg('');
    setIsSubmitted(false);
    setShowKey(false);
    try {
      const paper = await generateQuestionPaper({
        board: config.board,
        subject: config.subject,
        chapters: config.chapters.length ? config.chapters : [config.customTopic.trim() || 'General'],
        totalMarks: config.totalMarks,
        duration: config.time,
        customInstructions: config.customTopic.trim() || undefined,
        outputLanguage: outputLanguageName(language),
      });
      setGeneratedPaper({
        ...paper,
        sections: paper.sections?.map((section: any) => ({
          ...section,
          questions: section.questions.map((q: string) => cleanAIOutput(q)),
        })),
      });
    } catch (error) {
      console.error('Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const flatQuestions = (paper: GeneratedPaper | null): string[] => {
    if (!paper?.sections) return [];
    return paper.sections.flatMap((sec) =>
      (sec.questions || []).map((q) => `[${sec.marks || 1} marks] ${q}`),
    );
  };

  const submitToTeacher = () => {
    setSubmitMsg('');
    if (!studentInfo?.email) {
      setSubmitMsg(t('Student login'));
      return;
    }
    if (!generatedPaper?.sections?.length) {
      setSubmitMsg(t('Assemble Paper'));
      return;
    }
    const questionsSnapshot = flatQuestions(generatedPaper);
    const sub: PaperSubmission = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`,
      studentEmail: studentInfo.email,
      studentName: studentInfo.name,
      grade: studentInfo.grade,
      subject: config.subject,
      board: config.board,
      totalMarks: config.totalMarks,
      durationMin: config.time,
      chapters: config.chapters,
      questionsSnapshot,
      studentAnswerText: answerNotes,
      attachmentNames: uploadFiles.map((f) => f.name),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    savePaperSubmission(sub);
    setAnswerNotes('');
    setUploadFiles([]);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    setSubmitMsg(t('Submission sent'));
    setIsSubmitted(true);
    refreshMySubs();
  };

  const handleDownloadPDF = () => {
    if (!generatedPaper) return;
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 30;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const title = generatedPaper.header?.title || t('SCHOOL EXAMINATION 2025-26');
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(12);
    doc.text(`${generatedPaper.header?.board || config.board} - ${t(config.subject)}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Marks and Time
    doc.setFontSize(10);
    doc.text(`${t('Time')}: ${config.time} ${t('Minutes')}`, margin, currentY);
    doc.text(`${t('Maximum Marks')}: ${config.totalMarks}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 5;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;

    // Sections
    generatedPaper.sections?.forEach((section) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(section.title, margin, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      section.questions.forEach((q, idx) => {
        const text = `${idx + 1}. ${q}`;
        const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - 20);
        
        if (currentY + (lines.length * 5) > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.text(lines, margin, currentY);
        if (section.marks) {
          doc.text(`(${section.marks})`, pageWidth - margin, currentY, { align: 'right' });
        }
        currentY += (lines.length * 5) + 5;
      });
      currentY += 5;
    });

    doc.save(`${config.subject}_Paper.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#050505] text-white/80 overflow-hidden font-sans">
      {/* Sidebar - Pro Config */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-[420px] bg-black border-r border-white/5 p-8 flex flex-col overflow-y-auto z-20 custom-scrollbar"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">{t('PaperGen.')}</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{t('Advanced Exam Factory')}</p>
          </div>
        </div>

        <div className="space-y-8 flex-1">
          {/* Custom Topic / Instructions */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{t('Custom topic label')}</label>
            <textarea
              value={config.customTopic}
              onChange={(e) => setConfig({ ...config, customTopic: e.target.value })}
              placeholder={t('Custom topic placeholder')}
              className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-medium text-white outline-none focus:border-primary/50 transition-all resize-none h-24"
            />
          </div>

          {/* Subject Selection */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{t('Subject Area')}</label>
             <div className="grid grid-cols-2 gap-2">
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => setConfig({ ...config, subject: s })}
                    className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                      config.subject === s 
                        ? 'bg-primary text-black border-primary' 
                        : 'bg-white/5 border-white/5 text-white/80 hover:border-white/10'
                    }`}
                  >
                    {t(s)}
                  </button>
                ))}
             </div>
          </div>

          {/* Marks & Time Presets */}
          <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{t('Exam Presets')}</span>
            </div>
            <div className="space-y-2">
              {MARK_PRESETS.map((p) => (
                <button
                  key={p.marks}
                  onClick={() => setConfig({ ...config, totalMarks: p.marks, time: p.time })}
                  className={clsx(
                    "w-full p-4 rounded-2xl border flex justify-between items-center transition-all",
                    config.totalMarks === p.marks 
                      ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(74,222,128,0.2)]" 
                      : "bg-white/5 border-white/5 text-white/60 hover:border-white/10"
                  )}
                >
                  <div className="text-left">
                    <p className="font-black text-sm">{p.marks} {t('Marks')}</p>
                    <p className={clsx("text-[9px] font-bold uppercase", config.totalMarks === p.marks ? "text-black/60" : "text-white/30")}>
                      {p.label}
                    </p>
                  </div>
                  {config.totalMarks === p.marks && <Sparkles className="w-4 h-4 text-black" />}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{t('Chapters Selection')}</label>
            <div className="flex flex-wrap gap-2">
              {config.chapters.map(c => (
                <button
                  key={c}
                  onClick={() => setConfig({ ...config, chapters: config.chapters.filter(i => i !== c) })}
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  {c} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {availableChapters.filter(c => !config.chapters.includes(c)).slice(0, 4).map(c => (
                <button
                  key={c}
                  onClick={() => setConfig({ ...config, chapters: [...config.chapters, c] })}
                  className="text-left px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[11px] font-medium text-white/70 hover:text-white hover:border-white/20 transition-all flex items-center justify-between group"
                >
                  {c} <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{t('Upload answers')}</p>
            <input
              ref={uploadInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={(e) => setUploadFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-xs font-bold text-white/80 hover:border-primary/40 hover:text-primary transition-all"
            >
              <Upload className="w-4 h-4" />
              {uploadFiles.length ? uploadFiles.map((f) => f.name).join(', ') : t('Choose answer files')}
            </button>
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 block">{t('Answer notes')}</label>
            <textarea
              value={answerNotes}
              onChange={(e) => setAnswerNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-medium text-white outline-none focus:border-primary/50 transition-all resize-none h-28"
            />
            <button
              type="button"
              onClick={submitToTeacher}
              disabled={!generatedPaper?.sections?.length || isSubmitted}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-primary hover:text-black hover:border-primary transition-all disabled:opacity-40"
            >
              {isSubmitted ? t('Submitted Successfully') : t('Submit to teacher')}
            </button>
            {submitMsg ? <p className="text-[11px] text-primary font-medium">{submitMsg}</p> : null}
          </div>

          {/* Answer Key - Unlocks after submission */}
          {generatedPaper && (
            <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{t('Solution Guide')}</span>
                  </div>
                  {!isSubmitted && <Lock className="w-3 h-3 text-white/20" />}
               </div>
               
               {!isSubmitted ? (
                 <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                    <p className="text-[10px] font-bold text-white/30 uppercase leading-relaxed">
                      {t('Unlock the full answer key by submitting your response above.')}
                    </p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="w-full py-3 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                    >
                      {showKey ? t('Hide Solutions') : t('Reveal Answer Key')}
                    </button>
                    <AnimatePresence mode="popLayout">
                      {showKey && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-xs text-white/70 leading-relaxed font-sans max-h-96 overflow-y-auto whitespace-pre-wrap">
                            {generatedPaper.answerKey}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               )}
            </div>
          )}
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating || (config.chapters.length === 0 && !config.customTopic.trim())}
          className="mt-8 w-full bg-primary text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(74,222,128,0.2)] disabled:opacity-50 transition-all"
        >
          {isGenerating ? <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin"></div> : <><Sparkles className="w-5 h-5" /> {t('Assemble Paper')}</>}
        </motion.button>
      </motion.aside>

      {/* Preview Area - White Paper Aesthetic */}
      <main className="flex-1 bg-black p-6 lg:p-12 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#4ADE80]"></div>
                <h3 className="text-xs font-black text-white tracking-widest uppercase opacity-60">{t('Examination Blueprint')}</h3>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-white/40 hover:text-primary transition-colors" title={t('Print')}>
                   <Printer className="w-4 h-4" />
                </button>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase text-white hover:text-primary transition-all">
                   <FileDown className="w-4 h-4" /> {t('Export PDF')}
                </button>
             </div>
          </div>

          {mySubs.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('My graded papers')}</h4>
              <ul className="space-y-2 text-xs text-white/70">
                {mySubs.slice(0, 8).map((s, idx) => (
                  <li key={s.id || `sub-${idx}`} className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2">
                    <span>{t(s.subject)} · {new Date(s.submittedAt).toLocaleString()}</span>
                    <span className="text-primary font-bold">
                      {s.status === 'graded' && s.score != null
                        ? `${s.score}/${s.maxScore ?? s.totalMarks}`
                        : t(s.status === 'graded' ? 'Graded' : 'Pending')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ScrollReveal direction="up" delay={0.1}>
            {/* The "White Paper" */}
            <div 
              ref={paperRef}
              className="bg-white text-black min-h-[1122px] w-full rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-12 lg:p-20 relative font-serif selection:bg-primary/20"
            >
              {/* Subtle Paper Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>
              
              <div className="relative z-10">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-16 border-b-2 border-black pb-8">
                  <h1 className="text-3xl font-bold uppercase tracking-tight">{generatedPaper?.header?.title || t('SCHOOL EXAMINATION 2025-26')}</h1>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-base font-bold uppercase tracking-widest">{generatedPaper?.header?.board || config.board} - {t(config.subject)}</p>
                    <p className="text-[10px] uppercase font-bold text-black/60 italic tracking-tighter">{t('Academic session line')}</p>
                  </div>
                  
                  <div className="flex justify-between items-end pt-6">
                    <div className="text-left">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5">{t('Time Allowed')}</p>
                      <p className="text-sm font-bold">{config.time} {t('Minutes')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5">{t('Maximum Marks')}</p>
                      <p className="text-sm font-bold">{config.totalMarks}</p>
                    </div>
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="mb-12 space-y-3 border-l-4 border-black/10 pl-6 py-2 italic">
                  <h4 className="text-xs font-bold uppercase tracking-widest not-italic">{t('General Instructions')}:</h4>
                  <ul className="text-xs space-y-1 list-disc ml-4 opacity-80 font-sans">
                    <li>{t('Paper inst compulsory')}</li>
                    <li>{t('Paper inst sections')}</li>
                    <li>{t('Paper inst marks')}</li>
                    <li>{t('Paper inst diagrams')}</li>
                  </ul>
                </div>

                {/* Question Sections */}
                <div className="space-y-12">
                  {!generatedPaper?.sections?.length ? (
                    <p className="text-center text-sm text-black/50 py-16 font-sans">{t('Paper empty hint')}</p>
                  ) : (
                  generatedPaper.sections.map((section, sIdx) => (
                    <div key={`${sIdx}-${section.title}`} className="space-y-8">
                      <div className="flex items-center justify-between border-y border-black/5 py-2">
                        <h2 className="text-base font-black uppercase tracking-[0.2em]">{section.title}</h2>
                        {section.marks && <span className="text-[10px] font-bold italic opacity-60">[{section.questions.length} × {section.marks} Marks]</span>}
                      </div>
                      
                      <div className="space-y-8">
                        {section.questions.map((q, qIdx) => (
                          <div key={`${qIdx}-${q.slice(0, 30)}`} className="group flex justify-between gap-6">
                            <div className="flex-1">
                              <p className="text-base leading-relaxed text-black/90">
                                <span className="font-bold mr-3">{qIdx + 1}.</span>
                                {q}
                              </p>
                            </div>
                            {section.marks && (
                              <div className="shrink-0 pt-1">
                                <span className="text-sm font-bold">({section.marks})</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )))}
                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-black/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">{t('End of Question Paper')}</p>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.02]">
                <h2 className="text-9xl font-black whitespace-nowrap tracking-tighter">{t('Official watermark')}</h2>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        @media print {
          .lg\\:w-\\[420px\\], button, .opacity-60 {
            display: none !important;
          }
          main {
            padding: 0 !important;
            background: white !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          .bg-white {
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
