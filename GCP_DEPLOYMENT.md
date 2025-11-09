# 🚀 GCP Deployment Guide

## Backend Deployment (Google Cloud Platform)

### Prerequisites

1. **Google Cloud SDK** installed:
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Or download from:
   https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with GCP**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable required APIs**:
   ```bash
   gcloud services enable appengine.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Create App Engine app** (one-time):
   ```bash
   gcloud app create --region=us-central
   # Choose region closest to your users
   ```

### Deploy Backend

1. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

2. **Run deployment script**:
   ```bash
   ./deploy.sh
   ```
   
   The script will:
   - Check gcloud installation
   - Verify authentication
   - Prepare deployment package
   - Prompt for Gemini API key
   - Deploy to App Engine
   - Provide the deployed URL

3. **Test deployment**:
   ```bash
   # The script will output the URL, e.g.:
   # https://YOUR_PROJECT_ID.appspot.com/health
   
   curl https://YOUR_PROJECT_ID.appspot.com/health
   ```

### Setup Custom Domain (api.bagh.shahriarlabs.com)

1. **Add custom domain in GCP Console**:
   - Go to: App Engine > Settings > Custom domains
   - Click "Add a custom domain"
   - Follow verification steps for shahriarlabs.com

2. **Add DNS records** (in your DNS provider):
   ```
   Type: CNAME
   Name: api.bagh
   Value: ghs.googlehosted.com
   TTL: 3600
   ```

3. **Enable SSL** (automatic with custom domains)

4. **Update CORS in app.yaml** before deploying:
   ```yaml
   env_variables:
     CORS_ALLOW_ORIGINS: "https://bagh-beta.shahriarlabs.com,https://api.bagh.shahriarlabs.com"
   ```

### Environment Variables

Variables are set in `app.yaml`. For sensitive data, use **Secret Manager**:

```bash
# Store secret
echo -n "YOUR_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

# Grant App Engine access
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member=serviceAccount:YOUR_PROJECT_ID@appspot.gserviceaccount.com \
    --role=roles/secretmanager.secretAccessor
```

Then update `app.yaml`:
```yaml
env_variables:
  GEMINI_API_KEY: ${GEMINI_API_KEY}
```

### Monitoring & Logs

```bash
# View logs
gcloud app logs tail -s default

# Open in browser
gcloud app logs read

# View in Console
https://console.cloud.google.com/logs
```

### Update Deployment

```bash
# Make changes, then redeploy
./deploy.sh
```

### Rollback

```bash
# List versions
gcloud app versions list

# Switch traffic
gcloud app versions migrate VERSION_ID
```

---

## Frontend Deployment (Cloudflare Pages)

### Prerequisites

1. **Cloudflare account** with domain configured
2. **Wrangler CLI** (optional):
   ```bash
   npm install -g wrangler
   ```

### Manual Deployment

1. **Build frontend**:
   ```bash
   cd Frontend
   
   # Update .env with backend URL
   echo "VITE_API_BASE_URL=https://api.bagh.shahriarlabs.com" > .env
   echo "VITE_APP_NAME=Bagh Online" >> .env
   
   # Build
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   - Go to: Cloudflare Dashboard > Pages
   - Click "Create a project"
   - Choose "Upload assets"
   - Upload the `dist/` folder
   - Set custom domain: `bagh-beta.shahriarlabs.com`

### Automated Deployment (GitHub)

1. **Connect GitHub repository**:
   - Cloudflare Dashboard > Pages > "Connect to Git"
   - Authorize GitHub
   - Select repository: `bagh-online`

2. **Configure build settings**:
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: Frontend
   ```

3. **Set environment variables**:
   ```
   VITE_API_BASE_URL=https://api.bagh.shahriarlabs.com
   VITE_APP_NAME=Bagh Online
   ```

4. **Deploy**:
   - Push to main branch → auto-deploys
   - Or click "Retry deployment"

### Custom Domain Setup

1. **Add custom domain** in Cloudflare Pages:
   - Project > Custom domains
   - Add: `bagh-beta.shahriarlabs.com`
   - DNS records added automatically if using Cloudflare DNS

2. **Verify DNS**:
   ```bash
   dig bagh-beta.shahriarlabs.com
   ```

### Update Deployment

```bash
# Make changes
git add .
git commit -m "Update frontend"
git push origin main
# Auto-deploys via Cloudflare Pages
```

---

## Post-Deployment Checklist

### Backend
- [ ] Health check works: `https://api.bagh.shahriarlabs.com/health`
- [ ] CORS configured for frontend domain
- [ ] Gemini API key set (if using AI features)
- [ ] Logs flowing to Cloud Logging
- [ ] Custom domain SSL certificate active

### Frontend
- [ ] Site loads: `https://bagh-beta.shahriarlabs.com`
- [ ] API calls work (check browser console)
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] SSL certificate active

### Testing
```bash
# Test backend
curl https://api.bagh.shahriarlabs.com/health

# Test translation endpoint
curl -X POST https://api.bagh.shahriarlabs.com/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{"source": "লিখো(\"হ্যালো বাঘ!\")"}'

# Test execution endpoint
curl -X POST https://api.bagh.shahriarlabs.com/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{"source": "লিখো(\"হ্যালো বাঘ!\")"}'
```

---

## Troubleshooting

### Backend Issues

**503 Service Unavailable**
- Check App Engine logs: `gcloud app logs tail`
- Verify instance class has enough resources
- Check if deployment succeeded

**CORS Errors**
- Verify `CORS_ALLOW_ORIGINS` in `app.yaml`
- Ensure frontend URL matches exactly (with https://)
- Check browser console for exact error

**Timeout Errors**
- Increase timeout in `app.yaml`: `--timeout 60`
- Check `BAGH_SANDBOX_TIMEOUT` setting
- Review slow operations in logs

**Gemini Not Working**
- Verify API key in Secret Manager or app.yaml
- Check API quota in GCP Console
- Review error logs for specific messages

### Frontend Issues

**Build Fails**
- Check build logs in Cloudflare Pages
- Verify `package.json` scripts
- Ensure all dependencies installed

**API Calls Fail**
- Check `VITE_API_BASE_URL` environment variable
- Verify backend CORS settings
- Check browser console for errors
- Test backend endpoint directly with curl

**Assets Not Loading**
- Check build output directory (`dist/`)
- Verify asset paths in code
- Check browser console for 404s

---

## Costs Estimate

### GCP App Engine
- **Free tier**: 28 instance hours/day
- **F2 instance**: ~$0.05/hour
- **Estimated**: $10-30/month for light traffic

### Cloudflare Pages
- **Free tier**: Unlimited requests, 500 builds/month
- **Estimated**: $0/month for most use cases

### Total
- **~$10-30/month** (mostly GCP App Engine)

---

## Security Best Practices

1. **Use Secret Manager** for API keys
2. **Enable Cloud Armor** for DDoS protection
3. **Set up rate limiting** in API
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated**
6. **Use HTTPS only** (automatic with custom domains)

---

## Next Steps

1. Deploy backend: `cd Backend && ./deploy.sh`
2. Configure custom domain: `api.bagh.shahriarlabs.com`
3. Build frontend: `cd Frontend && npm run build`
4. Deploy to Cloudflare Pages
5. Test everything
6. Monitor logs and performance

**Questions?** Check the troubleshooting section or GCP/Cloudflare documentation.
