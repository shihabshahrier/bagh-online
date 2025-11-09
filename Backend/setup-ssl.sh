#!/usr/bin/env bash
# Setup SSL certificate for Bagh Backend using Let's Encrypt

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔒 Setup SSL Certificate${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Configuration
VM_NAME="bagh-backend"
ZONE="asia-south1-a"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No GCP project set${NC}"
    exit 1
fi

# Get VM IP
VM_IP=$(gcloud compute instances describe "$VM_NAME" --zone="$ZONE" --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
echo -e "${GREEN}✓ VM IP: $VM_IP${NC}"

# Get domain name
echo ""
echo -e "${YELLOW}Enter your domain name (e.g., api.bagh.shahriarlabs.com):${NC}"
read -p "Domain: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain name is required${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}Checking DNS configuration...${NC}"
RESOLVED_IP=$(dig +short "$DOMAIN" | tail -n1)

if [ -z "$RESOLVED_IP" ]; then
    echo -e "${RED}❌ Domain does not resolve. Please add DNS A record first:${NC}"
    echo -e "   ${DOMAIN} → ${VM_IP}"
    exit 1
fi

if [ "$RESOLVED_IP" != "$VM_IP" ]; then
    echo -e "${RED}❌ Domain resolves to $RESOLVED_IP but VM is at $VM_IP${NC}"
    echo -e "${YELLOW}Please update your DNS A record:${NC}"
    echo -e "   ${DOMAIN} → ${VM_IP}"
    exit 1
fi

echo -e "${GREEN}✓ DNS configured correctly${NC}"

# Get email for Let's Encrypt
echo ""
echo -e "${YELLOW}Enter your email for Let's Encrypt notifications:${NC}"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email is required${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}Installing SSL certificate on VM...${NC}"

# Create SSL setup script
gcloud compute ssh "$VM_NAME" --zone="$ZONE" --command="sudo bash -s" <<EOFSSL
set -e

echo "Installing certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

echo "Configuring Nginx for domain..."
# Update Nginx config with domain name
cat > /etc/nginx/sites-available/bagh-backend <<'EOFNGINX'
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOFNGINX

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo "Obtaining SSL certificate..."
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

echo "Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "SSL certificate installed successfully!"
EOFSSL

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SSL Certificate Setup Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🔒 Your backend is now accessible at:${NC}"
echo -e "   ${CYAN}https://${DOMAIN}${NC}"
echo ""
echo -e "${GREEN}📝 Test the endpoints:${NC}"
echo -e "   Health: ${CYAN}curl https://${DOMAIN}/health${NC}"
echo -e "   API: ${CYAN}curl https://${DOMAIN}/api/v1/translate${NC}"
echo ""
echo -e "${GREEN}📋 Next steps:${NC}"
echo "1. Update frontend .env:"
echo -e "   ${CYAN}VITE_API_BASE_URL=https://${DOMAIN}${NC}"
echo ""
echo "2. Update CORS in backend .env to include:"
echo -e "   ${CYAN}CORS_ALLOW_ORIGINS=https://bagh-beta.shahriarlabs.com,https://${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}Note: SSL certificate will auto-renew via certbot.timer${NC}"
echo ""
