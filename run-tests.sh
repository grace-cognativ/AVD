#!/bin/bash

# Run Error Handling Tests
# This script runs the error handling tests and generates reports

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== AddVantage API Error Handling Tests ===${NC}"
echo -e "${YELLOW}Starting test execution...${NC}"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Run tests with reporting
echo -e "${YELLOW}Running tests and generating reports...${NC}"
npm run test:full

# Check if test reports were generated
if [ -f "test-report.json" ] && [ -f "test-report.html" ]; then
  echo -e "${GREEN}Test execution completed!${NC}"
  echo -e "${GREEN}Reports generated:${NC}"
  echo -e "  - JSON Report: test-report.json"
  echo -e "  - HTML Report: test-report.html"
  echo -e "  - Markdown Report: test-results.md"
  
  # Count test results from markdown file
  if [ -f "test-results.md" ]; then
    PASS_COUNT=$(grep -c "✅ PASS" test-results.md)
    FAIL_COUNT=$(grep -c "❌ FAIL" test-results.md)
    PENDING_COUNT=$(grep -c "⏳ PENDING" test-results.md)
    
    echo -e "${YELLOW}Test Summary:${NC}"
    echo -e "  - Passed: ${GREEN}$PASS_COUNT${NC}"
    if [ "$FAIL_COUNT" -gt 0 ]; then
      echo -e "  - Failed: ${RED}$FAIL_COUNT${NC}"
    else
      echo -e "  - Failed: ${GREEN}$FAIL_COUNT${NC}"
    fi
    if [ "$PENDING_COUNT" -gt 0 ]; then
      echo -e "  - Pending: ${YELLOW}$PENDING_COUNT${NC}"
    else
      echo -e "  - Pending: ${GREEN}$PENDING_COUNT${NC}"
    fi
  fi
  
  # Open HTML report if on a system with a browser
  if [ "$(uname)" == "Darwin" ]; then
    echo -e "${YELLOW}Opening HTML report...${NC}"
    open test-report.html
  elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    if [ -n "$DISPLAY" ]; then
      echo -e "${YELLOW}Opening HTML report...${NC}"
      xdg-open test-report.html
    fi
  elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ] || [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    echo -e "${YELLOW}Opening HTML report...${NC}"
    start test-report.html
  fi
else
  echo -e "${RED}Error: Test reports were not generated.${NC}"
  echo -e "${RED}Check for errors in the test execution.${NC}"
  exit 1
fi

echo -e "${YELLOW}=== Test execution completed ===${NC}"