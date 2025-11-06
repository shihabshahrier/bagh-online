# 🛠️ Bagh Online - উন্নয়ন গাইড

এই গাইড **Bagh Online** এ অবদান রাখার জন্য ধাপে ধাপে নির্দেশ প্রদান করে।

---

## দ্রুত শুরু

### প্রয়োজনীয়তা
- **macOS/Linux/Windows** (zsh/bash সুপারিশকৃত)
- **Python 3.10+**, **Node.js 18+**
- **Git**, **Docker** (ঐচ্ছিক)

### সেটআপ (৫ মিনিট)

```bash
# ক্লোন করুন
git clone https://github.com/shihabshahrier/bagh-online.git
cd bagh-online

# ব্যাকএন্ড সেটআপ
cd Backend/app
python3 -m pip install -e .
python3 -m pip install -e ../bagh-lang
cp .env.example .env
# GEMINI_API_KEY সম্পাদনা করুন (ঐচ্ছিক)

# ফ্রন্টএন্ড সেটআপ
cd ../../Frontend
npm install

# চালান
cd ..
./run_dev.sh
```

**কাজ করছে!** 
- ব্যাকএন্ড: http://localhost:8000/health
- ফ্রন্টএন্ড: http://localhost:5173

---

## আর্কিটেকচার

### স্তরস্থাপনা

```
Frontend (React + Tailwind)
    ↓↓ API কল (/api/v1/*)
Backend (FastAPI)
    ↓↓ Bagh Lang → Python
Bagh Lang Translator + Runtime
    ↓↓ exec() (স্যান্ডবক্স)
Stdout/Stderr ক্যাপচার
```

### কী ধারণা

#### ফ্রন্টএন্ড
- **রাউটিং**: React Router (5 পৃষ্ঠা)
- **অবস্থা**: React Query + Context (Gemini)
- **স্টাইলিং**: Tailwind + কাস্টম CSS (glass effects)
- **সমস্ত পাঠ**:  `src/data/lessons.ts` থেকে এক্সট্র্যাক্ট করা
- **স্থানীয় স্টোরেজ**: Playground স্নিপেট সংরক্ষণ করে

#### ব্যাকএন্ড
- **FastAPI স্ট্যাটলেস**: কোনও ডাটাবেস নেই
- **স্যান্ডবক্স**: প্রতিটি চালানে নতুন প্রক্রিয়া
- **Bagh Lang**: `translator.py` দ্বারা অনুবাদ, `runtime.py` দ্বারা এক্সিকিউট করা
- **Gemini**: ঐচ্ছিক, প্রসঙ্গ সহ প্রম্পট করা

---

## ফ্রন্টএন্ড উন্নয়ন

### নতুন উপাদান যুক্ত করা

```typescript
// src/components/MyComponent.tsx
import { motion } from "framer-motion";

export function MyComponent() {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold text-cyan-100">আমার উপাদান</h2>
      <motion.button
        whileHover={{ scale: 1.02 }}
        className="btn-primary mt-4"
      >
        ক্লিক করো
      </motion.button>
    </div>
  );
}
```

### স্টাইলিং

**Tailwind** প্রধান। কাস্টম ক্লাস `src/styles/index.css` এ:

```css
.btn-primary {
  @apply rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 
         px-4 py-2 font-semibold text-slate-950 
         transition hover:from-cyan-300 hover:to-cyan-400;
}

.glass-panel {
  @apply rounded-3xl border border-cyan-300/20 
         bg-slate-950/70 backdrop-blur-xl;
}
```

### পাঠ যুক্ত করা

`src/data/lessons.ts` সম্পাদনা করুন:

```typescript
export const lessons: Lesson[] = [
  // ... বিদ্যমান
  {
    id: "new-topic",
    title: "নতুন বিষয়",
    mascot: "🦁",
    level: "সহজ",
    intro: "এই পাঠে আমরা... শিখবো।",
    goal: "লক্ষ্য: ...",
    sections: [
      {
        title: "অধ্যায় ১",
        description: "ব্যাখ্যা",
        code: {
          bagh: `লিখো("বাংলা")`,
          python: `print("বাংলা")`,
          note: "নোট"
        }
      }
    ],
    practice: [
      {
        id: "q1",
        type: "mcq",
        question: "প্রশ্ন?",
        options: ["A", "B", "C"],
        answerIndex: 0,
        success: "সঠিক!",
        explanation: "কারণ..."
      }
    ]
  }
];
```

### পরীক্ষা লেখা

`src/MyFeature.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders Bangla text", () => {
    render(<MyComponent />);
    expect(screen.getByText(/বাংলা/)).toBeInTheDocument();
  });
});
```

চালান:
```bash
npm test
```

### সাধারণ সমস্যা

| সমস্যা | সমাধান |
|--------|--------|
| Tailwind ক্লাস কাজ করছে না | `npx tailwindcss -i ./src/styles/index.css` চালান |
| API 404 | `.env` `-তে `VITE_API_BASE_URL` যাচাই করুন |
| বিল্ড ব্যর্থ | `npm install` পুনরায় চালান, `node_modules` সাফ করুন |

---

## ব্যাকএন্ড উন্নয়ন

### নতুন এন্ডপয়েন্ট যুক্ত করা

`Backend/app/app/main.py`:

```python
@app.post("/api/v1/my-endpoint", response_model=MyResponse)
async def my_endpoint(payload: MyRequest, request: Request) -> MyResponse:
    request_id = request.state.request_id
    # যুক্তি
    return MyResponse(
        request_id=request_id,
        data="ফলাফল"
    )
```

নতুন মডেল `Backend/app/app/models.py`:

```python
class MyRequest(BaseModel):
    input: str

class MyResponse(BaseResponse):
    data: str
```

### পরীক্ষা লেখা

`Backend/app/tests/test_my_feature.py`:

```python
from fastapi.testclient import TestClient
from app.main import create_app

client = TestClient(create_app())

def test_my_endpoint():
    response = client.post(
        "/api/v1/my-endpoint",
        json={"input": "টেস্ট"}
    )
    assert response.status_code == 200
    assert "টেস্ট" in response.json()["data"]
```

চালান:
```bash
cd Backend/app && pytest tests/ -v
```

### Bagh Lang ইন্টিগ্রেশন

বাগ ভাষা কোড চালান:

```python
from bagh_lang.translator import translate_bagh_to_python
from bagh_lang.runtime import run_bagh_code

# অনুবাদ
code = 'লিখো("বাংলা")'
python_code = translate_bagh_to_python(code)

# রান
try:
    result = run_bagh_code(code)
    print(result.translated)
except Exception as e:
    print(f"Error: {e}")
```

### সাধারণ সমস্যা

| সমস্যা | সমাধান |
|--------|--------|
| Import ত্রুটি | `pip install -e .` পুনরায় চালান |
| Gemini ব্যর্থ | `.env` `-তে API কী যাচাই করুন |
| পরীক্ষা ব্যর্থ | `pytest tests/ -vv` সম্পূর্ণ ট্রেসব্যাক দেখতে |

---

## অনুবাদ & স্থানীয়করণ

### বাংলা পাঠ্য নির্দেশিকা

- **শিরোনাম**: `# বড় শিরোনাম` (সংক্ষিপ্ত, স্পষ্ট)
- **বর্ণনা**: পূর্ণ বাক্য, বয়স-বান্ধব
- **কোড মন্তব্য**: ইনলাইন বাংলা ব্যাখ্যা সহ
- **ত্রুটি বার্তা**: বন্ধুত্বপূর্ণ, পরামর্শমূলক

উদাহরণ:
```python
# খারাপ
# Error

# ভালো
# ত্রুটি: সংজ্ঞায়িত নয়। নাম চেক করুন বা `নাম = মান` দিয়ে শুরু করুন।
```

### ইমোজি ব্যবহার

পাঠের জন্য খেলোয়াড়:
- 🐯 বাঘ (প্রিন্ট)
- 🐵 বানর (ডেটা টাইপ)
- 🦊 শিয়াল (ভেরিয়েবল)
- 🐼 পান্ডা (I/O)
- 🦉 পেঁচা (শর্ত)
- 🦁 সিংহ (ফাংশন)

---

## পরীক্ষা কৌশল

### সম্পূর্ণ পরীক্ষা স্যুট চালান

```bash
./scripts/run_all_tests.sh
```

এটি চালায়:
1. ব্যাকএন্ড (`pytest Backend/app/tests/`)
2. ফ্রন্টএন্ড (`npm test`)
3. লিন্টিং (সংক্ষিপ্ত চেক)

### একক পরীক্ষা ফাইল

```bash
# ব্যাকএন্ড
pytest Backend/app/tests/test_endpoints.py::TestTranslateEndpoint::test_translate_valid_bagh_code -v

# ফ্রন্টএন্ড
npm test -- App.test.tsx
```

### মক Gemini প্রতিক্রিয়া

`test_endpoints.py`:
```python
@patch("app.ai.genai.GenerativeModel")
def test_assist_with_mock(mock_model):
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "বাংলা উত্তর"
    mock_instance.generate_content.return_value = mock_response
    mock_model.return_value = mock_instance
    # টেস্ট...
```

---

## স্থাপনা প্রক্রিয়া

### পূর্ব-স্থাপনা চেক তালিকা

- [ ] সমস্ত পরীক্ষা পাস হয় (`./scripts/run_all_tests.sh`)
- [ ] বাংলা পাঠ্য সঠিকভাবে প্রদর্শিত হয়
- [ ] Gemini (যদি সক্ষম) প্রতিক্রিয়া জানায়
- [ ] নিরাপত্তা স্যান্ডবক্স নিষিদ্ধ মডিউল ব্লক করে
- [ ] এনভায়রনমেন্ট ভেরিয়েবল সঠিক

### স্থানীয় বিল্ড

```bash
# ফ্রন্টএন্ড
cd Frontend && npm run build
# → dist/ এ আউটপুট

# ব্যাকএন্ড (ঐচ্ছিক ডকার)
docker build -t bagh-api Backend/app/
docker run -p 8000:8000 bagh-api
```

### সার্ভারে স্থাপন (নির্দেশিকা)

1. **ফ্রন্টএন্ড**: Vercel/Netlify এ `npm run build` → `dist/` সরবরাহ করুন
2. **ব্যাকএন্ড**: Railway/Render এ Gunicorn সহ FastAPI চালান:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:create_app --env-file .env
   ```
3. **.env**: `CORS_ALLOW_ORIGINS`, `GEMINI_API_KEY` সেট করুন

---

## অবদান নীতিমালা

### প্রক্রিয়া

1. **একটি শাখা তৈরি করুন**: `git checkout -b feature/my-feature`
2. **পরিবর্তনগুলি করুন**: কমিট করুন বর্ণনামূলক বার্তা সহ
3. **পরীক্ষা যুক্ত করুন**: নতুন কার্যকারিতা সহ
4. **সমস্ত পরীক্ষা পাস করুন**: `./scripts/run_all_tests.sh`
5. **PR খুলুন**: GitHub এ বিস্তারিত বর্ণনা সহ

### কমিট বার্তা নিয়ম

```
feat: new feature description (ফিচার ট্যাগ)
fix: bug fix description (ফিক্স ট্যাগ)
docs: documentation update (ডকুমেন্ট ট্যাগ)
test: add tests for feature (টেস্ট ট্যাগ)
chore: dependency update (কোর ট্যাগ)
```

উদাহরণ:
```
feat: add loops lesson with practice problems

- Add lesson 5 on Bangla loops (ঘুরো/বার)
- Include 3 practice MCQ questions
- Add loop visualization examples
```

---

## ডিবাগিং ইনস্পেকশন

### ব্যাকএন্ড লগ

```python
import logging
logger = logging.getLogger(__name__)
logger.info("বার্তা")
logger.warning("সতর্কতা")
logger.error("ত্রুটি")
```

চালান:
```bash
LOGLEVEL=DEBUG bagh-api
```

### ফ্রন্টএন্ড কনসোল

```typescript
console.log("মূল্য:", value);
console.warn("সতর্কতা:", issue);
console.error("ত্রুটি:", error);
```

Browser DevTools খুলুন (F12)।

### নেটওয়ার্ক পরীক্ষা

```bash
# API পরীক্ষা করুন
curl -X POST http://localhost:8000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{"source":"লিখো(১)"}'
```

---

## কর্মক্ষমতা অপ্টিমাইজেশন

### সাধারণ টিপস

1. **চিত্র অপ্টিমাইজ করুন**: Bagh লোগো সংক্ষিপ্ত করুন
2. **বান্ডেল আকার**: `npm run build` এবং `dist/` পরীক্ষা করুন
3. **API প্রতিক্রিয়া ক্যাশিং**: ধরে রাখা প্রশ্নের জন্য
4. **স্যান্ডবক্স টাইমআউট**: হ্রাস করুন যদি প্রয়োজন (`.env` → `BAGH_SANDBOX_TIMEOUT`)

---

## সহায়ক রিসোর্স

- **Bagh Lang**: https://github.com/shihabshahrier/bagh-lang
- **FastAPI**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion/

---

## পাঁচটি FAQ

**Q: কোন Python সংস্করণ প্রয়োজন?**  
A: 3.10+। `python3 --version` চেক করুন।

**Q: আমি বাংলা পাঠ্য প্রদর্শন করতে পারি না?**  
A: ফ্রন্ট নিশ্চিত করুন `package.json` মধ্যে `"postcsss"` আছে। `npm install` পুনরায় চালান।

**Q: Gemini ছাড়াই কাজ করে?**  
A: হ্যাঁ! সেট করবেন না `.env` `-তে `GEMINI_API_KEY` এবং এটি অফলাইন কাজ করে।

**Q: আমি নতুন চ্যালেঞ্জ যুক্ত করতে পারি?**  
A: হ্যাঁ, `Frontend/src/data/problems.ts` সম্পাদনা করুন।

**Q: আমি নতুন API এন্ডপয়েন্ট তৈরি করতে পারি?**  
A: হ্যাঁ, `Backend/app/app/main.py` এবং পরীক্ষায় যুক্ত করুন।

---

**সুখী অবদান! 🐯✨**
