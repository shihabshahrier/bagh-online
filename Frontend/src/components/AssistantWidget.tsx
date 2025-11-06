import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

import { assistWithBagh, ApiError } from "../lib/api";

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("আজ কী শিখবো?");
  const [context, setContext] = useState<string>("");
  const [message, setMessage] = useState<string>("গুড নাইট! প্রশ্ন করলে আমি সাহায্য করবো।");

  const mutation = useMutation({
    mutationFn: () => assistWithBagh(prompt, context || undefined),
    onSuccess: (data) => {
      setMessage(data.message);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setMessage(error.payload?.detail?.toString() ?? error.message);
      } else if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("ওহ! কিছুর সাথে সমস্যা হয়েছে। আবার চেষ্টা করো।");
      }
    },
  });

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 sm:gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-[calc(100vw-2rem)] sm:w-80 space-y-2.5 sm:space-y-3 rounded-2xl sm:rounded-3xl border border-cyan-300/20 bg-slate-950/95 p-3.5 sm:p-4 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-cyan-100">🧞‍♀️ বাঘ কো-পাইলট</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-300 hover:text-cyan-200"
              >
                বন্ধ করো
              </button>
            </div>
            <textarea
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-100 focus:border-cyan-200 focus:outline-none"
              rows={3}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="যেমন: লুপ কীভাবে কাজ করে?"
            />
            <textarea
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/10 bg-slate-900/60 p-2 text-xs text-slate-200 focus:border-cyan-200/40 focus:outline-none"
              rows={2}
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="ইচ্ছা হলে এখানে কোড বা প্রসঙ্গ লিখে দাও"
            />
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={!prompt.trim() || mutation.isPending}
              className="btn-primary w-full text-xs sm:text-sm"
            >
              {mutation.isPending ? "ভাবছে…" : "উত্তর চাই"}
            </button>
            <div className="rounded-xl sm:rounded-2xl border border-cyan-300/10 bg-slate-900/70 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-200 max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words font-body text-xs sm:text-sm">
                {message}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn-primary shadow-glow text-xs sm:text-sm px-4 sm:px-5 py-2"
      >
        {open ? "সহায়ক লুকাও" : "কো-পাইলটকে ডাকো"}
      </motion.button>
    </div>
  );
}

export default AssistantWidget;
