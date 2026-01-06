# AddVantage API Test Automation Framework

This document provides instructions for setting up and extending the test automation framework for the AddVantage API.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your API credentials and configuration:
   - `API_BASE_URL`: The base URL of the API
   - `AUTH_TOKEN`: A valid JWT token for authentication
   - `ADD_VANTAGE_AUTH`: The AddVantage-Authorization header value

## Running Tests

1. Run all tests:
   ```bash
   npm test
   ```

2. Generate test reports:
   ```bash
   npm run test:full
   ```

3. View test reports:
   - HTML report: `test-report.html`
   - JSON report: `test-report.json`
   - Markdown report: `test-results.md`

## Adding New Test Cases

### File Structure

- `error-handling-tests.js`: Contains all test cases for error handling
- `config.js`: Configuration settings for the tests
- `test-results-tracker.js`: Generates test result reports

### Adding a New Test Case

1. Identify the test category (e.g., validation errors, not found errors, etc.)
2. Add a new test case to the appropriate describe block in `error-handling-tests.js`:

```javascript
describe('Your Test Category', () => {
  test('Your test case description', async () => {
    const client = createApiClient();
    const response = await client.post('/api/v1/your-endpoint', {
      // Your request body
    });
    
    // Validate the response
    const validatedResponse = validateErrorResponseStructure(response, 'ExpectedErrorCode', expectedHttpStatus);
    
    // Additional assertions
    expect(validatedResponse.data.error).toHaveProperty('someProperty');
  });
});
```

3. Update the QA plan in `avd-main.md` with the new test case and results

### Test Case Structure

Each test case should:
1. Send a request to the API
2. Validate the response structure using the `validateErrorResponseStructure` helper
3. Perform additional assertions specific to the test case

## Extending the Framework

### Adding New Test Categories

1. Create a new describe block in `error-handling-tests.js`:
```javascript
describe('New Test Category', () => {
  // Your test cases here
});
```

2. Add the new test cases to the describe block

### Adding New Helper Functions

1. Add new helper functions at the top of `error-handling-tests.js`:
```javascript
const yourHelperFunction = (param1, param2) => {
  // Your helper function implementation
  return result;
};
```

2. Use the helper function in your test cases

## Continuous Integration

The test framework is designed to be run in a CI/CD pipeline. To integrate with your CI system:

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Generate reports:
```bash
npm run test:full
```

4. Publish test reports as artifacts

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure your JWT token is valid and not expired
   - Check that the AddVantage-Authorization header is correctly formatted

2. **Connection Issues**:
   - Verify the API_BASE_URL is correct
   - Check network connectivity to the API

3. **Test Failures**:
   - Check the test reports for detailed error messages
   - Verify that the API behavior matches the expected behavior in the test cases

### Getting Help

If you encounter issues with the test framework:

1. Check the documentation in the README.md file
2. Review the test reports for error details
3. Contact the QA team for assistance