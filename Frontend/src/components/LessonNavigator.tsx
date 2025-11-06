import type { Lesson } from "../data/lessons";

type LessonNavigatorProps = {
  lessons: Lesson[];
  activeLessonId: string;
  onSelect: (lessonId: string) => void;
};

export function LessonNavigator({ lessons, activeLessonId, onSelect }: LessonNavigatorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="section-title text-base sm:text-xl">🎒 পাঠ তালিকা</h2>
      <div className="grid gap-2.5 sm:gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const isActive = lesson.id === activeLessonId;
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onSelect(lesson.id)}
              className={`flex w-full flex-col items-start gap-2 rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-3 sm:p-4 text-left transition hover:border-cyan-200/60 hover:-translate-y-0.5 ${isActive ? "border-cyan-300/70 shadow-glow" : ""
                }`}
            >
              <span className="text-xl sm:text-2xl" aria-hidden> {lesson.mascot} </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-cyan-100">{lesson.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300">কঠিনতা: {lesson.level}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LessonNavigator;
