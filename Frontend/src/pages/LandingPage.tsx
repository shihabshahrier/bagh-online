import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, ValidationError } from "@formspree/react";

const features = [
  {
    title: "বাংলা ভাষায় কোডিং",
    description:
      "Bagh Lang এ প্রতিটি কমান্ড বাংলায়। ছোট শিক্ষার্থীরা মায়ের ভাষায় চিন্তা করেই কোড লিখতে পারে।",
    icon: "📚",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    title: "কো-পাইলটের সহায়তা",
    description:
      "প্রশ্ন করলে Gemini কো-পাইলট উদাহরণ ও ব্যাখ্যা দিয়ে পাশে থাকে।",
    icon: "🤖",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "অনুশীলন ও চ্যালেঞ্জ",
    description:
      "প্রতিটি পাঠের শেষে প্রাণী-ভিত্তিক অনুশীলন আর আলাদা চ্যালেঞ্জ সেট।",
    icon: "🎯",
    gradient: "from-orange-500/20 to-red-500/20",
  },
];

const stats = [
  { label: "পাঠ", value: "১০+", icon: "📖" },
  { label: "চ্যালেঞ্জ", value: "১২+", icon: "🏆" },
  { label: "শিক্ষার্থী", value: "১০০০+", icon: "👨‍🎓" },
  { label: "সফলতার হার", value: "৯৫%", icon: "⭐" },
];

const faqs = [
  {
    question: "এটি কাদের জন্য?",
    answer:
      "বাংলাদেশের ১ থেকে ৫ শ্রেণির শিক্ষার্থী বা তার থেকেও ছোটদের জন্য, যারা প্রথমবার কোড শিখছে।",
  },
  {
    question: "কম্পিউটারে বিশেষ কিছু লাগবে?",
    answer: "শুধু ওয়েব ব্রাউজার। কোন আলাদা সফটওয়্যার ইনস্টল করতে হবে না।",
  },
  {
    question: "Gemini কি বাধ্যতামূলক?",
    answer: "না। Gemini বাদেও পাঠ, প্লেগ্রাউন্ড ও চ্যালেঞ্জ সবই ব্যবহার করা যায়।",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Newsletter Form Component
function NewsletterForm() {
  const [state, handleSubmit] = useForm("mgvrwpnr");

  return (
    <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center text-xl sm:text-2xl">
          📧
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200">
          সংবাদপত্রে যোগ দাও
        </h2>
      </div>

      <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
        মাসে একবার পাঠ, চ্যালেঞ্জ আর নতুন ফিচারের আপডেট চলে যায় এই নিউজলেটারে।
      </p>

      {state.succeeded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 p-4 sm:p-6 text-center"
        >
          <div className="text-3xl sm:text-4xl mb-2">✅</div>
          <p className="text-sm sm:text-base text-green-100 font-semibold">
            ধন্যবাদ! খুব তাড়াতাড়ি আমরা আপনাকে মেইল পাঠাবো।
          </p>
        </motion.div>
      ) : (
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="তোমার নাম"
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/70 px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>
          <div>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="ইমেইল ঠিকানা"
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/70 px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>
          <button
            type="submit"
            disabled={state.submitting}
            className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {state.submitting ? "পাঠানো হচ্ছে..." : "সাবস্ক্রাইব করো"}
          </button>
        </form>
      )}
    </motion.div>
  );
}

// Contact Form Component
function ContactForm() {
  const [state, handleSubmit] = useForm("meovjprr");

  return (
    <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
      {state.succeeded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 p-6 sm:p-8 text-center"
        >
          <div className="text-4xl sm:text-5xl mb-3">✅</div>
          <p className="text-base sm:text-lg text-green-100 font-semibold mb-2">
            বার্তার জন্য ধন্যবাদ!
          </p>
          <p className="text-sm text-green-200">
            আমরা দ্রুত যোগাযোগ করবো।
          </p>
        </motion.div>
      ) : (
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              placeholder="নাম"
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/70 px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>
          <div>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              placeholder="ইমেইল"
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/70 px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>
          <div>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="বার্তা লিখুন..."
              className="w-full rounded-xl sm:rounded-2xl border border-cyan-300/20 bg-slate-900/70 px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>
          <button
            type="submit"
            disabled={state.submitting}
            className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {state.submitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠাও"}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-20">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mt-2 sm:mt-4 overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[3rem] bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-purple-500/10 p-6 sm:p-8 md:p-10 lg:p-16 shadow-glow"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 items-center">
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6 z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30 border border-cyan-400/20 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-cyan-100 backdrop-blur-sm"
            >
              <span className="animate-bounce">🐯</span>
              <span className="hidden xs:inline">বাংলায় প্রথম ইন্টারঅ্যাকটিভ কোডিং পাঠশালা</span>
              <span className="xs:hidden">বাংলায় কোডিং পাঠশালা</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-100 to-purple-200">
              বাঘ ল্যাং শেখো — গল্প, খেলায় কোডিং এর বুনিয়াদ
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
              প্রাথমিক শ্রেণির শিক্ষার্থীদের জন্য তৈরি এই স্টুডিওতে আছে রঙিন গল্প, প্রাণী-পদ্যাভিত্তিক উদাহরণ,
              এবং বাংলা ভাষায় বোধগম্য ব্যাখ্যা। প্রতিটি পাঠে রয়েছে অনুশীলন ও চ্যালেঞ্জ।
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                to="/learn"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-105"
              >
                <span>এখনই শেখা শুরু করো</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/playground"
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-cyan-400/30 bg-slate-900/50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-cyan-100 backdrop-blur-sm transition-all hover:border-cyan-400/50 hover:bg-slate-900/70"
              >
                <span>সরাসরি প্লেগ্রাউন্ডে যাও</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="glass-panel p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center text-xl sm:text-2xl">
                  📚
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-100">আজকের পাঠের পদক্ষেপ</h2>
              </div>

              <ol className="space-y-3 sm:space-y-4 text-slate-200">
                {[
                  { emoji: "🐯", text: "বাঘের গল্প শুনে `লিখো` কমান্ড শিখি।" },
                  { emoji: "🐵", text: "বানর মিষ্টির মাধ্যমে ডেটা টাইপ চিনি।" },
                  { emoji: "🦉", text: "পেঁচার পাহারায় শর্ত আর লুপ অনুশীলন করি।" },
                  { emoji: "🦁", text: "সিংহের ক্লাবে গিয়ে ফাংশনের জাদু দেখি।" },
                ].map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
                  >
                    <span className="text-xl sm:text-2xl flex-shrink-0">{step.emoji}</span>
                    <span className="pt-0.5 sm:pt-1 text-sm sm:text-base">
                      <span className="font-semibold text-cyan-200">{index + 1}.</span> {step.text}
                    </span>
                  </motion.li>
                ))}
              </ol>

              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-base sm:text-lg">✨</span>
                  <span>
                    প্রতিটি ধাপে প্লেগ্রাউন্ডে গিয়ে কোড চালিয়ে দাও, আর প্রশ্ন থাকলে কো-পাইলটকে জিজ্ঞেস করো।
                  </span>
                </p>
              </div>
            </div>

            {/* Floating logo */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-8 -right-8 hidden lg:block"
            >
              <img src="/bagh_logo.png" alt="Bagh Logo" className="w-32 h-32 drop-shadow-2xl opacity-90" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="glass-panel p-4 sm:p-5 md:p-6 text-center transform hover:scale-105 transition-transform duration-300"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">{stat.icon}</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200 mb-3 sm:mb-4 px-4">
            কেন বাঘ ল্যাং?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            বাংলা ভাষায় প্রোগ্রামিং শেখার সবচেয়ে সহজ এবং মজার উপায়
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`glass-panel h-full p-5 sm:p-6 md:p-8 relative overflow-hidden group`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-cyan-100 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Newsletter & FAQ Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="grid gap-6 sm:gap-8 lg:grid-cols-2"
      >
        {/* Newsletter */}
        <NewsletterForm />

        {/* FAQ */}
        <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center text-xl sm:text-2xl">
              ❓
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200">
              প্রশ্নোত্তর
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group space-y-2 sm:space-y-3 rounded-xl sm:rounded-2xl border border-cyan-300/15 bg-slate-900/50 p-4 sm:p-5 transition-all hover:bg-slate-900/70 hover:border-cyan-300/30"
              >
                <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-semibold text-cyan-100">
                  <span className="pr-2">{faq.question}</span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-cyan-300/10">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="glass-panel p-6 sm:p-8 md:p-10 lg:p-12"
      >
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 items-center">
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-400/20 to-red-400/20 border border-orange-400/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-200">
              <span>🤝</span>
              <span>আমাদের সাথে যুক্ত হন</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-purple-200">
              যোগাযোগ ও সহায়তা
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
              শিক্ষকদের জন্য প্রশিক্ষণ, স্কুলে সেটআপ অথবা নতুন আইডিয়া থাকলে আমাদের লিখুন। আমরা সবসময় আপনার পাশে আছি!
            </p>

            <div className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-base text-slate-300">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-400/10 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                  📧
                </div>
                <a href="mailto:hey@shahriarlabs.com" className="hover:text-cyan-300 transition-colors break-all">
                  hey@shahriarlabs.com
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-400/10 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                  💬
                </div>
                <span className="text-xs sm:text-sm md:text-base">সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দিই</span>
              </div>
            </div>
          </motion.div>

          <ContactForm />
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[3rem] bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 p-8 sm:p-10 md:p-12 lg:p-16 text-center"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
        </div>

        <motion.div variants={itemVariants} className="relative z-10 space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 px-4">
            আজই শুরু করো তোমার কোডিং যাত্রা
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed px-4">
            হাজারো শিক্ষার্থী ইতিমধ্যে বাঘ ল্যাং দিয়ে প্রোগ্রামিং শিখছে। তুমিও যুক্ত হও!
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2 sm:pt-4 px-4">
            <Link
              to="/learn"
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-2xl shadow-cyan-500/50 transition-all hover:shadow-cyan-500/60 hover:scale-110"
            >
              <span>প্রথম পাঠ শুরু করো</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

export default LandingPage;
