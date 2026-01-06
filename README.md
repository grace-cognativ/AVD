# AddVantage API Error Handling Test Automation

This repository contains a test automation framework for validating the error handling capabilities of the AddVantage API. The framework is designed to verify that the API returns the correct error responses with the expected structure for various error scenarios.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Cases](#test-cases)
- [Adding New Tests](#adding-new-tests)
- [Reporting](#reporting)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

The test automation framework validates the error handling capabilities of the AddVantage API according to the requirements specified in the QA plan. It tests various error scenarios, including validation errors, not found errors, unauthorized errors, rate limit errors, external service errors, and server errors.

The framework uses:
- **Jest**: For test execution and assertions
- **Axios**: For making HTTP requests to the API
- **Node.js**: As the runtime environment

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Access to the AddVantage API

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your API credentials and configuration.

## Configuration

The framework uses the following configuration files:

### `.env`

Contains environment-specific configuration:

```
API_BASE_URL=https://api.example.com
AUTH_TOKEN=your-jwt-token
ADD_VANTAGE_AUTH=your-addvantage-auth-header
UUID=your-uuid-header
```

### `config.js`

Contains configuration settings for the tests:

```javascript
require('dotenv').config();

module.exports = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
  AUTH_TOKEN: process.env.AUTH_TOKEN || 'default-token',
  ADD_VANTAGE_AUTH: process.env.ADD_VANTAGE_AUTH || 'default-auth',
  UUID: process.env.UUID || 'default-uuid',
  TIMEOUT: parseInt(process.env.TIMEOUT || '5000', 10),
  RETRY_COUNT: parseInt(process.env.RETRY_COUNT || '3', 10),
  REPORT_PATH: process.env.REPORT_PATH || './test-results'
};
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run with Full Reporting

```bash
npm run test:full
```

### Run a Specific Test

```bash
npm test -- -t "Validation error response structure"
```

### Run Tests with the Shell Script

```bash
./run-tests.sh
```

## Test Cases

The framework includes the following test cases:

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| ERR-001 | Validation error response structure | Verifies that validation errors return a 400 response with the correct structure |
| ERR-002 | Not Found error response structure | Verifies that not found errors return a 404 response with the correct structure |
| ERR-003 | Unauthorized error response structure | Verifies that unauthorized errors return a 401 response with the correct structure |
| ERR-004 | Rate limit error response structure | Verifies that rate limit errors return a 429 response with the correct structure |
| ERR-005 | External service error response structure | Verifies that external service errors return a 502 response with the correct structure |
| ERR-006 | Server error response structure | Verifies that server errors return a 500 response with the correct structure |
| ERR-007 | Error response includes correlation ID | Verifies that all error responses include a correlation ID in the metadata |
| ERR-008 | Error response includes ProcessedAt timestamp | Verifies that all error responses include a ProcessedAt timestamp in the metadata |

## Adding New Tests

To add a new test case:

1. Open `error-handling-tests.js`
2. Add a new describe block for your test category
3. Add test cases within the describe block
4. Use the helper functions to validate the response structure

Example:

```javascript
describe('Your New Test Category', () => {
  test('Your test case description', async () => {
    // Create API client with authentication
    const client = createApiClient();
    
    // Send request to the API
    const response = await client.post('/api/v1/your-endpoint', {
      // Your request body
    });
    
    // Validate the error response structure
    const validatedResponse = validateErrorResponseStructure(response, 'ExpectedErrorCode', expectedHttpStatus);
    
    // Additional assertions
    expect(validatedResponse.error).toHaveProperty('someProperty');
  });
});
```

See `sample-implementations.js` for more detailed examples.

## Reporting

The framework generates the following reports:

- **HTML Report**: `test-report.html`
- **JSON Report**: `test-report.json`
- **Markdown Report**: `test-results.md`

To generate reports:

```bash
npm run test:full
```

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

### Debugging

To enable verbose logging:

```bash
DEBUG=true npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure they pass
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.