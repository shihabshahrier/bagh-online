import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { challenges } from "../data/problems";

type FilterType = "সব" | "সহজ" | "মাঝারি" | "চ্যালেঞ্জ";

export function ChallengesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("সব");

  const filteredChallenges = useMemo(() => {
    if (filter === "সব") return challenges;
    return challenges.filter((c) => c.difficulty === filter);
  }, [filter]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "সহজ":
        return "emerald";
      case "মাঝারি":
        return "amber";
      case "চ্যালেঞ্জ":
        return "rose";
      default:
        return "cyan";
    }
  };

  const stats = {
    total: challenges.length,
    easy: challenges.filter((c) => c.difficulty === "সহজ").length,
    medium: challenges.filter((c) => c.difficulty === "মাঝারি").length,
    hard: challenges.filter((c) => c.difficulty === "চ্যালেঞ্জ").length,
    totalPoints: challenges.reduce((sum, c) => sum + c.points, 0),
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="glass-panel space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-100 mb-2">চ্যালেঞ্জ এরিনা</h1>
            <p className="text-sm sm:text-base text-slate-300">
              পাঠে শেখা ধারণাগুলো শক্ত করতে এখানে রয়েছে {stats.total}টি চ্যালেঞ্জ। প্রতিটি সমস্যা সমাধান করে পয়েন্ট অর্জন করো!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <span className="chip bg-purple-400/10 text-purple-200">
              মোট পয়েন্ট: {stats.totalPoints}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cyan-400/5 border border-cyan-400/20">
            <p className="text-xs text-slate-400">মোট</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-200">{stats.total}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-400/5 border border-emerald-400/20">
            <p className="text-xs text-slate-400">সহজ</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-200">{stats.easy}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-400/5 border border-amber-400/20">
            <p className="text-xs text-slate-400">মাঝারি</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-200">{stats.medium}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-400/5 border border-rose-400/20">
            <p className="text-xs text-slate-400">চ্যালেঞ্জ</p>
            <p className="text-xl sm:text-2xl font-bold text-rose-200">{stats.hard}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-slate-300">ফিল্টার:</span>
          {(["সব", "সহজ", "মাঝারি", "চ্যালেঞ্জ"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${filter === f
                  ? "bg-cyan-400/20 text-cyan-100 border border-cyan-400/30"
                  : "bg-slate-900/50 text-slate-300 border border-cyan-300/10 hover:border-cyan-300/30"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Challenges List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredChallenges.map((challenge, index) => {
          const difficultyColor = getDifficultyColor(challenge.difficulty);

          return (
            <motion.button
              key={challenge.id}
              onClick={() => navigate(`/challenges/${challenge.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full glass-panel p-4 sm:p-6 hover:border-cyan-300/30 transition-all text-left group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {/* Number */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center text-base sm:text-lg font-bold text-cyan-100">
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-cyan-100 group-hover:text-cyan-200 transition-colors">
                      {challenge.title}
                    </h3>
                    <span className={`chip bg-${difficultyColor}-400/10 text-${difficultyColor}-200 text-xs`}>
                      {challenge.difficulty}
                    </span>
                    <span className="chip bg-purple-400/10 text-purple-200 text-xs">
                      ⭐ {challenge.points}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">{challenge.story}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>🎯 {challenge.goal.substring(0, 60)}{challenge.goal.length > 60 ? "..." : ""}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-cyan-300 group-hover:translate-x-1 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="glass-panel p-8 sm:p-12 text-center">
          <p className="text-lg text-slate-300">এই ফিল্টারে কোন চ্যালেঞ্জ নেই</p>
        </div>
      )}
    </div>
  );
}

export default ChallengesPage;
