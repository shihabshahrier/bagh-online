# 🐯 Bagh Online - সম্পূর্ণ প্রকল্প কাঠামো

এটি একটি সম্পূর্ণ বিবরণ **Bagh Online Cloud Studio** এর স্থাপত্য এবং সংস্থা সম্পর্কে।

## প্রকল্প ওভারভিউ

**Bagh Online** একটি শিক্ষামূলক ওয়েব প্ল্যাটফর্ম যা **Bagh Lang** (বাঘ ভাষা) শিখায়—একটি বহুভাষিক প্রোগ্রামিং ভাষা যা বাংলায় প্রথম পাঠ দেয়।

### স্তরসমূহ

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: React + Tailwind + TypeScript (Vite)         │
│  → Landing, Learn, Playground, Challenges              │
├─────────────────────────────────────────────────────────┤
│  Backend: FastAPI + Bagh Lang Interpreter              │
│  → /health, /translate, /execute, /assist              │
├─────────────────────────────────────────────────────────┤
│  Data: lessons.ts, problems.ts (বাংলা-সংরক্ষিত)      │
├─────────────────────────────────────────────────────────┤
│  External: Gemini API (ঐচ্ছিক), Bagh Lang CLI          │
└─────────────────────────────────────────────────────────┘
```

---

## ফোল্ডার কাঠামো

```
bagh-online/
├── Backend/                              # FastAPI ব্যাকএন্ড
│   ├── app/                              # মূল অ্যাপ্লিকেশন
│   │   ├── app/
│   │   │   ├── __init__.py              # সেটিংস লোডার
│   │   │   ├── main.py                   # FastAPI অ্যাপ ফ্যাক্টরি ⭐
│   │   │   ├── config.py                 # পরিবেশ কনফিগারেশন
│   │   │   ├── models.py                 # Pydantic ডেটা মডেল
│   │   │   ├── ai.py                     # Gemini ক্লায়েন্ট ⭐
│   │   │   └── sandbox.py                # কোড এক্সিকিউশন স্যান্ডবক্স ⭐
│   │   ├── context/
│   │   │   └── gemini_bagh_context.txt   # Gemini সিস্টেম প্রম্পট
│   │   ├── tests/
│   │   │   ├── test_api.py               # মৌলিক এন্ডপয়েন্ট টেস্ট
│   │   │   └── test_endpoints.py         # ব্যাপক এন্ডপয়েন্ট টেস্ট ⭐
│   │   ├── .env                          # স্থানীয় কনফিগ (Git থেকে বাদ)
│   │   ├── .env.example                  # সূচনা ফাইল
│   │   ├── pyproject.toml                # প্যাকেজ নির্ভরতা
│   │   └── README.md                     # ব্যাকএন্ড সেটআপ গাইড
│   │
│   ├── bagh-lang/                        # Bagh Lang দোকান
│   │   ├── bagh_lang/
│   │   │   ├── translator.py             # Bagh→Python অনুবাদক
│   │   │   ├── runtime.py                # এক্সিকিউশন রানটাইম
│   │   │   ├── syntax.py                 # বাক্যতত্ত্ব যাচাইকারী
│   │   │   ├── keywords.py               # শব্দকোষ ম্যাপিং
│   │   │   └── ...
│   │   ├── examples/                     # .bg নমুনা ফাইল
│   │   └── pyproject.toml
│   │
│   └── requirements.txt                  # সমস্ত নির্ভরতা
│
├── Frontend/                             # React Vite অ্যাপ
│   ├── src/
│   │   ├── pages/                        # পৃষ্ঠা উপাদান
│   │   │   ├── LandingPage.tsx           # হিরো + বৈশিষ্ট্য
│   │   │   ├── LearnPage.tsx             # পাঠ সংগঠক
│   │   │   ├── PlaygroundPage.tsx        # কোড সম্পাদক + কনসোল
│   │   │   ├── ChallengesPage.tsx        # চ্যালেঞ্জ এরিনা
│   │   │   └── NotFoundPage.tsx          # ৪০৪ পেজ
│   │   │
│   │   ├── components/                   # পুনঃব্যবহারযোগ্য উপাদান
│   │   │   ├── Header.tsx                # নেভবার
│   │   │   ├── Footer.tsx                # পাদটীকা
│   │   │   ├── SiteLayout.tsx            # মাস্টার লেআউট
│   │   │   ├── AssistantWidget.tsx       # Gemini চ্যাট উইজেট
│   │   │   ├── LessonContent.tsx         # পাঠ প্রদর্শক
│   │   │   ├── LessonNavigator.tsx       # পাঠ নির্বাচক
│   │   │   ├── PracticePanel.tsx         # অনুশীলন প্রশ্ন
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   └── GeminiContext.tsx         # Gemini প্রসঙ্গ হুক ⭐
│   │   │
│   │   ├── data/                         # বাংলা-সংরক্ষিত ডেটা
│   │   │   ├── lessons.ts                # ৬+ পাঠ + অনুশীলন ⭐
│   │   │   └── problems.ts               # চ্যালেঞ্জ সেট ⭐
│   │   │
│   │   ├── lib/
│   │   │   └── api.ts                    # API ক্লায়েন্ট
│   │   │
│   │   ├── styles/
│   │   │   └── index.css                 # Tailwind + কাস্টম ক্লাস
│   │   │
│   │   ├── hooks/                        # কাস্টম React হুক
│   │   │
│   │   ├── App.tsx                       # মাস্টার অ্যাপ + রাউটিং
│   │   ├── App.test.tsx                  # ব্যাপক ফ্রন্টএন্ড টেস্ট ⭐
│   │   ├── main.tsx                      # এন্ট্রি পয়েন্ট
│   │   ├── setupTests.ts                 # Vitest কনফিগ
│   │   └── ...
│   │
│   ├── index.html                        # HTML শেল
│   ├── package.json                      # npm নির্ভরতা
│   ├── tailwind.config.js                # Tailwind থিম
│   ├── tsconfig.json                     # TypeScript কনফিগ
│   ├── vite.config.ts                    # Vite বিল্ড কনফিগ
│   ├── .env                              # VITE_API_BASE_URL (Git থেকে বাদ)
│   ├── .env.example                      # সূচনা
│   └── postcss.config.js                 # PostCSS সেটআপ
│
├── scripts/
│   └── run_all_tests.sh                  # একীভূত পরীক্ষা ধাবক ⭐
│
├── .gitignore                            # Git উপেক্ষা নিয়ম
├── Readme.md                             # শীর্ষ-স্তর README
└── run_dev.sh                            # স্থানীয় dev স্টার্টআপ
```

---

## মূল ফাইলগুলি (⭐ চিহ্নিত)

### Backend

#### `Backend/app/app/main.py`
- **উদ্দেশ্য**: FastAPI অ্যাপ ফ্যাক্টরি, সমস্ত এন্ডপয়েন্ট
- **প্রধান ফাংশন**:
  - `create_app()` - অ্যাপ শুরু, মিডলওয়্যার, এন্ডপয়েন্ট নিবন্ধন
  - `_load_bagh_context()` - Gemini সিস্টেম প্রম্পট লোড
  - `health()` - সার্ভার হৃদস্পন্দন
  - `translate()` - Bagh→Python
  - `execute()` - স্যান্ডবক্সে চালান
  - `assist()` - Gemini AI সহায়তা
- **এন্ডপয়েন্ট**:
  ```
  GET /health
  POST /api/v1/translate
  POST /api/v1/execute
  POST /api/v1/assist
  GET /api/assets/*
  ```

#### `Backend/app/app/ai.py`
- **উদ্দেশ্য**: Gemini API ইন্টিগ্রেশন
- **ক্লাস**: `GeminiClient`
  - `__init__(settings, context)` - API কী লোড, Gemini মডেল শুরু
  - `generate(prompt, context)` - AI প্রতিক্রিয়া পান (পুনঃপ্রচেষ্টা সহ)
  - প্রতিফলিত করে: বাংলা-প্রথম প্রতিক্রিয়া

#### `Backend/app/app/sandbox.py`
- **উদ্দেশ্য**: নিরাপদ কোড এক্সিকিউশন
- **ক্লাস**: `SandboxExecutor`
  - `run(source, filename, max_source_chars)` - চালান ও ফলাফল ক্যাপচার
  - প্রক্রিয়া-অবধি কর্মী, টাইমআউট সুরক্ষা, আউটপুট ক্যাপ
- **নিরাপত্তা**:
  - সাদা তালিকা নির্মিত: `math`, `time`, `str` শুধুমাত্র
  - কোন ফাইল/নেটওয়ার্ক অ্যাক্সেস নেই
  - সর্বোচ্চ ৩ সেকেন্ড এক্সিকিউশন সময়

#### `Backend/app/tests/test_endpoints.py`
- **উদ্দেশ্য**: ব্যাপক API পরীক্ষা
- **কভার**:
  - অনুবাদ সঠিকতা
  - এক্সিকিউশন আউটপুট
  - ত্রুটি হ্যান্ডলিং (৪০০, ৪২২, ৫০৪)
  - বাংলা ইউনিকোড সামর্থ্য
  - প্রতিক্রিয়া চুক্তি বৈধতা

### Frontend

#### `Frontend/src/context/GeminiContext.tsx`
- **উদ্দেশ্য**: বৈশ্বিক Gemini AI প্রসঙ্গ
- **এক্সপোর্ট**:
  - `GeminiProvider` - প্রদানকারী উপাদান
  - `useGemini()` - হুক প্রতিটি পৃষ্ঠায় ব্যবহার করুন
- **অন্তর্ভুক্ত**:
  - `message` - বর্তমান AI প্রতিক্রিয়া
  - `isLoading` - বোঝা সংকেত
  - `error` - ত্রুটি অবস্থা
  - `ask(prompt, code)` - Gemini কল
  - `reset()` - অবস্থা পরিষ্কার

#### `Frontend/src/data/lessons.ts`
- **উদ্দেশ্য**: সমস্ত পাঠ ডেটা (শুধুমাত্র বাংলায়)
- **কাঠামো**:
  ```ts
  Lesson {
    id, title, mascot (emoji),
    level: 'সহজ' | 'মাঝারি' | 'চ্যালেঞ্জ',
    intro, goal,
    sections: [
      {
        title, description, bullets,
        code: { bagh, python, note }
      }
    ],
    practice: [
      {
        id, type: 'mcq' | 'predict',
        question, options, answerIndex,
        success, explanation
      }
    ]
  }
  ```
- **ছয়টি পাঠ**:
  1. শুরু করি লিখো দিয়ে (Print)
  2. ডেটা টাইপের জঙ্গল (Types)
  3. ভেরিয়েবলের নামকরণ (Variables)
  4. প্রশ্ন করো উত্তর পাও (I/O)
  5. শর্তের পথ (Conditionals)
  6. ফাংশনের ক্লাব (Functions)

#### `Frontend/src/data/problems.ts`
- **উদ্দেশ্য**: চ্যালেঞ্জ সমস্যা সেট
- **কাঠামো**:
  ```ts
  Challenge {
    id, title, difficulty,
    story (গল্প প্রেক্ষাপট),
    goal, starter (কোড সূচনা),
    hints: string[]
  }
  ```
- **তিনটি চ্যালেঞ্জ**:
  1. বাঘ বন্ধুদের অভিবাদন (সহজ, লুপ)
  2. ফলের হিসাব (মাঝারি, I/O)
  3. রাতের পাহারা (চ্যালেঞ্জ, শর্ত + লুপ)

#### `Frontend/src/App.test.tsx`
- **উদ্দেশ্য**: ব্যাপক ফ্রন্টএন্ড পরীক্ষা
- **কভার**:
  - রুট রেন্ডারিং
  - পাঠ/চ্যালেঞ্জ ডেটা কাঠামো
  - বাংলা ইউনিকোড সংরক্ষণ
  - API ফাংশন রপ্তানি

#### `Frontend/src/App.tsx`
- **উদ্দেশ্য**: মাস্টার অ্যাপ, রুট, প্রসঙ্গ
- **গুরুত্বপূর্ণ**: `GeminiProvider` জড়িত করে সমস্ত পৃষ্ঠায় AI সক্রিয় করে

---

## এন্ডপয়েন্ট নথি

### স্বাস্থ্য পরীক্ষা
```bash
GET /health
→ { status: "ok", timestamp, environment }
```

### অনুবাদ
```bash
POST /api/v1/translate
Body: { source: "লিখো(\"হালো\")", filename?: "prog.bg" }
→ { request_id, translated: "print(...)", duration_ms, source_char_length }
```

### এক্সিকিউট
```bash
POST /api/v1/execute
Body: { source: "লিখো(১)", filename?: "prog.bg" }
→ { 
    request_id, translated, stdout, stderr, 
    duration_ms, status: 'success' | 'error' | 'timeout' 
  }
```

### সহায়তা (Gemini)
```bash
POST /api/v1/assist
Body: { prompt: "এই কোড কী করে?", context?: "কোড স্নিপেট" }
→ { request_id, message: "বাংলা উত্তর", model: "gemini-..." }
```

---

## স্থানীয় সেটআপ

### পূর্বশর্ত
- **Python 3.10+**
- **Node.js 18+**
- **pip**, **npm** বা **pnpm**

### ব্যাকএন্ড সেটআপ

```bash
cd Backend/app
python3 -m pip install -e .
python3 -m pip install -e ../bagh-lang
cp .env.example .env
# .env-তে GEMINI_API_KEY সম্পাদনা করুন (ঐচ্ছিক)

# চালান
bagh-api
# http://localhost:8000/health এ অ্যাক্সেস করুন
```

### ফ্রন্টএন্ড সেটআপ

```bash
cd Frontend
npm install          # বা pnpm install
npm run dev          # Vite dev সার্ভার
# http://localhost:5173 খুলুন
```

### একসাথে চালান

```bash
./run_dev.sh
# ব্যাকএন্ড 8000 এ, ফ্রন্টএন্ড 5173 এ
```

---

## পরীক্ষা চালান

### সমস্ত পরীক্ষা (একীভূত)

```bash
./scripts/run_all_tests.sh
```

এটি চালায়:
- **ব্যাকএন্ড**: `pytest Backend/app/tests/`
- **ফ্রন্টএন্ড**: `npm test` (Vitest)

### আলাদা পরীক্ষা

```bash
# শুধুমাত্র ব্যাকএন্ড
cd Backend/app && pytest tests/ -v

# শুধুমাত্র ফ্রন্টএন্ড
cd Frontend && npm test
```

---

## কনফিগারেশন ফাইলগুলি

### ব্যাকএন্ড `.env`
```env
ENVIRONMENT=development
LOG_LEVEL=INFO
BAGH_API_HOST=0.0.0.0
BAGH_API_PORT=8000
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
BAGH_SANDBOX_TIMEOUT=3.0
BAGH_SANDBOX_MAX_SOURCE=6000
BAGH_SANDBOX_MAX_OUTPUT=5000
BAGH_SANDBOX_MAX_CONCURRENCY=4
GEMINI_API_KEY=                          # আপনার কী এখানে
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
GEMINI_TOP_P=0.9
GEMINI_TOP_K=40
GEMINI_MAX_OUTPUT_TOKENS=512
```

### ফ্রন্টএন্ড `.env`
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Bagh Lang Cloud
```

---

## প্রধান উপাদান

### বাংলা সংরক্ষণ
- **সমস্ত পাঠ, চ্যালেঞ্জ, বাটন পাঠ্য**: বাংলা (UTF-8)
- **ডেটা ফাইল**: `lessons.ts`, `problems.ts` হিসাবে সংরক্ষিত
- **API প্রতিক্রিয়া**: UTF-8 নিরাপদ
- **Gemini**: বাংলা/Banglish প্রতিক্রিয়া জন্য প্রম্পট করা

### Gemini ইন্টিগ্রেশন
- **বিকল্প**: API কী ছাড়াই কাজ করে (অফলাইন মোড)
- **প্রসঙ্গ**: `Backend/app/context/gemini_bagh_context.txt` থেকে লোড করা
- **সিস্টেম প্রম্পট**: Bagh syntax, keywords, teaching tone অন্তর্ভুক্ত করে

### নিরাপত্তা স্যান্ডবক্স
- **প্রক্রিয়া পৃথকীকরণ**: `multiprocessing.spawn`
- **নিষেধিত মডিউল**: শুধুমাত্র `math`, `time`, `str`
- **টাইমআউট**: ৩ সেকেন্ড (কনফিগারযোগ্য)
- **আউটপুট ক্যাপ**: ৫০০০ অক্ষর

---

## পরবর্তী পদক্ষেপ ও ভবিষ্যত ধারণা

1. **সংরক্ষণ**: Supabase/Firebase দিয়ে ব্যবহারকারী অগ্রগতি সংরক্ষণ
2. **প্রবাহিত লগ**: দীর্ঘ-চলমান প্রোগ্রামের জন্য SSE
3. **মাল্টিমোডাল AI**: Gemini সহ কণ্ঠ/চিত্র প্রতিক্রিয়া
4. **PWA**: অফলাইন-প্রথম ক্লাসরুম
5. **শিক্ষক সরঞ্জাম**: পাঠ সম্পাদনা, পরীক্ষার ট্র্যাকিং

---

## শিরোনাম

- **ভাষা প্যাকেজ**: https://github.com/shihabshahrier/bagh-lang
- **Gemini API**: https://ai.google.dev/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **React Router**: https://reactrouter.com/

---

**স্থিতি**: ✅ সক্রিয় বিকাশ  
**সংস্করণ**: 0.1.0  
**লাইসেন্স**: MIT (প্রস্তাবিত)  
**রক্ষণাবেক্ষণকারী**: Shihab Shahriar ও সম্প্রদায়
