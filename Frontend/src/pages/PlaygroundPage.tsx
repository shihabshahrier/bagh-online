import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";

import { lessons } from "../data/lessons";
import {
  ApiError,
  assistWithBagh,
  buildAssetUrl,
  checkHealth,
  executeBagh,
  translateBagh,
} from "../lib/api";

const tabs = [
  { key: "stdout" as const, label: "আউটপুট" },
  { key: "translate" as const, label: "পাইথন অনুবাদ" },
];

export function PlaygroundPage() {
  const logoUrl = buildAssetUrl("bagh_logo.png");
  const [selectedSample, setSelectedSample] = useState(lessons[0]?.id ?? "");
  const [code, setCode] = useState(lessons[0]?.sections[0]?.code?.bagh ?? "");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("stdout");
  const [translation, setTranslation] = useState("");
  const [output, setOutput] = useState<{ stdout: string; stderr: string | null; duration: number; status: "success" | "error" | "timeout" } | null>(null);
  const [assistantMessage, setAssistantMessage] = useState("কোড লিখে চালাও, আমি পাশে আছি!");
  const [assistantPrompt, setAssistantPrompt] = useState("এই কোডটি বুঝিয়ে দাও");

  const health = useQuery({ queryKey: ["health"], queryFn: checkHealth, refetchInterval: 30000 });

  const translate = useMutation({
    mutationFn: translateBagh,
    onSuccess: (data) => {
      setTranslation(data.translated);
      setActiveTab("translate");
    },
    onError: (error: unknown) => setTranslation(getErrorMessage(error)),
  });

  const execute = useMutation({
    mutationFn: executeBagh,
    onSuccess: (data) => {
      setOutput({
        stdout: data.stdout,
        stderr: data.stderr,
        duration: data.duration_ms,
        status: data.status,
      });
      if (data.translated) setTranslation(data.translated);
      setActiveTab("stdout");
    },
    onError: (error: unknown) => {
      setOutput({ stdout: "", stderr: getErrorMessage(error), duration: 0, status: "error" });
      setActiveTab("stdout");
    },
  });

  const assistant = useMutation({
    mutationFn: () => assistWithBagh(assistantPrompt, code),
    onSuccess: (data) => setAssistantMessage(data.message),
    onError: (error: unknown) => setAssistantMessage(getErrorMessage(error)),
  });

  useEffect(() => {
    const stored = localStorage.getItem("bagh:lastSnippet");
    if (stored) {
      setCode(stored);
      setSelectedSample("custom");
      localStorage.removeItem("bagh:lastSnippet");
    }
  }, []);

  const status = useMemo(() => {
    if (health.isFetching) return "সিঙ্ক হচ্ছে";
    if (health.isError) return "অফলাইন";
    if (health.data?.status === "ok") return "অনলাইন";
    return "অজানা";
  }, [health.data, health.isError, health.isFetching]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Header with Enhanced Design */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden flex flex-col gap-4 sm:gap-6 p-6 sm:p-8"
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={logoUrl}
              alt="Bagh Lang"
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl border-2 border-cyan-300/40 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-2 shadow-lg shadow-cyan-500/20"
            />
          </motion.div>
          <div className="flex-1 space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-200 via-cyan-100 to-purple-200 bg-clip-text text-transparent">
              প্লেগ্রাউন্ড — কোড লিখো, চালাও, শিখো
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              বাম দিকের এডিটরে কোড লিখে <span className="text-cyan-300 font-semibold">`কোড চালাও`</span> বাটনে চাপলেই ফলাফল ডান পাশে দেখা যাবে।
              পাঠ থেকে নেওয়া উদাহরণ লোড করতে নিচের তালিকা থেকে নির্বাচন করো।
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`chip ${status === "অনলাইন" ? "bg-green-500/20 text-green-200 border-green-400/30" : "bg-slate-700/50 text-slate-300"}`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status === "অনলাইন" ? "bg-green-400 animate-pulse" : "bg-slate-400"}`} />
                সার্ভার: {status}
              </motion.span>
              <span className="chip bg-cyan-500/20 text-cyan-200 border-cyan-400/30">
                🎯 অনুশীলন করে শেখা
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column - Code Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 sm:space-y-4"
        >
          {/* Editor Header */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-cyan-100 bg-clip-text text-transparent">
                কোড এডিটর
              </h2>
              <p className="text-sm text-slate-400">বাংলায় কোড লিখে সরাসরি চালিয়ে ফলাফল দেখো।</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <select
                className="rounded-full border border-cyan-300/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 px-4 py-2.5 text-slate-100 hover:border-cyan-300/50 focus:border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                value={selectedSample}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedSample(value);
                  const lesson = lessons.find((item) => item.id === value);
                  const sample = lesson?.sections.find((section) => section.code)?.code?.bagh;
                  if (sample) setCode(sample);
                }}
              >
                <option value="custom">নিজের কোড</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => execute.mutate(code)}
                className="btn-primary relative overflow-hidden group"
                disabled={execute.isPending}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {execute.isPending ? "⚡ চালানো হচ্ছে…" : "▶️ কোড চালাও"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => translate.mutate(code)}
                className="btn-ghost group"
                disabled={translate.isPending}
              >
                <span className="flex items-center gap-2">
                  {translate.isPending ? "🔄 অনুবাদ হচ্ছে…" : "🔤 অনুবাদ দেখো"}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Code Editor Textarea */}
          <motion.div
            whileHover={{ boxShadow: "0 0 20px rgba(34, 211, 238, 0.15)" }}
            className="relative group"
          >
            <textarea
              className="glass-panel h-80 w-full resize-y border-2 border-cyan-300/20 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-4 font-mono text-sm text-slate-100 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all rounded-2xl"
              value={code}
              spellCheck={false}
              onChange={(event) => setCode(event.target.value)}
              placeholder="এখানে তোমার বাঘ কোড লিখো… 🐯"
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-500">
              {code.split('\n').length} লাইন
            </div>
          </motion.div>

          {/* AI Assistant Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel relative overflow-hidden space-y-3 p-5 border border-purple-500/20"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent">
                AI কো-পাইলট
              </h3>
              <span className="ml-auto text-xs text-slate-400 chip bg-purple-500/10">Beta</span>
            </div>
            <textarea
              className="h-20 w-full rounded-xl border border-purple-300/20 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-3 text-sm text-slate-100 focus:border-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={assistantPrompt}
              onChange={(event) => setAssistantPrompt(event.target.value)}
              placeholder="কোড সম্পর্কে প্রশ্ন করো..."
            />
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => assistant.mutate()}
              className="btn-ghost w-full sm:w-auto bg-gradient-to-r from-purple-500/10 to-cyan-500/10 hover:from-purple-500/20 hover:to-cyan-500/20 border-purple-400/20"
              disabled={assistant.isPending || !assistantPrompt.trim()}
            >
              {assistant.isPending ? "🧠 ভাবছে…" : "💬 উত্তর চাই"}
            </motion.button>
            <motion.div
              layout
              className="rounded-xl border border-purple-300/15 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 min-h-[80px]"
            >
              <pre className="whitespace-pre-wrap break-words font-body text-sm text-slate-200 leading-relaxed">
                {assistantMessage}
              </pre>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Column - Output Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel relative overflow-hidden flex flex-col gap-4 p-5 border-2 border-cyan-300/20"
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.key
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 shadow-lg shadow-cyan-500/10 border border-cyan-400/30"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
            {output && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="chip bg-green-500/20 text-green-200 border-green-400/30"
              >
                ⚡ {output.duration.toFixed(1)} ms
              </motion.span>
            )}
          </div>

          <motion.div
            layout
            className="flex-1 min-h-[220px] rounded-xl border-2 border-cyan-300/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-4 overflow-auto"
          >
            {activeTab === "stdout" ? (
              output ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 sm:space-y-3 font-mono text-xs sm:text-sm"
                >
                  {output.stdout ? (
                    <div className="relative">
                      <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-green-500 to-cyan-500 rounded-full" />
                      <pre className="whitespace-pre-wrap break-words text-green-100 leading-relaxed pl-3">
                        {output.stdout}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">📭 (কোন আউটপুট নেই)</p>
                  )}
                  {output.stderr && (
                    <div className="relative mt-4">
                      <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-rose-500 to-orange-500 rounded-full" />
                      <pre className="whitespace-pre-wrap break-words text-rose-300 leading-relaxed pl-3 bg-rose-500/5 rounded-lg p-3 border border-rose-500/20">
                        ❌ {output.stderr}
                      </pre>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <span className="text-4xl opacity-50">🎯</span>
                  <p className="text-sm text-slate-400">আউটপুট দেখতে কোড চালাও</p>
                </div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {translation ? (
                  <div className="relative">
                    <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-purple-100 leading-relaxed pl-3">
                      {translation}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <span className="text-4xl opacity-50">🔤</span>
                    <p className="text-sm text-slate-400">অনুবাদ দেখতে অনুবাদ বোতামে চাপ দিন</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.payload?.detail && typeof error.payload.detail === "string") {
      return error.payload.detail;
    }
    return `${error.message} (${error.status})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "অপ্রত্যাশিত একটি ত্রুটি ঘটেছে।";
}

export default PlaygroundPage;
