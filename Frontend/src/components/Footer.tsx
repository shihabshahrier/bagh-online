export function Footer() {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-cyan-300/20 bg-gradient-to-b from-slate-950/80 to-slate-900/90 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-radial from-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐯</span>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-200 to-cyan-100 bg-clip-text text-transparent">
                  Bagh Online
                </h3>
                <p className="text-xs text-slate-400">বাংলায় কোডিং শিখুন</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              বাঘ ল্যাং দিয়ে বাংলা ভাষায় প্রোগ্রামিং শেখার সবচেয়ে সহজ প্ল্যাটফর্ম।
              কোড লিখুন, চালান এবং মজা করে শিখুন!
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">দ্রুত লিংক</h4>
            <nav className="flex flex-col gap-2">
              <a href="/" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                <span>🏠</span> হোম
              </a>
              <a href="/learn" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                <span>📚</span> শিখুন
              </a>
              <a href="/playground" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                <span>⚡</span> প্লেগ্রাউন্ড
              </a>
              <a href="/challenges" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                <span>🎯</span> চ্যালেঞ্জ
              </a>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">যোগাযোগ</h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:hey@shahriarlabs.com"
                className="text-sm text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
                aria-label="Contact us via email"
              >
                <span>📧</span> hey@shahriarlabs.com
              </a>
            </div>

            {/* Stats */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-lg">🚀</span>
                <span>বাংলা প্রোগ্রামিং এর নতুন যুগ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-cyan-300/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <p className="text-slate-400">
              © {new Date().getFullYear()} Bagh Online — All rights reserved
            </p>
            <p className="text-slate-500">
              Developed with <span className="text-rose-400">❤️</span> by{" "}
              <a
                href="https://shahriarlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium"
              >
                Shahriar Labs
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
