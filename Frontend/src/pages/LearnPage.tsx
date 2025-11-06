import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import LessonContent from "../components/LessonContent";
import PracticePanel from "../components/PracticePanel";
import { defaultLessonId, lessons } from "../data/lessons";

export function LearnPage() {
  const navigate = useNavigate();
  const [activeLessonId, setActiveLessonId] = useState(defaultLessonId);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const currentIndex = lessons.findIndex((l) => l.id === activeLessonId);

  const handleSendToPlayground = (snippet: string) => {
    localStorage.setItem("bagh:lastSnippet", snippet);
    setToast("কোড প্লেগ্রাউন্ডে পাঠানো হয়েছে!");
    navigate("/playground");
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setActiveLessonId(lessons[currentIndex - 1].id);
      setSidebarOpen(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < lessons.length - 1) {
      setActiveLessonId(lessons[currentIndex + 1].id);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-purple-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📚</span>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-cyan-100 bg-clip-text text-transparent">
              পাঠশালা — ধাপে ধাপে কোড শিখি
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            প্রতিটি পাঠে প্রাণীর গল্প, সহজ ব্যাখ্যা, এবং <span className="text-cyan-300 font-semibold">বাংলা, ব্যাংলিশ ও ইংরেজি</span> তিনভাবেই কোড লিখতে পারবে।
            শেষ অংশে অনুশীলন করলে ধারণা আরও শক্ত হবে।
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="chip bg-cyan-500/20 text-cyan-200 border-cyan-400/30">
              📖 {lessons.length}টি মৌলিক পাঠ
            </span>
            <span className="chip bg-purple-500/20 text-purple-200 border-purple-400/30">
              ✨ বাংলা অনুবাদসহ
            </span>
            <span className="chip bg-green-500/20 text-green-200 border-green-400/30">
              🎯 অনুশীলন প্রশ্ন
            </span>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2"
            >
              <span className="text-xl">✅</span>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 right-4 z-50 glass-panel p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle lesson menu"
      >
        <svg className="w-6 h-6 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] glass-panel border-l border-cyan-300/20 z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-cyan-300/10 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-cyan-100">পাঠ তালিকা</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-cyan-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonId(lesson.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${lesson.id === activeLessonId
                        ? "bg-cyan-500/20 border border-cyan-400/30"
                        : "hover:bg-slate-800/50 border border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lesson.mascot}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-cyan-300">পাঠ {index + 1}</div>
                        <div className="text-sm font-semibold text-slate-100 truncate">{lesson.title}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Left Sidebar (hover to expand, no background on bar) */}
      <aside className="hidden lg:block">
        <div className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-16 hover:w-64 transition-[width] duration-300 z-40 group">
          <div className="h-full flex flex-col py-4 px-2">
            <div className="flex-1 space-y-1 overflow-y-auto">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${lesson.id === activeLessonId
                      ? "bg-cyan-500/20 border border-cyan-400/30"
                      : "hover:bg-slate-800/30"
                    }`}
                  title={lesson.title}
                >
                  <div className="w-10 h-10 flex items-center justify-center text-2xl shrink-0">
                    {lesson.mascot}
                  </div>
                  <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity text-left">
                    <div className="text-xs font-semibold text-cyan-300">পাঠ {index + 1}</div>
                    <div className="text-sm font-semibold text-slate-100 truncate">{lesson.title}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-cyan-300/10 text-center">
              <div className="text-xs text-slate-400">{currentIndex + 1} / {lessons.length}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-20">
        {/* Current Lesson Header - Simplified */}
        <div className="glass-panel p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeLesson.mascot}</span>
            <div>
              <div className="text-xs text-cyan-300 font-semibold">পাঠ {currentIndex + 1}</div>
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-100">{activeLesson.title}</h2>
            </div>
          </div>
          {/* Desktop Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === lessons.length - 1}
              className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        <motion.div
          key={activeLessonId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
            <LessonContent lesson={activeLesson} onLoadToEditor={handleSendToPlayground} />
            <PracticePanel practice={activeLesson.practice} />
          </div>

          {/* Mobile Navigation Buttons - At Bottom */}
          <div className="sm:hidden glass-panel p-4 flex items-center justify-between gap-4">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="btn-ghost flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← পূর্ববর্তী
            </button>
            <div className="text-xs text-slate-400">{currentIndex + 1}/{lessons.length}</div>
            <button
              onClick={goToNext}
              disabled={currentIndex === lessons.length - 1}
              className="btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              পরবর্তী →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LearnPage;
