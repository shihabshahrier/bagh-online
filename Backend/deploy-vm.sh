#!/usr/bin/env bash
# Deploy Bagh Online Backend to GCP Compute Engine VM

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Deploy Bagh Backend to GCP VM${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Configuration
VM_NAME="bagh-backend"
ZONE="asia-south1-a"
MACHINE_TYPE="e2-small"  # 2 vCPUs, 2GB RAM - $13/month
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No GCP project set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ VM: $VM_NAME${NC}"
echo -e "${GREEN}✓ Zone: $ZONE${NC}"
echo ""

# Check if VM exists
if gcloud compute instances describe "$VM_NAME" --zone="$ZONE" &>/dev/null; then
    echo -e "${YELLOW}VM already exists. Choose action:${NC}"
    echo "1. Update code on existing VM"
    echo "2. Delete and recreate VM"
    echo "3. Cancel"
    read -p "Choice [1-3]: " VM_ACTION
    
    case "$VM_ACTION" in
        1)
            echo -e "${CYAN}Updating existing VM...${NC}"
            ;;
        2)
            echo -e "${CYAN}Deleting existing VM...${NC}"
            gcloud compute instances delete "$VM_NAME" --zone="$ZONE" --quiet
            ;;
        3)
            exit 0
            ;;
    esac
else
    echo -e "${CYAN}Creating new VM...${NC}"
    
    # Create VM with startup script
    gcloud compute instances create "$VM_NAME" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --image-family=debian-12 \
        --image-project=debian-cloud \
        --boot-disk-size=20GB \
        --boot-disk-type=pd-standard \
        --tags=http-server,https-server \
        --metadata=startup-script='#!/bin/bash
# Install dependencies
apt-get update
apt-get install -y python3 python3-pip python3-venv git nginx supervisor
' \
        --quiet
    
    echo -e "${GREEN}✓ VM created${NC}"
    
    # Create firewall rules
    if ! gcloud compute firewall-rules describe allow-http &>/dev/null; then
        gcloud compute firewall-rules create allow-http \
            --allow tcp:80 \
            --target-tags http-server \
            --quiet
    fi
    
    if ! gcloud compute firewall-rules describe allow-https &>/dev/null; then
        gcloud compute firewall-rules create allow-https \
            --allow tcp:443 \
            --target-tags https-server \
            --quiet
    fi
    
    echo -e "${YELLOW}⏳ Waiting for VM to start (30s)...${NC}"
    sleep 30
fi

echo ""
echo -e "${BLUE}📦 Deploying application...${NC}"

# Get VM external IP
EXTERNAL_IP=$(gcloud compute instances describe "$VM_NAME" --zone="$ZONE" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")
echo -e "${CYAN}VM IP: $EXTERNAL_IP${NC}"

# Create deployment package
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ARCHIVE="/tmp/bagh-backend-deploy.tar.gz"

echo -e "${CYAN}Creating deployment archive...${NC}"
cd "$SCRIPT_DIR/.."
tar -czf "$DEPLOY_ARCHIVE" \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='deploy_temp' \
    Backend/

# Copy to VM
echo -e "${CYAN}Copying files to VM...${NC}"
gcloud compute scp "$DEPLOY_ARCHIVE" "$VM_NAME:/tmp/" --zone="$ZONE" --quiet

# Get Gemini API key
GEMINI_KEY=""
if [ -f "$SCRIPT_DIR/app/.env" ]; then
    GEMINI_KEY=$(grep "^GEMINI_API_KEY=" "$SCRIPT_DIR/app/.env" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
fi

# Setup script to run on VM
SETUP_SCRIPT=$(cat <<'EOFSETUP'
#!/bin/bash
set -e

# Extract archive
cd /opt
rm -rf bagh-backend
mkdir -p bagh-backend
cd bagh-backend
tar -xzf /tmp/bagh-backend-deploy.tar.gz
cd Backend

# Setup Python environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install fastapi==0.111.1 uvicorn[standard]==0.30.3 pydantic==2.7.4 pydantic-settings==2.3.1 tenacity==8.3.0 google-generativeai==0.6.0 gunicorn==21.2.0
pip install -e ./bagh-lang
pip install -e ./app

# Create .env file
cat > app/.env <<'EOF'
ENVIRONMENT=production
LOG_LEVEL=INFO
BAGH_API_HOST=0.0.0.0
BAGH_API_PORT=8000
CORS_ALLOW_ORIGINS=https://bagh-beta.shahriarlabs.com,http://localhost:5173
BAGH_SANDBOX_TIMEOUT=3.0
BAGH_SANDBOX_MAX_SOURCE=6000
BAGH_SANDBOX_MAX_OUTPUT=5000
BAGH_SANDBOX_MAX_CONCURRENCY=8
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
GEMINI_TOP_P=0.9
GEMINI_TOP_K=40
GEMINI_MAX_OUTPUT_TOKENS=512
GEMINI_API_KEY=__GEMINI_KEY__
EOF

# Setup Supervisor for process management
cat > /etc/supervisor/conf.d/bagh-backend.conf <<'EOFSUP'
[program:bagh-backend]
command=/opt/bagh-backend/Backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --timeout 30
directory=/opt/bagh-backend/Backend/app
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/bagh-backend.err.log
stdout_logfile=/var/log/bagh-backend.out.log
environment=PATH="/opt/bagh-backend/Backend/venv/bin"
EOFSUP

# Setup Nginx
cat > /etc/nginx/sites-available/bagh-backend <<'EOFNGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOFNGINX

ln -sf /etc/nginx/sites-available/bagh-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart services
supervisorctl reread
supervisorctl update
supervisorctl restart bagh-backend || supervisorctl start bagh-backend
systemctl restart nginx

echo "✅ Deployment complete!"
EOFSETUP
)

# Replace Gemini key placeholder
SETUP_SCRIPT="${SETUP_SCRIPT//__GEMINI_KEY__/$GEMINI_KEY}"

# Run setup on VM
echo -e "${CYAN}Setting up application on VM...${NC}"
echo "$SETUP_SCRIPT" | gcloud compute ssh "$VM_NAME" --zone="$ZONE" --command="sudo bash -s" --quiet

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}${GREEN}📡 Backend URLs:${NC}"
echo -e "   Public IP: http://$EXTERNAL_IP"
echo -e "   Health: http://$EXTERNAL_IP/health"
echo -e "   API: http://$EXTERNAL_IP/api/v1/translate"
echo ""
echo -e "${BOLD}${BLUE}📝 Next Steps:${NC}"
echo "1. Test the backend:"
echo "   ${CYAN}curl http://$EXTERNAL_IP/health${NC}"
echo ""
echo "2. Set up custom domain (api.bagh.shahriarlabs.com):"
echo "   - Add A record pointing to: $EXTERNAL_IP"
echo "   - Set up SSL with certbot (optional)"
echo ""
echo "3. Update frontend .env:"
echo "   ${CYAN}VITE_API_BASE_URL=http://$EXTERNAL_IP${NC}"
echo "   or"
echo "   ${CYAN}VITE_API_BASE_URL=https://api.bagh.shahriarlabs.com${NC}"
echo ""
echo "4. View logs:"
echo "   ${CYAN}gcloud compute ssh $VM_NAME --zone=$ZONE --command='sudo tail -f /var/log/bagh-backend.out.log'${NC}"
echo ""
echo "5. SSH into VM:"
echo "   ${CYAN}gcloud compute ssh $VM_NAME --zone=$ZONE${NC}"
echo ""

# Test deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
sleep 5
if curl -sf "http://$EXTERNAL_IP/health" > /dev/null; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
    echo ""
    echo -e "${BOLD}Response:${NC}"
    curl -s "http://$EXTERNAL_IP/health" | python3 -m json.tool || curl -s "http://$EXTERNAL_IP/health"
else
    echo -e "${YELLOW}⚠️  Health check failed. Checking logs...${NC}"
    gcloud compute ssh "$VM_NAME" --zone="$ZONE" --command="sudo tail -20 /var/log/bagh-backend.err.log" --quiet || true
fi

echo ""
echo -e "${BOLD}${GREEN}🎉 All done!${NC}"
