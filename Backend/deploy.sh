#!/usr/bin/env bash
# Deployment script for Bagh Online Backend to GCP App Engine

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
echo -e "${BLUE}🚀 Deploying Bagh Online Backend to GCP${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Please install it first:${NC}"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")
if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud. Please authenticate:${NC}"
    gcloud auth login
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No GCP project selected.${NC}"
    echo ""
    echo "Available options:"
    echo "1. Use current project: kinbay-backend (default)"
    echo "2. Create a new project"
    echo "3. Use a different existing project"
    echo ""
    read -p "Enter choice [1-3] (default: 1): " PROJECT_CHOICE
    
    case "${PROJECT_CHOICE:-1}" in
        1)
            PROJECT_ID="kinbay-backend"
            gcloud config set project "$PROJECT_ID"
            ;;
        2)
            read -p "Enter new project ID: " NEW_PROJECT_ID
            gcloud projects create "$NEW_PROJECT_ID"
            gcloud config set project "$NEW_PROJECT_ID"
            PROJECT_ID="$NEW_PROJECT_ID"
            echo -e "${YELLOW}⚠️  Don't forget to enable billing for this project!${NC}"
            ;;
        3)
            read -p "Enter project ID: " EXISTING_PROJECT_ID
            gcloud config set project "$EXISTING_PROJECT_ID"
            PROJECT_ID="$EXISTING_PROJECT_ID"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

echo -e "${GREEN}✓ Project: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ Account: $ACTIVE_ACCOUNT${NC}"
echo ""

# Check if App Engine is initialized
echo -e "${BLUE}🔍 Checking App Engine status...${NC}"
if ! gcloud app describe &> /dev/null; then
    echo -e "${YELLOW}⚠️  App Engine not initialized in this project.${NC}"
    echo ""
    echo "Available regions:"
    echo "  us-central    (Iowa, USA)"
    echo "  us-east1      (South Carolina, USA)"
    echo "  europe-west   (Belgium)"
    echo "  asia-south1   (Mumbai, India)"
    echo ""
    read -p "Enter region for App Engine (default: us-central): " APP_REGION
    APP_REGION="${APP_REGION:-us-central}"
    
    echo -e "${CYAN}Creating App Engine application in $APP_REGION...${NC}"
    gcloud app create --region="$APP_REGION"
    echo -e "${GREEN}✓ App Engine created${NC}"
else
    echo -e "${GREEN}✓ App Engine already initialized${NC}"
fi
echo ""

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
REQUIRED_APIS=(
    "appengine.googleapis.com"
    "cloudbuild.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo -e "${GREEN}✓ $api already enabled${NC}"
    else
        echo -e "${CYAN}  Enabling $api...${NC}"
        gcloud services enable "$api" --quiet
        echo -e "${GREEN}✓ $api enabled${NC}"
    fi
done
echo ""

# Prepare deployment directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/deploy_temp"

echo -e "${BLUE}📦 Preparing deployment package...${NC}"

# Clean previous deployment
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${CYAN}  Cleaning previous deployment...${NC}"
    rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"

# Copy application files
echo -e "${CYAN}  Copying application files...${NC}"
# Copy app module to root for proper import paths
cp -r "$SCRIPT_DIR/app/app" "$DEPLOY_DIR/app"
cp -r "$SCRIPT_DIR/bagh-lang/bagh_lang" "$DEPLOY_DIR/bagh_lang"
cp "$SCRIPT_DIR/requirements-deploy.txt" "$DEPLOY_DIR/requirements.txt"
cp "$SCRIPT_DIR/app.yaml" "$DEPLOY_DIR/"
cp "$SCRIPT_DIR/.gcloudignore" "$DEPLOY_DIR/"

# Copy context file
mkdir -p "$DEPLOY_DIR/context"
cp "$SCRIPT_DIR/app/context/gemini_bagh_context.txt" "$DEPLOY_DIR/context/" 2>/dev/null || \
    echo -e "${YELLOW}⚠️  Context file not found, skipping...${NC}"

echo -e "${GREEN}✓ Deployment package ready${NC}"
echo ""

# Prompt for Gemini API Key
echo -e "${BLUE}🔑 Gemini API Key Configuration${NC}"
echo "Current key in .env: ${GEMINI_KEY_PREVIEW:-Not set}"
echo ""
echo "Options:"
echo "  1. Use existing key from .env file"
echo "  2. Enter a new API key"
echo "  3. Skip (deploy without AI features)"
echo ""
read -p "Enter choice [1-3] (default: 1): " KEY_CHOICE

GEMINI_KEY=""
case "${KEY_CHOICE:-1}" in
    1)
        if [ -f "$SCRIPT_DIR/app/.env" ]; then
            GEMINI_KEY=$(grep "^GEMINI_API_KEY=" "$SCRIPT_DIR/app/.env" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
            if [ -n "$GEMINI_KEY" ]; then
                echo -e "${GREEN}✓ Using API key from .env${NC}"
            else
                echo -e "${YELLOW}⚠️  No key found in .env, skipping...${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  .env file not found, skipping...${NC}"
        fi
        ;;
    2)
        read -p "Enter Gemini API Key: " GEMINI_KEY
        if [ -n "$GEMINI_KEY" ]; then
            echo -e "${GREEN}✓ API key entered${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}⚠️  Skipping API key - AI features will not work${NC}"
        ;;
esac

# Add API key to app.yaml if provided
if [ -n "$GEMINI_KEY" ]; then
    cd "$DEPLOY_DIR"
    # Replace the placeholder comment with the actual key in env_variables section
    sed -i '' 's/# GEMINI_API_KEY will be added by deploy script/GEMINI_API_KEY: "'"$GEMINI_KEY"'"/' app.yaml
    cd "$SCRIPT_DIR"
fi
echo ""

# Show deployment summary
echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}📋 Deployment Summary${NC}"
echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
echo -e "${CYAN}Project:${NC} $PROJECT_ID"
echo -e "${CYAN}Account:${NC} $ACTIVE_ACCOUNT"
echo -e "${CYAN}Target:${NC} api.bagh.shahriarlabs.com"
echo -e "${CYAN}CORS:${NC} https://bagh-beta.shahriarlabs.com"
echo -e "${CYAN}AI Features:${NC} $([ -n "$GEMINI_KEY" ] && echo "Enabled ✓" || echo "Disabled ✗")"
echo -e "${BOLD}${BLUE}════════════════════════════════════════════${NC}"
echo ""

read -p "Proceed with deployment? [Y/n]: " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]?$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    rm -rf "$DEPLOY_DIR"
    exit 0
fi
echo ""

# Deploy
cd "$DEPLOY_DIR"
echo -e "${BLUE}🚀 Deploying to App Engine...${NC}"
echo -e "${CYAN}This may take 5-10 minutes...${NC}"
echo ""

if gcloud app deploy app.yaml --quiet --stop-previous-version; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo ""
    
    # Get the deployed URL
    APP_URL="https://${PROJECT_ID}.appspot.com"
    echo -e "${BOLD}${GREEN}📡 Backend URLs:${NC}"
    echo -e "   Default: $APP_URL"
    echo -e "   Custom:  https://api.bagh.shahriarlabs.com (after DNS setup)"
    echo ""
    
    echo -e "${BOLD}${GREEN}🏥 Test endpoints:${NC}"
    echo -e "   Health: $APP_URL/health"
    echo -e "   API:    $APP_URL/api/v1/translate"
    echo ""
    
    echo -e "${BOLD}${BLUE}📝 Next Steps:${NC}"
    echo "1. Test health endpoint:"
    echo "   ${CYAN}curl $APP_URL/health${NC}"
    echo ""
    echo "2. Set up custom domain in GCP Console:"
    echo "   ${CYAN}https://console.cloud.google.com/appengine/settings/domains${NC}"
    echo "   - Add domain: api.bagh.shahriarlabs.com"
    echo "   - Follow DNS verification steps"
    echo ""
    echo "3. Update frontend .env.production:"
    echo "   ${CYAN}VITE_API_BASE_URL=https://api.bagh.shahriarlabs.com${NC}"
    echo ""
    echo "4. Monitor logs:"
    echo "   ${CYAN}gcloud app logs tail -s default${NC}"
    echo ""
    
    # Test the deployment
    echo -e "${BLUE}🧪 Testing deployment...${NC}"
    if curl -s -f "$APP_URL/health" > /dev/null; then
        echo -e "${GREEN}✓ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed. Check logs:${NC}"
        echo "   gcloud app logs tail"
    fi
else
    echo ""
    echo -e "${RED}════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ Deployment Failed!${NC}"
    echo -e "${RED}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Check the error messages above.${NC}"
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  - Billing not enabled for project"
    echo "  - Insufficient permissions"
    echo "  - Syntax error in app.yaml"
    echo ""
    echo -e "${CYAN}View full logs:${NC}"
    echo "  gcloud app logs read"
    cd "$SCRIPT_DIR"
    rm -rf "$DEPLOY_DIR"
    exit 1
fi

# Cleanup
cd "$SCRIPT_DIR"
echo ""
echo -e "${CYAN}🧹 Cleaning up temporary files...${NC}"
rm -rf "$DEPLOY_DIR"
echo -e "${GREEN}✓ Cleaned up${NC}"
echo ""
echo -e "${BOLD}${GREEN}🎉 All done!${NC}"
