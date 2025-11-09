# 🚀 Deployment Guide

**Bagh Online** is production-ready and can be deployed to various platforms. This guide covers common deployment scenarios.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

1. ✅ All tests pass: `./scripts/run_all_tests.sh`
2. ✅ Frontend builds successfully: `npm run build` (creates `Frontend/dist/`)
3. ✅ Backend environment configured: `Backend/app/.env`
4. ✅ Production database configured (if using persistence)
5. ✅ Monitoring/logging set up

---

## 🐳 Option 1: Docker Compose (Recommended for Quick Start)

### Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose installed

### Setup

1. **Create `docker-compose.yml` in project root:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./Backend/app
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO
      - BAGH_API_PORT=8000
      - CORS_ALLOW_ORIGINS=http://localhost:3000,https://yourdomain.com
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8000
      - VITE_APP_NAME=Bagh Online
    depends_on:
      - backend
    restart: unless-stopped
```

2. **Create `Backend/app/Dockerfile`:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
```

3. **Create `Frontend/Dockerfile`:**

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

4. **Create `Frontend/nginx.conf`:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* ^.+\.(js|css|png|jpg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

5. **Deploy:**

```bash
docker-compose up -d --build
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health: http://localhost:8000/health

---

## ☁️ Option 2: Railway.app (Easy Cloud Deployment)

### Prerequisites

- Railway account (https://railway.app)
- GitHub repository with this project
- CLI: `npm install -g @railway/cli`

### Steps

1. **Push to GitHub**

2. **Connect Railway to GitHub**

```bash
railway link
```

3. **Create backend service**

```bash
railway service add backend
railway variables set ENVIRONMENT=production \
  LOG_LEVEL=INFO \
  GEMINI_API_KEY=$GEMINI_API_KEY
railway up
```

4. **Create frontend service**

```bash
railway service add frontend
railway variables set VITE_API_BASE_URL=https://your-backend-url
railway up
```

5. **View logs**

```bash
railway logs
```

---

## 🚀 Option 3: Heroku (Legacy but Simple)

### Prerequisites

- Heroku CLI installed
- Heroku account
- GitHub connected to Heroku

### Backend Deployment

1. **Create `Procfile` in `Backend/app/`:**

```
web: gunicorn -w 4 -b 0.0.0.0:$PORT --timeout 30 app.main:app --worker-class uvicorn.workers.UvicornWorker
```

2. **Deploy:**

```bash
cd Backend/app
heroku create bagh-online-api
heroku config:set ENVIRONMENT=production \
  CORS_ALLOW_ORIGINS=https://your-frontend.herokuapp.com
git push heroku main
```

### Frontend Deployment

Use **Vercel** (recommended) or **Netlify** for simpler frontend deployment.

---

## 📦 Option 4: AWS Deployment

### Backend (Elastic Beanstalk)

```bash
cd Backend/app
eb create bagh-online-api
eb deploy
```

### Frontend (S3 + CloudFront)

```bash
cd Frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket/

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## 🔒 Security Checklist for Production

- [ ] Enable HTTPS/SSL everywhere
- [ ] Set `ENVIRONMENT=production` in backend
- [ ] Restrict `CORS_ALLOW_ORIGINS` to your domain only
- [ ] Use strong database passwords
- [ ] Enable logging and monitoring
- [ ] Set up automated backups (if using database)
- [ ] Configure firewall rules
- [ ] Enable request rate limiting
- [ ] Rotate `GEMINI_API_KEY` periodically
- [ ] Monitor resource usage (CPU, memory)

---

## 📊 Environment Variables for Production

### Backend (`Backend/app/.env`)

```env
# Application
ENVIRONMENT=production
LOG_LEVEL=WARNING
APP_NAME=Bagh Online
APP_VERSION=0.1.0

# API
BAGH_API_HOST=0.0.0.0
BAGH_API_PORT=8000
CORS_ALLOW_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Sandbox
BAGH_SANDBOX_TIMEOUT=3.0
BAGH_SANDBOX_MAX_SOURCE=6000
BAGH_SANDBOX_MAX_OUTPUT=5000
BAGH_SANDBOX_MAX_CONCURRENCY=8

# Gemini (Optional)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=Bagh Online
```

---

## 🔄 CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - run: ./scripts/run_all_tests.sh
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Deploy to production here"
```

---

## 📈 Monitoring Recommendations

1. **Logs**: Use structured logging to track requests
2. **Uptime**: Set up health check monitoring
3. **Performance**: Monitor API response times
4. **Errors**: Alert on 5xx errors or high error rates
5. **Resources**: Monitor CPU, memory, and disk usage

Recommended services:
- **Logs**: LogRocket, Datadog, Splunk
- **Monitoring**: Uptimerobot, Pingdom
- **Errors**: Sentry, Rollbar
- **APM**: New Relic, Datadog, Elastic

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs container_id

# Verify environment variables
docker exec container_id env | grep BAGH
```

### CORS errors
- Verify `CORS_ALLOW_ORIGINS` matches frontend URL
- Check browser console for exact error message
- Ensure backend is running and accessible

### Frontend can't reach backend
- Verify `VITE_API_BASE_URL` points to correct backend
- Check backend health: `curl https://your-api/health`
- Check firewall and network policies

---

## 🎯 Performance Tips

1. **Frontend**: Use CDN (Cloudflare, Cloudfront) for static assets
2. **Backend**: Use connection pooling if adding database
3. **Execution**: Increase `BAGH_SANDBOX_MAX_CONCURRENCY` if needed
4. **Caching**: Add Redis for optional caching layer
5. **Database**: Index frequently queried columns

---

## 📞 Support

For issues or questions:
- Check logs: `docker logs` or platform-specific logging
- Review this guide for common issues
- Open GitHub issue with error details
- Include environment info and reproduction steps

---

**Happy deploying! 🚀**
