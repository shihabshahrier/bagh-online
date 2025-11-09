# 🚀 Quick Reference Card

## 📋 Development Commands

```bash
# Run everything (dev mode)
./run_dev.sh

# Run tests only
./scripts/run_all_tests.sh

# Frontend development
cd Frontend && npm run dev

# Backend development
cd Backend/app && python3 -m uvicorn app.main:create_app --factory --reload

# Frontend build
cd Frontend && npm run build

# Frontend linting
cd Frontend && npm run lint
```

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server health check |
| `/api/v1/translate` | POST | Bagh → Python translation |
| `/api/v1/execute` | POST | Sandboxed code execution |
| `/api/v1/assist` | POST | AI assistance (requires Gemini API key) |
| `/api/v1/assets/*` | GET | Static assets (logo, images) |

## 📦 Environment Variables

### Backend (`.env`)
```
ENVIRONMENT=production|development
LOG_LEVEL=INFO|DEBUG
BAGH_API_PORT=8000
CORS_ALLOW_ORIGINS=http://localhost:5173,https://yourdomain.com
BAGH_SANDBOX_TIMEOUT=3.0
GEMINI_API_KEY=your_key_here (optional)
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Bagh Online
```

## 🎯 Deployment Quick Start

### Docker Compose
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Railway
```bash
railway link
railway up
```

### Heroku
```bash
heroku create bagh-online-api
git push heroku main
```

## 🧪 Test Coverage

- **Backend**: 30 tests
  - Health checks
  - Translation accuracy
  - Execution safety
  - Error handling
  - Bangla Unicode support

- **Frontend**: 9 tests
  - Component rendering
  - Navigation
  - Data validation
  - Bangla text handling

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Backend Tests | 30/30 ✅ |
| Frontend Tests | 9/9 ✅ |
| Bundle Size | 126 KB |
| Build Time | 986 ms |
| ESLint Status | ✅ Pass |
| Code Coverage | Comprehensive |

## 📁 Key Files

```
Root Files:
├── Readme.md                 (main documentation)
├── PRODUCTION_CHECKLIST.md   (readiness guide)
├── DEPLOYMENT.md             (deployment options)
├── PRODUCTION_READY.md       (cleanup summary)

Backend:
├── Backend/app/.env.example  (configuration template)
├── Backend/app/app/main.py   (FastAPI application)
├── Backend/app/tests/        (comprehensive tests)

Frontend:
├── Frontend/.env.example     (configuration)
├── Frontend/package.json     (dependencies)
├── Frontend/src/App.tsx      (main component)
├── Frontend/dist/            (production build)
```

## 🔒 Security Features

✅ Process-isolated execution  
✅ Import whitelisting (math, time only)  
✅ 3-second timeout protection  
✅ Output capping (5000 chars)  
✅ CORS validation  
✅ Environment variables secured  

## 🐛 Common Issues

**CORS Error?**
- Check `CORS_ALLOW_ORIGINS` matches your domain
- Verify backend is running

**Build fails?**
- Run `npm install` in Frontend/
- Check `npm run build` output

**Tests fail?**
- Run `./scripts/run_all_tests.sh`
- Check Python/Node versions

**API not responding?**
- Check backend is running: `curl http://localhost:8000/health`
- Verify port configuration

## 📚 Learning Resources

**Bagh Language Docs**
- Bengali first programming language
- Teaches coding concepts
- Process-isolated execution

**Frontend Stack**
- React 18 + TypeScript
- Vite for fast builds
- TailwindCSS for styling

**Backend Stack**
- FastAPI for API
- Pydantic for validation
- Multiprocessing for sandboxing

## 🎯 Next Steps

1. ✅ Read `Readme.md` for overview
2. ✅ Review `PRODUCTION_CHECKLIST.md` for readiness
3. ✅ Choose deployment option in `DEPLOYMENT.md`
4. ✅ Configure `.env` files
5. ✅ Deploy and monitor

## 📞 Support

- **Issues**: Check DEPLOYMENT.md troubleshooting section
- **Questions**: See Readme.md FAQ
- **Details**: Review PRODUCTION_CHECKLIST.md

---

**Status**: ✅ Production Ready  
**Version**: 0.1.0  
**Date**: November 9, 2025
