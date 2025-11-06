import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LessonContent from "../components/LessonContent";
import LessonNavigator from "../components/LessonNavigator";
import PracticePanel from "../components/PracticePanel";
import { defaultLessonId, lessons } from "../data/lessons";

export function LearnPage() {
  const navigate = useNavigate();
  const [activeLessonId, setActiveLessonId] = useState(defaultLessonId);
  const [toast, setToast] = useState<string | null>(null);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="glass-panel space-y-2 sm:space-y-3 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-100">পাঠশালা — ধাপে ধাপে কোড শিখি</h1>
        <p className="text-sm sm:text-base text-slate-300">
          প্রতিটি পাঠে প্রাণীর গল্প, সহজ ব্যাখ্যা, এবং বাংলা + পাইথন উদাহরণ রয়েছে। শেষ অংশে অনুশীলন করলে
          ধারণা আরও শক্ত হবে।
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-200">
          <span className="chip">৬টি মৌলিক পাঠ</span>
          <span className="chip">বাংলা অনুবাদসহ উদাহরণ</span>
        </div>
        {toast && (
          <div className="rounded-xl sm:rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-emerald-200">
            {toast}
          </div>
        )}
      </header>

      <LessonNavigator lessons={lessons} activeLessonId={activeLesson.id} onSelect={setActiveLessonId} />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
        <LessonContent lesson={activeLesson} onLoadToEditor={handleSendToPlayground} />
        <PracticePanel practice={activeLesson.practice} />
      </div>
    </div>
  );
}

export default LearnPage;
