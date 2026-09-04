import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Sparkles, Users, FileText, CheckCircle2, Moon, Sun } from 'lucide-react';
import { getTeacherSession, setTeacherSession, getStudentRegistry, getPaperSubmissions, updatePaperSubmission, registerStudent, patchLocalStudentPerformanceIfMatch } from '../services/eduPortalStorage';
import { gradePaperSubmission } from '../services/ai';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const session = useMemo(() => getTeacherSession(), []);
  const allSubs = getPaperSubmissions();
  
  const filteredSubs = useMemo(() => {
    return allSubs.filter(s => s.board === session?.board);
  }, [allSubs, session]);

  const [subs, setSubs] = useState(filteredSubs);
  const [gradingId, setGradingId] = useState<string | null>(null);

  if (!session) {
    navigate('/teacher-login', { replace: true });
    return null;
  }

  const students = getStudentRegistry().filter(s => s.board === session.board);

  const logout = () => {
    setTeacherSession(null);
    navigate('/teacher-login');
  };

  const gradeOne = async (id: string) => {
    const row = subs.find((s) => s.id === id);
    if (!row || row.status === 'graded') return;
    setGradingId(id);
    try {
      const { score, maxScore, feedback } = await gradePaperSubmission({
        subject: row.subject,
        board: row.board,
        totalMarks: row.totalMarks,
        questions: row.questionsSnapshot,
        studentAnswerText: row.studentAnswerText || row.attachmentNames.join('\n'),
      });
      updatePaperSubmission(id, {
        status: 'graded',
        score,
        maxScore,
        feedback,
        gradedAt: new Date().toISOString(),
      });
      const reg = getStudentRegistry();
      registerStudent({
        email: row.studentEmail,
        name: row.studentName,
        grade: row.grade,
        board: row.board,
        lastSeen: new Date().toISOString(),
        performance: reg.find((u) => u.email.toLowerCase() === row.studentEmail.toLowerCase())?.performance,
      });
      patchLocalStudentPerformanceIfMatch(row.studentEmail, score, maxScore);
      setSubs(getPaperSubmissions().filter(s => s.board === session.board));
    } finally {
      setGradingId(null);
    }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-10 max-w-6xl mx-auto transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">{t('Staff Portal')}</p>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase">
              {session.board}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">{session.name}</h1>
          <p className="text-white/60 mt-1 font-medium italic">{session.email}</p>
        </div>
        <div className="flex gap-3">
          <motion.button 
            onClick={toggleTheme}
            className="p-3 text-white/60 hover:bg-white/10 rounded-2xl transition-colors border border-white/5"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
          <Link to="/" className="px-4 py-3 rounded-2xl border border-white/10 text-sm font-black hover:bg-white/5">{t('Home')}</Link>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 font-black text-sm hover:bg-white/20">
            <LogOut className="w-4 h-4" /> {t('Logout')}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-white">{t('Assigned Students')} ({session.board})</h2>
          </div>
          <p className="text-white/50 text-sm mb-4">{t('Only showing students from your assigned board.')}</p>
          <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
            {students.length === 0 ? (
              <p className="text-white/40 text-sm italic">{t('No students registered for this board yet.')}</p>
            ) : (
              students.map((s) => (
                <div key={s.email} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm hover:border-primary/30 transition-all">
                  <p className="font-black text-white text-base">{s.name}</p>
                  <p className="text-white/50">{s.email}</p>
                  <p className="text-white/40 text-xs mt-1 uppercase tracking-wider font-bold">{s.grade} · {s.board}</p>
                  {s.performance && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                      <div>
                        <p className="text-[10px] text-white/30 uppercase font-black">{t('Accuracy')}</p>
                        <p className="text-primary font-black">{s.performance.averageScore}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase font-black">{t('Units Done')}</p>
                        <p className="text-white font-black">{s.performance.topicsCompleted}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-white">{t('Board Submissions')}</h2>
          </div>
          <div className="space-y-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-2">
            {subs.length === 0 ? (
              <p className="text-white/40 text-sm italic">{t('No submissions received for this board yet.')}</p>
            ) : (
              subs.map((s) => (
                <motion.div layout key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm space-y-3">
                  <div className="flex justify-between gap-2 items-start">
                    <div>
                      <span className="font-black text-white text-base block">{s.studentName}</span>
                      <span className="text-white/40 text-[10px] uppercase font-bold">{s.studentEmail}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${s.status === 'graded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}>
                      {s.status === 'graded' ? t('Graded') : t('Pending')}
                    </span>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 space-y-1 border border-white/5">
                    <p className="text-white/80 font-bold">{s.subject}</p>
                    <p className="text-white/40 text-xs">{s.totalMarks} {t('Marks')} · {new Date(s.submittedAt).toLocaleDateString()}</p>
                  </div>
                  {s.status === 'graded' && (
                    <div className="pt-2">
                      <p className="text-primary font-black text-lg">{t('Score')}: {s.score}/{s.maxScore}</p>
                    </div>
                  )}
                  {s.feedback && <p className="text-white/60 text-xs italic line-clamp-3 hover:line-clamp-none transition-all">{s.feedback}</p>}
                  {s.status === 'pending' && (
                    <button
                      type="button"
                      disabled={gradingId === s.id}
                      onClick={() => gradeOne(s.id)}
                      className="w-full py-3 rounded-xl bg-primary text-black font-black text-xs hover:bg-white transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {gradingId === s.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          {t('Grading...')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          {t('Grade with AI')}
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
