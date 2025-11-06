import { useMemo, useState } from "react";

import type { PracticeItem } from "../data/lessons";

type PracticePanelProps = {
  practice: PracticeItem[];
};

type AnswerState = {
  [practiceId: string]: {
    selected: number | null;
    correct: boolean;
  };
};

export function PracticePanel({ practice }: PracticePanelProps) {
  const [answers, setAnswers] = useState<AnswerState>({});

  const solvedCount = useMemo(
    () => Object.values(answers).filter((record) => record.correct).length,
    [answers],
  );

  const handleAnswer = (item: PracticeItem, index: number) => {
    const correct = index === item.answerIndex;
    setAnswers((prev) => ({
      ...prev,
      [item.id]: { selected: index, correct },
    }));
  };

  return (
    <div className="glass-panel p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg sm:text-xl font-semibold text-cyan-100">🧠 অনুশীলন</h3>
        <span className="chip text-xs">{solvedCount}/{practice.length} সম্পন্ন</span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {practice.map((item) => {
          const record = answers[item.id];
          const isCorrect = record?.correct;
          return (
            <div
              key={item.id}
              className={`rounded-xl sm:rounded-2xl border border-cyan-300/15 bg-slate-900/70 p-4 sm:p-5 transition ${isCorrect ? "border-emerald-300/40 shadow-glow" : ""
                }`}
            >
              <p className="font-semibold text-sm sm:text-base text-slate-100">{item.question}</p>
              <div className="mt-2.5 sm:mt-3 grid gap-2 sm:grid-cols-2">
                {item.options.map((option, index) => {
                  const isSelected = record?.selected === index;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(item, index)}
                      disabled={isCorrect}
                      className={`rounded-lg sm:rounded-xl border px-3 sm:px-4 py-2 text-left text-xs sm:text-sm transition ${isSelected
                          ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                          : "border-cyan-300/20 bg-slate-900/60 hover:border-cyan-200/50"
                        }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {record && (
                <div
                  className={`mt-2.5 sm:mt-3 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${isCorrect
                      ? "bg-emerald-400/10 text-emerald-200"
                      : "bg-rose-400/10 text-rose-200"
                    }`}
                >
                  {isCorrect ? (
                    <>
                      <p className="font-semibold">{item.success}</p>
                      <p>{item.explanation}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">আবার চেষ্টা করো!</p>
                      <p>{item.explanation}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PracticePanel;
