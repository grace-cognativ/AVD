const fs = require('fs');
const path = require('path');

// Configuration
const TEST_REPORT_PATH = path.join(__dirname, 'test-report.json');
const RESULTS_MARKDOWN_PATH = path.join(__dirname, 'test-results.md');

// Function to extract test case ID from test title
function extractTestCaseId(title, ancestorTitles) {
  // Try to match different test case ID patterns
  const patterns = [
    /AUTH-\d{3}/, // Authentication tests
    /STP-\d{3}/,  // STP operation tests
    /BATCH-\d{3}/, // Batch operation tests
    /INQ-\d{3}/,  // Inquiry tests
    /HEALTH-\d{3}/, // Health check tests
    /HEALTH-V2-\d{3}/, // V2 Health check tests
    /READY-\d{3}/, // Readiness tests
    /RATE-\d{3}/, // Rate limiting tests
    /HEADER-\d{3}/, // Header tests
    /ERR-\d{3}/, // Error handling tests
    /VAL-\d{3}/, // Validation tests
    /CORS-\d{3}/, // CORS tests
    /INT-\d{3}/ // Integration tests
  ];
  
  // Check title first
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  
  // Check ancestor titles if available
  if (ancestorTitles && ancestorTitles.length > 0) {
    for (const ancestorTitle of ancestorTitles) {
      for (const pattern of patterns) {
        const match = ancestorTitle.match(pattern);
        if (match) return match[0];
      }
    }
  }
  
  return 'N/A';
}

// Function to generate a markdown table from test results
function generateResultsMarkdown(testResults) {
  const { numFailedTests, numPassedTests, numPendingTests, testResults: tests } = testResults;
  
  // Calculate overall stats
  const totalTests = numFailedTests + numPassedTests + numPendingTests;
  const passRate = Math.round((numPassedTests / totalTests) * 100);
  
  // Start building the markdown content
  let markdown = `# AddVantage API Test Results\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${totalTests}\n`;
  markdown += `- **Passed:** ${numPassedTests} (${passRate}%)\n`;
  markdown += `- **Failed:** ${numFailedTests}\n`;
  markdown += `- **Pending:** ${numPendingTests}\n\n`;
  
  // Group tests by category
  const testCategories = {
    'Authentication & Authorization': [],
    'STP Operations': [],
    'Inquiry Operations': [],
    'Health Check': [],
    'Rate Limiting': [],
    'Error Handling': [],
    'Data Validation': [],
    'Request/Response Headers': [],
    'Other': []
  };
  
  // Process each test suite
  tests.forEach(suite => {
    // Determine category based on file name
    let category = 'Other';
    if (suite.name.includes('authentication-tests')) {
      category = 'Authentication & Authorization';
    } else if (suite.name.includes('stp-operations-tests')) {
      category = 'STP Operations';
    } else if (suite.name.includes('inquiry-operations-tests')) {
      category = 'Inquiry Operations';
    } else if (suite.name.includes('health-check-tests')) {
      category = 'Health Check';
    } else if (suite.name.includes('rate-limiting-tests')) {
      category = 'Rate Limiting';
    } else if (suite.name.includes('error-handling-tests')) {
      category = 'Error Handling';
    } else if (suite.name.includes('data-validation-tests')) {
      category = 'Data Validation';
    } else if (suite.name.includes('headers-tests')) {
      category = 'Request/Response Headers';
    }
    
    // Process each test in the suite
    suite.testResults.forEach(test => {
      // Extract test case ID from the test title or ancestor titles
      const tcId = extractTestCaseId(test.title, test.ancestorTitles);
      
      // Get test title
      const testTitle = test.title;
      
      // Get test status
      const status = test.status === 'passed' ? '✅ PASS' : 
                     test.status === 'failed' ? '❌ FAIL' : 
                     '⏳ PENDING';
      
      // Get test duration
      const duration = test.duration;
      
      // Get error message if test failed
      const errorMessage = test.status === 'failed' ? 
                          test.failureMessages[0]?.replace(/\n/g, ' ').substring(0, 100) + '...' : 
                          '';
      
      // Add test to category
      testCategories[category].push({
        tcId,
        testTitle,
        status,
        duration,
        errorMessage
      });
    });
  });
  
  // Create test results tables by category
  for (const [category, categoryTests] of Object.entries(testCategories)) {
    if (categoryTests.length === 0) continue;
    
    markdown += `## ${category} Tests\n\n`;
    markdown += `| TC-ID | Test Case | Status | Duration (ms) | Error Message |\n`;
    markdown += `|-------|-----------|--------|---------------|---------------|\n`;
    
    // Sort tests by TC-ID
    categoryTests.sort((a, b) => {
      if (a.tcId === 'N/A' && b.tcId !== 'N/A') return 1;
      if (a.tcId !== 'N/A' && b.tcId === 'N/A') return -1;
      return a.tcId.localeCompare(b.tcId);
    });
    
    // Add rows to table
    categoryTests.forEach(test => {
      markdown += `| ${test.tcId} | ${test.testTitle} | ${test.status} | ${test.duration} | ${test.errorMessage} |\n`;
    });
    
    markdown += '\n';
  }
  
  // Add acceptance criteria section
  markdown += `## Acceptance Criteria Status\n\n`;
  markdown += `| Criteria | Status |\n`;
  markdown += `|----------|--------|\n`;
  markdown += `| All endpoints require valid JWT authentication (except health checks) | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| STP operations validate requests and return appropriate responses | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Inquiry operations validate parameters and return parsed responses | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Health checks return accurate status information | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Rate limiting is enforced per endpoint type | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Error responses follow standard structure with appropriate HTTP status codes | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Required headers (AddVantage-Authorization, uuid) are validated | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Request validation errors are detailed and field-specific | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| All responses include correlation ID and metadata | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  
  return markdown;
}

// Main function to process test results and generate markdown
function processTestResults() {
  try {
    // Check if test report exists
    if (!fs.existsSync(TEST_REPORT_PATH)) {
      console.error(`Test report not found at ${TEST_REPORT_PATH}`);
      console.error('Run tests first with: npm run test:report');
      return;
    }
    
    // Read and parse the test report
    const testReport = JSON.parse(fs.readFileSync(TEST_REPORT_PATH, 'utf8'));
    
    // Generate markdown from test results
    const markdown = generateResultsMarkdown(testReport);
    
    // Write markdown to file
    fs.writeFileSync(RESULTS_MARKDOWN_PATH, markdown);
    
    console.log(`Test results markdown generated at ${RESULTS_MARKDOWN_PATH}`);
  } catch (error) {
    console.error('Error processing test results:', error);
  }
}

// Run the processor if this script is executed directly
if (require.main === module) {
  processTestResults();
}

module.exports = {
  processTestResults,
  generateResultsMarkdown
};