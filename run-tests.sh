#!/bin/bash

# Run Tests Script for AddVantage API Tests
# This script provides commands for running all tests or specific test files

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
  echo -e "${BLUE}AddVantage API Test Runner${NC}"
  echo ""
  echo "Usage: ./run-tests.sh [option]"
  echo ""
  echo "Options:"
  echo "  all                  Run all tests"
  echo "  auth                 Run authentication tests"
  echo "  stp                  Run STP operations tests"
  echo "  inquiry              Run inquiry operations tests"
  echo "  health               Run health check tests"
  echo "  rate                 Run rate limiting tests"
  echo "  headers              Run request/response headers tests"
  echo "  error                Run error handling tests"
  echo "  validation           Run data validation tests"
  echo "  report               Run all tests and generate reports"
  echo "  help                 Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./run-tests.sh all"
  echo "  ./run-tests.sh auth"
  echo "  ./run-tests.sh report"
}

# Function to run all tests
run_all_tests() {
  echo -e "${GREEN}Running all tests...${NC}"
  npx jest --verbose
}

# Function to run specific test file
run_specific_test() {
  echo -e "${GREEN}Running $1 tests...${NC}"
  npx jest --verbose $2
}

# Function to run tests and generate reports
run_tests_with_reports() {
  echo -e "${GREEN}Running all tests and generating reports...${NC}"
  npm run test:report
  npm run generate:results
  echo -e "${GREEN}Reports generated:${NC}"
  echo "- HTML Report: test-report.html"
  echo "- JSON Report: test-report.json"
  echo "- Markdown Report: test-results.md"
}

# Check if an argument was provided
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

# Process the argument
case "$1" in
  all)
    run_all_tests
    ;;
  auth)
    run_specific_test "authentication" "authentication-tests.js"
    ;;
  stp)
    run_specific_test "STP operations" "stp-operations-tests.js"
    ;;
  inquiry)
    run_specific_test "inquiry operations" "inquiry-operations-tests.js"
    ;;
  health)
    run_specific_test "health check" "health-check-tests.js"
    ;;
  rate)
    run_specific_test "rate limiting" "rate-limiting-tests.js"
    ;;
  headers)
    run_specific_test "request/response headers" "headers-tests.js"
    ;;
  error)
    run_specific_test "error handling" "error-handling-tests.js"
    ;;
  validation)
    run_specific_test "data validation" "data-validation-tests.js"
    ;;
  report)
    run_tests_with_reports
    ;;
  help)
    show_help
    ;;
  *)
    echo -e "${RED}Unknown option: $1${NC}"
    show_help
    exit 1
    ;;
esac

exit 0