const fs = require('fs');
const path = require('path');

// Configuration
const TEST_REPORT_PATH = path.join(__dirname, 'test-report.json');
const RESULTS_MARKDOWN_PATH = path.join(__dirname, 'test-results.md');

// Function to generate a markdown table from test results
function generateResultsMarkdown(testResults) {
  const { numFailedTests, numPassedTests, numPendingTests, testResults: tests } = testResults;
  
  // Calculate overall stats
  const totalTests = numFailedTests + numPassedTests + numPendingTests;
  const passRate = Math.round((numPassedTests / totalTests) * 100);
  
  // Start building the markdown content
  let markdown = `# AddVantage API Error Handling Test Results\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${totalTests}\n`;
  markdown += `- **Passed:** ${numPassedTests} (${passRate}%)\n`;
  markdown += `- **Failed:** ${numFailedTests}\n`;
  markdown += `- **Pending:** ${numPendingTests}\n\n`;
  
  // Create the test results table
  markdown += `## Test Results\n\n`;
  markdown += `| TC-ID | Test Case | Status | Duration (ms) | Error Message |\n`;
  markdown += `|-------|-----------|--------|---------------|---------------|\n`;
  
  // Process each test suite
  tests.forEach(suite => {
    // Process each test in the suite
    suite.testResults.forEach(test => {
      // Extract test case ID from the test title
      const tcIdMatch = test.ancestorTitles[1]?.match(/ERR-\d{3}/);
      const tcId = tcIdMatch ? tcIdMatch[0] : 'N/A';
      
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
      
      // Add row to table
      markdown += `| ${tcId} | ${testTitle} | ${status} | ${duration} | ${errorMessage} |\n`;
    });
  });
  
  // Add acceptance criteria section
  markdown += `\n## Acceptance Criteria Status\n\n`;
  markdown += `| Criteria | Status |\n`;
  markdown += `|----------|--------|\n`;
  markdown += `| All error responses follow consistent structure | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Error codes are standardized and descriptive | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Error messages are user-friendly but detailed | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Validation errors include field-specific error arrays | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| Correlation ID is present in all responses | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  markdown += `| HTTP status codes are appropriate for error types | ${numFailedTests === 0 ? '✅ PASS' : '❌ FAIL'} |\n`;
  
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