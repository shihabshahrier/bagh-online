import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

import { challenges } from "../data/problems";
import { executeBagh, assistWithBagh, ApiError } from "../lib/api";

export function ChallengeDetailPage() {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();

    const challenge = challenges.find((c) => c.id === challengeId);

    const [code, setCode] = useState(challenge?.starter || "");
    const [output, setOutput] = useState<{ stdout: string; stderr: string | null; duration: number; status: "success" | "error" | "timeout" } | null>(null);
    const [testResults, setTestResults] = useState<boolean[]>([]);
    const [showHints, setShowHints] = useState(false);
    const [assistantMessage, setAssistantMessage] = useState("আমি এই সমস্যাটি সম্পর্কে জানি। সমস্যা বুঝতে যেকোনো প্রশ্ন করতে পারো! মনে রেখো, আমি সরাসরি সমাধান দেব না, শুধু বুঝতে সাহায্য করব। 🤓");
    const [assistantPrompt, setAssistantPrompt] = useState("");

    useEffect(() => {
        if (challenge) {
            setCode(challenge.starter);
        }
    }, [challenge]);

    const execute = useMutation({
        mutationFn: executeBagh,
        onSuccess: (data) => {
            setOutput({
                stdout: data.stdout,
                stderr: data.stderr,
                duration: data.duration_ms,
                status: data.status,
            });

            // Check test cases
            if (challenge && data.status === "success") {
                const results = challenge.testCases.map((testCase) => {
                    const actualOutput = data.stdout.trim();
                    const expectedOutput = testCase.expectedOutput.trim();
                    return actualOutput === expectedOutput;
                });
                setTestResults(results);
            }
        },
        onError: (error: unknown) => {
            setOutput({ stdout: "", stderr: getErrorMessage(error), duration: 0, status: "error" });
            setTestResults([]);
        },
    });

    const assistant = useMutation({
        mutationFn: () => {
            // Build a comprehensive context for the AI that includes the problem statement
            const problemContext = `
আমি একটি প্রোগ্রামিং চ্যালেঞ্জ সমাধান করছি। সমস্যাটি এরকম:

**সমস্যার শিরোনাম:** ${challenge?.title}
**গল্প:** ${challenge?.story}
**লক্ষ্য:** ${challenge?.goal}
**কঠিনতা:** ${challenge?.difficulty}

**ইঙ্গিত:**
${challenge?.hints.map((hint, idx) => `${idx + 1}. ${hint}`).join('\n')}

**গুরুত্বপূর্ণ নির্দেশনা:** 
- আমাকে সরাসরি সমাধান দিও না বা কোড লিখে দিও না
- শুধু সমস্যাটি বুঝতে সাহায্য করো
- ধারণা, পদ্ধতি এবং চিন্তার দিকনির্দেশনা দাও
- যদি আমি আটকে যাই, তাহলে পরবর্তী পদক্ষেপের জন্য ইঙ্গিত দাও

**আমার বর্তমান কোড:**
\`\`\`
${code}
\`\`\`

**আমার প্রশ্ন:** ${assistantPrompt}

দয়া করে আমার প্রশ্নের উত্তর দাও, কিন্তু সমাধান লিখে দিও না। শুধু বুঝতে সাহায্য করো।`;

            return assistWithBagh(problemContext, code);
        },
        onSuccess: (data) => setAssistantMessage(data.message),
        onError: (error: unknown) => setAssistantMessage(getErrorMessage(error)),
    });

    if (!challenge) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold text-cyan-100">চ্যালেঞ্জ পাওয়া যায়নি</h1>
                <button
                    onClick={() => navigate("/challenges")}
                    className="btn-primary"
                >
                    চ্যালেঞ্জ তালিকায় ফিরে যাও
                </button>
            </div>
        );
    }

    const allTestsPassed = testResults.length > 0 && testResults.every((r) => r);
    const difficultyColor = challenge.difficulty === "সহজ" ? "emerald" : challenge.difficulty === "মাঝারি" ? "amber" : "rose";

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="glass-panel p-4 sm:p-6">
                <button
                    onClick={() => navigate("/challenges")}
                    className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>চ্যালেঞ্জ তালিকায় ফিরে যাও</span>
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 mb-2">{challenge.title}</h1>
                        <p className="text-slate-300 text-sm sm:text-base mb-3">{challenge.story}</p>
                        <p className="text-cyan-200 text-sm sm:text-base">🎯 লক্ষ্য: {challenge.goal}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`chip bg-${difficultyColor}-400/10 text-${difficultyColor}-200`}>
                            {challenge.difficulty}
                        </span>
                        <span className="chip bg-purple-400/10 text-purple-200">
                            ⭐ {challenge.points} পয়েন্ট
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setShowHints(!showHints)}
                    className="mt-4 text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                    {showHints ? "ইঙ্গিত লুকাও" : "ইঙ্গিত দেখাও"} 💡
                </button>

                {showHints && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cyan-400/5 border border-cyan-400/20"
                    >
                        <p className="font-semibold text-cyan-100 text-sm mb-2">ইঙ্গিত:</p>
                        <ul className="list-disc space-y-1 pl-5 text-xs sm:text-sm text-slate-300">
                            {challenge.hints.map((hint, idx) => (
                                <li key={idx}>{hint}</li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </div>

            {/* Editor and Output */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Code Editor */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="glass-panel p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-cyan-100">কোড এডিটর</h2>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => execute.mutate(code)}
                                disabled={execute.isPending}
                                className="btn-primary text-sm"
                            >
                                {execute.isPending ? "চালানো হচ্ছে…" : "চালাও"}
                            </motion.button>
                        </div>
                        <textarea
                            className="w-full h-64 sm:h-80 rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-3 sm:p-4 font-mono text-xs sm:text-sm text-slate-100 focus:border-cyan-200 focus:outline-none resize-none"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                            placeholder="এখানে তোমার কোড লিখো…"
                        />
                    </div>

                    {/* AI Assistant */}
                    <div className="glass-panel p-4 sm:p-5 space-y-3 border-l-4 border-purple-500/50">
                        <div className="flex items-start gap-2">
                            <span className="text-2xl">🤖</span>
                            <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-purple-200">AI সহায়ক - সমস্যা বুঝতে সাহায্য</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    ⚠️ <strong>গুরুত্বপূর্ণ:</strong> AI তোমাকে সরাসরি সমাধান দেবে না। শুধু সমস্যা বুঝতে, ধারণা পেতে এবং পদ্ধতি শিখতে সাহায্য করবে।
                                </p>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-16 sm:h-20 rounded-xl sm:rounded-2xl border border-purple-300/30 bg-slate-900/70 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-100 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            value={assistantPrompt}
                            onChange={(e) => setAssistantPrompt(e.target.value)}
                            placeholder="যেমন: এই সমস্যায় লুপ কেন দরকার? বা কীভাবে শুরু করব?"
                        />
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => assistant.mutate()}
                            disabled={assistant.isPending || !assistantPrompt.trim()}
                            className="btn-ghost w-full sm:w-auto text-xs sm:text-sm bg-purple-500/10 hover:bg-purple-500/20 border-purple-400/30"
                        >
                            {assistant.isPending ? "🧠 ভাবছে…" : "💬 সাহায্য চাই"}
                        </motion.button>
                        <div className="rounded-xl sm:rounded-2xl border border-purple-300/20 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-3 sm:p-4 text-xs sm:text-sm text-slate-200 min-h-[100px]">
                            <pre className="whitespace-pre-wrap break-words font-body leading-relaxed">{assistantMessage}</pre>
                        </div>
                    </div>
                </div>

                {/* Output and Test Results */}
                <div className="space-y-3 sm:space-y-4">
                    {/* Output */}
                    <div className="glass-panel p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-cyan-100">আউটপুট</h2>
                            {output && (
                                <span className="chip text-xs">⏱️ {output.duration.toFixed(1)} ms</span>
                            )}
                        </div>
                        <div className="min-h-[180px] sm:min-h-[220px] rounded-xl sm:rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-3 sm:p-4">
                            {output ? (
                                <div className="space-y-2 sm:space-y-3 font-mono text-xs sm:text-sm text-slate-200">
                                    <pre className="whitespace-pre-wrap break-words">{output.stdout || "(কোন আউটপুট নেই)"}</pre>
                                    {output.stderr && (
                                        <pre className="whitespace-pre-wrap break-words text-rose-300">{output.stderr}</pre>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-slate-400">কোড চালিয়ে আউটপুট দেখো</p>
                            )}
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div className="glass-panel p-4 sm:p-5">
                        <h2 className="text-lg sm:text-xl font-semibold text-cyan-100 mb-3">টেস্ট কেস</h2>
                        <div className="space-y-2 sm:space-y-3">
                            {challenge.testCases.map((testCase, idx) => {
                                const passed = testResults[idx];
                                const ran = testResults.length > 0;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${ran
                                            ? passed
                                                ? "border-emerald-400/40 bg-emerald-400/5"
                                                : "border-rose-400/40 bg-rose-400/5"
                                            : "border-cyan-300/15 bg-slate-900/50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="text-xs sm:text-sm font-semibold text-slate-100">
                                                    টেস্ট #{idx + 1}: {testCase.description}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    প্রত্যাশিত: <code className="text-cyan-300">{testCase.expectedOutput.substring(0, 30)}{testCase.expectedOutput.length > 30 ? "..." : ""}</code>
                                                </p>
                                            </div>
                                            {ran && (
                                                <span className="text-lg flex-shrink-0">
                                                    {passed ? "✅" : "❌"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {allTestsPassed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 text-center"
                            >
                                <p className="text-2xl sm:text-3xl mb-2">🎉</p>
                                <p className="text-base sm:text-lg font-bold text-emerald-200">সব টেস্ট পাস!</p>
                                <p className="text-xs sm:text-sm text-slate-300 mt-1">তুমি {challenge.points} পয়েন্ট অর্জন করেছো!</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
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

export default ChallengeDetailPage;
