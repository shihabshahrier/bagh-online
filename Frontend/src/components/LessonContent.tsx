import type { Lesson } from "../data/lessons";

type LessonContentProps = {
  lesson: Lesson;
  onLoadToEditor: (code: string) => void;
};

export function LessonContent({ lesson, onLoadToEditor }: LessonContentProps) {
  return (
    <article className="space-y-4 sm:space-y-6">
      <div className="glass-panel p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="text-3xl sm:text-4xl flex-shrink-0" aria-hidden>{lesson.mascot}</span>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-semibold text-cyan-100">{lesson.title}</h3>
            <p className="mt-2 text-sm sm:text-base text-slate-300">{lesson.intro}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 sm:px-4 py-1 text-xs sm:text-sm text-cyan-200">
              🎯 লক্ষ্য: {lesson.goal}
            </div>
          </div>
        </div>
      </div>

      {lesson.sections.map((section) => (
        <div key={section.title} className="glass-panel space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-cyan-100">{section.title}</h4>
            <p className="mt-2 text-sm sm:text-base text-slate-200">{section.description}</p>
          </div>
          {section.bullets && (
            <ul className="list-disc space-y-0.5 sm:space-y-1 pl-5 sm:pl-6 text-xs sm:text-sm text-slate-300">
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.code && (
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="chip text-xs">Bagh Lang</span>
                  <button
                    type="button"
                    onClick={() => onLoadToEditor(section.code!.bagh)}
                    className="text-xs sm:text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline"
                  >
                    এডিটরে পাঠাও
                  </button>
                </div>
                <pre className="code-block mt-2 text-xs sm:text-sm">{section.code.bagh}</pre>
              </div>
              <div>
                <span className="chip text-xs">Python</span>
                <pre className="code-block mt-2 text-xs sm:text-sm">{section.code.python}</pre>
              </div>
              <p className="lg:col-span-2 text-xs sm:text-sm text-slate-300">💡 {section.code.note}</p>
            </div>
          )}
        </div>
      ))}
    </article>
  );
}

export default LessonContent;
