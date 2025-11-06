#!/usr/bin/env zsh
# Unified test runner for Bagh Online (Frontend + Backend)
# Run this script from the repository root to test both stacks

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${(%):-%N}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 Bagh Online Unified Test Runner${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Initialize counters
PASSED=0
FAILED=0

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
}

# Function to report test results
report_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $1${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# ============================================================================
# BACKEND TESTS
# ============================================================================

print_section "Backend Tests (FastAPI + Bagh Lang)"

# Activate virtual environment
if [ -f "$REPO_ROOT/.venv/bin/activate" ]; then
    echo "Activating Python virtual environment..."
    source "$REPO_ROOT/.venv/bin/activate"
else
    echo -e "${YELLOW}⚠️  Python virtual environment not found. Please run './run_dev.sh setup' first.${NC}"
    exit 1
fi

cd "$REPO_ROOT/Backend/app" || exit 1

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${YELLOW}⚠️  pytest not found. Installing dependencies...${NC}"
    pip install -q pytest httpx 2>/dev/null || true
fi

# Run backend tests
echo "Running pytest on Backend/app/tests/..."
if pytest tests/ -v --tb=short 2>&1; then
    report_result "Backend tests"
else
    report_result "Backend tests"
fi

cd - > /dev/null

# ============================================================================
# FRONTEND TESTS
# ============================================================================

print_section "Frontend Tests (React + TypeScript)"

cd "$REPO_ROOT/Frontend" || exit 1

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm not found. Please install Node.js and npm.${NC}"
    FAILED=$((FAILED + 1))
else
    # Check if node_modules exists, if not install
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install -q 2>&1 || {
            echo -e "${YELLOW}⚠️  npm install had issues, continuing...${NC}"
        }
    fi

    # Run frontend tests
    echo "Running Vitest on Frontend/src/..."
    if npm test 2>&1; then
        report_result "Frontend tests"
    else
        report_result "Frontend tests"
    fi
fi

cd - > /dev/null

# ============================================================================
# LINTING CHECKS (Optional)
# ============================================================================

print_section "Code Quality Checks"

# Backend linting
cd "$REPO_ROOT/Backend/app" || exit 1
if command -v pylint &> /dev/null; then
    echo "Running pylint on Backend..."
    if pylint app/ --disable=all --enable=syntax-error 2>&1 | grep -q "syntax-error"; then
        echo -e "${RED}❌ Backend syntax errors found${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Backend syntax check${NC}"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  pylint not found, skipping backend linting${NC}"
fi

# Frontend linting
cd "$REPO_ROOT/Frontend" || exit 1
if command -v npm &> /dev/null; then
    echo "Running ESLint on Frontend..."
    if npm run lint 2>&1 | grep -q "error"; then
        echo -e "${RED}❌ Frontend linting errors found${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Frontend linting passed${NC}"
        PASSED=$((PASSED + 1))
    fi
fi

cd - > /dev/null

# ============================================================================
# FINAL REPORT
# ============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Exit with appropriate code
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi
