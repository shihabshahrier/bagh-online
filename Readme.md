# 🐯 Bagh Online Cloud Studio

**বাংলায় প্রথম ইন্টারঅ্যাকটিভ কোডিং প্ল্যাটফর্ম**

An educational web platform for learning **Bagh Lang**—a bilingual programming language that teaches coding in Bangla with real-time feedback and AI-powered assistance.

![Bagh Lang Logo](Backend/bagh-lang/bagh_lang/assets/bagh_logo.png)

---

## ✨ Features

- 🇧🇩 **Bangla-First**: All lessons, challenges, and UI in Bengali
- 🐯 **Story-Driven**: Animal-based interactive lessons (tiger, monkey, owl...)
- ▶️ **Live Execution**: Write Bangla code, see instant results
- 🤖 **AI Copilot**: Gemini-powered assistance in Bengali (optional)
- 🔒 **Secure Sandbox**: Process isolation, timeout protection
- 📚 **6+ Lessons**: Print, Variables, Types, I/O, Conditions, Functions
- 🎯 **3 Challenges**: LeetCode-style coding problems

---

## 🚀 Quick Start

### Requirements
- **Python 3.10+**
- **Node.js 18+**

### Setup & Run

```bash
# Clone
git clone https://github.com/shihabshahrier/bagh-online.git
cd bagh-online

# Install Backend
cd Backend/app
python3 -m pip install -e .
python3 -m pip install -e ../bagh-lang
cp .env.example .env
# Optional: Edit GEMINI_API_KEY in .env

# Install Frontend
cd ../../Frontend
npm install

# Run Both (from root)
cd ..
./run_dev.sh
```

**Access:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/health

---

## 📂 Project Structure

```
bagh-online/
├── Backend/
│   ├── app/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py        # API endpoints
│   │   │   ├── ai.py          # Gemini integration
│   │   │   ├── sandbox.py     # Secure execution
│   │   │   └── models.py      # Pydantic schemas
│   │   └── tests/             # Pytest suite (30+ tests)
│   └── bagh-lang/             # Language core (separate package)
│
├── Frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── pages/             # 5 pages (Landing, Learn, Playground, Challenges, 404)
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Global Gemini context
│   │   └── data/
│   │       ├── lessons.ts     # 6+ lessons in Bangla
│   │       └── problems.ts    # 3 challenges
│   └── package.json
│
├── scripts/
│   └── run_all_tests.sh       # Unified test runner
│
├── DEVELOPMENT_GUIDE.md       # Developer documentation
└── PROJECT_STRUCTURE.md       # Detailed architecture
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/v1/translate` | POST | Bagh → Python translation |
| `/api/v1/execute` | POST | Secure code execution |
| `/api/v1/assist` | POST | AI assistance (requires Gemini API key) |
| `/api/assets/*` | GET | Static assets |

---

## 🧪 Testing

```bash
# Run all tests
./scripts/run_all_tests.sh

# Backend only
cd Backend/app && pytest tests/ -v

# Frontend only
cd Frontend && npm test
```

**Test Coverage:**
- Backend: 30+ test cases
- Frontend: 9+ test cases
- All tests passing ✅

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Framer Motion (animations)
- React Router (navigation)
- React Query (API state)
- Vitest (testing)

**Backend:**
- FastAPI (Python web framework)
- Bagh Lang (language interpreter)
- Google Gemini API (optional AI)
- Multiprocessing (sandboxed execution)
- Pytest (testing)

---

## 🔐 Security

- **Process Isolation**: Each execution runs in a separate process
- **Whitelist Imports**: Only safe modules (math, time) allowed
- **Timeout Protection**: 3-second execution limit
- **Output Capping**: Max 5000 characters
- **No Network Access**: Filesystem and socket access disabled
- **CORS**: Strict origin validation

---

## 📚 Documentation

- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Setup, contribution guidelines
- **[Project Structure](PROJECT_STRUCTURE.md)** - Detailed architecture

---

## 🌐 Bangla Content

### 6 Lessons (বাংলা)
1. শুরু করি লিখো দিয়ে (Print & Output)
2. ডেটা টাইপের জঙ্গল (Data Types)
3. ভেরিয়েবলের নামকরণ (Variables)
4. প্রশ্ন করো উত্তর পাও (Input/Output)
5. শর্তের পথ (Conditionals)
6. ফাংশনের ক্লাব (Functions)

### 3 Challenges (বাংলা)
1. বাঘ বন্ধুদের অভিবাদন (Easy - Loops)
2. ফলের হিসাব (Medium - Math)
3. রাতের পাহারা (Hard - Logic)

---

## 🤝 Contributing

Contributions are welcome! Please see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for details.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Built with ❤️ for Bengali-speaking learners
- Powered by Bagh Lang interpreter
- AI assistance by Google Gemini

**Status**: ✅ Production Ready  
**Version**: 0.1.0  
**Maintained by**: Shihab Shahriar & Community

---

Happy coding in Bengali! 🇧🇩✨

```
bagh-online/
├── Backend/
│   ├── bagh-lang/           # Python package (language core, CLI, GUI)
│   └── app/                 # FastAPI backend leveraging bagh_lang
└── Frontend/                # Vite + React glassmorphic studio
    ├── src/                 # UI, API hooks, styling
    └── .env(.example)       # Vite environment config
```

- **Backend:** stateless FastAPI service (`Backend/app`) with process-isolated execution, per-request metadata, and optional Gemini assistance.
- **Frontend:** immersive, neon-glass UI with live console, translation tab, AI copilot, and brand-forward theming.
- **Core language:** unchanged translator/runtime, Tkinter IDE, and CLI tooling from the original Bagh Lang project.

![Bagh Lang Logo](Backend/bagh-lang/bagh_lang/assets/bagh_logo.png)

---

## Quick Start

### 1. Backend API

```bash
cd Backend/app
python3 -m pip install -e .
python3 -m pip install -e ../bagh-lang
cp .env.example .env        # already included; edit GEMINI_API_KEY when ready
bagh-api                    # serves on http://localhost:8000
```

After dependency installs you can launch both backend and frontend in one go:

```bash
./run_dev.sh
```

Key environment knobs (`Backend/app/.env`):

| Variable | Purpose | Default |
| -------- | ------- | ------- |
| `BAGH_API_HOST` | Bind host | `0.0.0.0` |
| `BAGH_API_PORT` | Bind port | `8000` |
| `BAGH_SANDBOX_TIMEOUT` | Execution timeout (seconds) | `3.0` |
| `BAGH_SANDBOX_MAX_SOURCE` | Max source characters | `6000` |
| `GEMINI_API_KEY` | Optional Gemini key | _empty_ |

Endpoints:

- `GET /health`
- `POST /api/v1/translate`
- `POST /api/v1/execute`
- `POST /api/v1/assist` *(requires Gemini key)*
- `GET /api/assets/bagh_logo.png`

> The API imports the local `bagh-lang` package. Ensure you have it installed (`pip install -e Backend/bagh-lang`) or available on the same virtual environment.

### 2. Frontend Studio

```bash
cd Frontend
pnpm install   # or npm/yarn
pnpm run dev   # Vite dev server on http://localhost:5173
```

### 3. Tests

```bash
source .venv/bin/activate
pip install -r Backend/requirements.txt     # requires external network access
pytest Backend/app/tests
cd Frontend && npm run test
```

Environment (`Frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Bagh Lang Cloud
```

The studio proxies `/api` calls to the backend and renders the official logo from `/api/assets/bagh_logo.png`.

---

## Feature Highlights

- **Glassmorphic UI:** gradient nebula background, glass panels, and motion-enhanced controls designed for the “classroom of the future”.
- **Realtime console + translation:** run code, inspect stdout/stderr, and view generated Python side-by-side.
- **Gemini copilot (optional):** ask for explanations, get starter snippets, or translate prompts into Bagh Lang via `/api/v1/assist`.
- **Secure sandbox:** bounded concurrency, spawn-based workers, import whitelist (`math`, `time`), output caps, and fast failure timeouts.
- **Observability:** every response carries a `request_id` for log correlation, and the API emits friendly JSON error contracts.
- **Backwards compatible:** classic CLI (`bagh`), REPL, and Tkinter IDE remain available via `Backend/bagh-lang` for offline or desktop learning.
- **বাংলা পাঠশালা:** প্রাণী-পদ্যাভিত্তিক ইন্টারঅ্যাকটিভ পাঠ, গল্প এবং অনুশীলন শিশুরা যাতে গেমের মতো শিখতে পারে।

---

## Design System

- Primary palette: cyan + ultraviolet glow over deep navy (`--accent`, `--glass-bg`).
- Typography: Space Grotesk + Manrope with JetBrains Mono for code.
- Layout: responsive 3-panel grid collapsing gracefully on tablets/mobile.
- Interaction: Framer Motion micro-interactions on CTAs, scroll-mask lists, neon status chips.

---

## Security & Resilience

- **Isolation:** each execution uses `multiprocessing` (`spawn`) and terminates on timeout.
- **Limited built-ins:** no filesystem/network access; only basic math/iteration helpers and guarded `__import__`.
- **Rate guarding:** asynchronous semaphore limits concurrent runs (configurable).
- **Error handling:** structured responses with consistent schema; syntax errors mapped to 422.
- **AI fallback:** Gemini client retries with exponential backoff and degrades cleanly if SDK/key missing.

---

## Next Steps & Ideas

1. Hook in persistence (Supabase/Firebase) for saving lessons and user progress.
2. Stream execution logs over Server-Sent Events for long-running programs.
3. Expand `/api/v1/assist` with multimodal Gemini prompts (diagram or voice guidance).
4. Package the frontend as a PWA for offline-first classrooms.

---

## Credits

- Language & original toolkit by [Shihab Shahriar](https://github.com/shihabshahrier).
- Cloud architecture, sandbox hardening, and futuristic UI scaffolded in this repo revision.

Let’s keep teaching kids to code in Bangla — now from the browser, securely and beautifully. 🐯🚀
