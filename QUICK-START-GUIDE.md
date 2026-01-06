# AddVantage API Test Automation Quick Start Guide

This guide provides a quick overview of how to get started with the AddVantage API error handling test automation framework.

## 1. Setup (5 minutes)

### Clone the repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### Install dependencies
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
API_BASE_URL=https://api.example.com
AUTH_TOKEN=eyJhbGciOiJSUzI1NiIsImtpZCI6IkIwRUM1M0QwRUJCMUUzOUE1NTkzOTA2NzUzODU2MDY1REI3NzAyNjgiLCJ0eXAiOiJKV1QifQ...
ADD_VANTAGE_AUTH=your-addvantage-auth-header
UUID=your-uuid-header
```

## 2. Run Tests (2 minutes)

### Run all tests
```bash
npm test
```

### Run with full reporting
```bash
npm run test:full
```

### Run a specific test
```bash
npm test -- -t "Validation error"
```

## 3. View Results (1 minute)

After running tests with full reporting:
- HTML Report: `test-report.html`
- JSON Report: `test-report.json`
- Markdown Report: `test-results.md`

## 4. Add a New Test Case (10 minutes)

1. Open `error-handling-tests.js`
2. Add your test case:

```javascript
describe('Your Test Category', () => {
  test('Your test case description', async () => {
    // Create API client
    const client = createApiClient();
    
    // Send request
    const response = await client.post('/api/v1/your-endpoint', {
      // Your request body
    });
    
    // Validate response
    const validatedResponse = validateErrorResponseStructure(
      response, 
      'ExpectedErrorCode', 
      expectedHttpStatus
    );
    
    // Additional assertions
    expect(validatedResponse.error).toHaveProperty('someProperty');
  });
});
```

3. Run your test:
```bash
npm test -- -t "Your test case description"
```

## 5. Create a GitHub Issue for Failed Tests (5 minutes)

1. Use the template in `github-issue-template.md`
2. Fill in the details of the failed test
3. Submit the issue to the appropriate repository

## Key Files Reference

| File | Purpose |
|------|---------|
| `error-handling-tests.js` | Main test file containing all test cases |
| `config.js` | Configuration settings for the tests |
| `test-results-tracker.js` | Generates test result reports |
| `.env` | Environment-specific configuration |
| `run-tests.sh` | Shell script for running tests |
| `sample-implementations.js` | Example implementations for reference |

## Additional Resources

- [Detailed README](./README.md)
- [Implementation Guide](./IMPLEMENTATION-GUIDE.md)
- [Team Instructions](./TEAM-INSTRUCTIONS.md)
- [QA Error Handling Test Plan](./QA-Error-Handling-Test-Plan.md)

## Common Issues

1. **Authentication Errors**:
   - Check that your JWT token is valid and not expired
   - Verify the AddVantage-Authorization header is correct

2. **Connection Issues**:
   - Verify the API_BASE_URL is correct
   - Check network connectivity to the API

3. **Test Failures**:
   - Check the test reports for detailed error messages
   - Verify that the API behavior matches the expected behavior

## Need Help?

If you encounter issues:
1. Check the documentation in the README.md file
2. Review the test reports for error details
3. Contact the QA team for assistance