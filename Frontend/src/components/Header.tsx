import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", label: "হোম" },
  { to: "/playground", label: "প্লেগ্রাউন্ড" },
  { to: "/learn", label: "পাঠশালা" },
  { to: "/challenges", label: "চ্যালেঞ্জ" },
];

export function Header() {
  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-30 mx-2 sm:mx-6 md:mx-10 lg:mx-14 mt-2 sm:mt-4 border-b border-cyan-300/10 bg-slate-950/70 backdrop-blur-xl rounded-2xl shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold text-cyan-100 hover:text-cyan-200 transition-colors group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {/* Flash effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 blur-xl opacity-0 group-hover:opacity-60"
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
              {/* Roar pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-orange-400"
                animate={{
                  scale: [1, 1.8, 1.8],
                  opacity: [0.8, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
              <motion.img
                src="/bagh_logo.png"
                alt="Bagh Lang Logo"
                className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 object-contain relative z-10"
                animate={{
                  filter: [
                    "brightness(1) drop-shadow(0 0 0px rgba(251, 146, 60, 0))",
                    "brightness(1.3) drop-shadow(0 0 8px rgba(251, 146, 60, 0.8))",
                    "brightness(1) drop-shadow(0 0 0px rgba(251, 146, 60, 0))",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            </motion.div>
            <span className="hidden sm:inline">বাঘ ল্যাং স্টুডিও</span>
            <span className="sm:hidden">বাঘ ল্যাং</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2 md:gap-3 text-xs sm:text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 transition ${isActive
                    ? "bg-cyan-400/20 text-cyan-100"
                    : "text-slate-200 hover:bg-cyan-400/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Fixed to bottom */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-cyan-300/20 px-2 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive
                  ? "text-cyan-200 bg-cyan-500/20 scale-110"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <motion.span
                className="text-xl"
                whileTap={{ scale: 0.9 }}
              >
                {item.to === "/" ? "🏠" : item.to === "/playground" ? "⚡" : item.to === "/learn" ? "📚" : "🎯"}
              </motion.span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export default Header;
