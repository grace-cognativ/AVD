#!/bin/bash

# Run Data Validation Tests
# This script runs only the data validation tests and generates reports

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== AddVantage API Data Validation Tests ===${NC}"
echo -e "${YELLOW}Starting test execution...${NC}"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Run only data validation tests
echo -e "${YELLOW}Running data validation tests...${NC}"
npm test -- data-validation-tests.js

echo -e "${YELLOW}=== Test execution completed ===${NC}"

# Make the script executable
chmod +x run-validation-tests.sh