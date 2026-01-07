# AddVantage API Test Automation

This repository contains a test automation framework for validating the AddVantage API. The framework is designed to verify various aspects of the API including authentication, STP operations, inquiry operations, health checks, rate limiting, error handling, and data validation.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Adding New Tests](#adding-new-tests)
- [Reporting](#reporting)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

The test automation framework validates the AddVantage API according to the requirements specified in the QA Test Plan. It includes the following test categories:

### Authentication & Authorization Tests
- JWT authentication
- Authorization policies
- Token validation

### STP Operations Tests
- Single STP operations
- Batch STP operations
- Field validation
- Error handling

### Inquiry Operations Tests
- Parameter validation
- Response parsing
- Error handling

### Health Check Tests
- Health endpoint validation
- Readiness endpoint validation
- V2 health endpoints

### Rate Limiting Tests
- Request rate limits
- Batch size limits
- Retry-After headers

### Request/Response Headers Tests
- Correlation ID handling
- Content-Type validation
- Required headers validation

### Error Handling Tests
- Validation errors (400)
- Not found errors (404)
- Unauthorized errors (401)
- Rate limit errors (429)
- External service errors (502)
- Server errors (500)

### Data Validation Tests
- Required field validation
- Data type validation
- Field format validation
- Enum/choice validation
- Range/length validation
- Custom validation rules
- Response structure validation

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
API_BASE_URL=https://nah-avd-dev.cognativ.com
AUTH_TOKEN=your-jwt-token
ADD_VANTAGE_AUTH=your-addvantage-auth-header
TEST_UUID=your-uuid-header
TEST_CORRELATION_ID=your-correlation-id
```

### `config.js`

Contains configuration settings for the tests:

```javascript
require('dotenv').config();

module.exports = {
  baseUrl: process.env.API_BASE_URL || 'https://nah-avd-dev.cognativ.com/',
  auth: {
    token: process.env.AUTH_TOKEN || 'default-token',
    addVantageAuth: process.env.ADD_VANTAGE_AUTH || 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
  },
  testData: {
    validOperation: 'CustomerPayment',
    validEndpoint: 'HoldingGroupTenantLoginSearch',
    invalidOperation: 'NonExistentOperation',
    invalidEndpoint: 'NonExistentEndpoint',
    validFields: { /* ... */ },
    validParameters: { /* ... */ }
  },
  testSettings: {
    timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
    maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE) || 101,
    testCorrelationId: process.env.TEST_CORRELATION_ID || 'test-correlation-id-12345',
    testUuid: process.env.TEST_UUID || 'test-uuid-12345'
  },
  reportSettings: {
    jsonReportPath: 'test-report.json',
    htmlReportPath: 'test-report.html',
    markdownReportPath: 'test-results.md'
  }
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

### Run a Specific Test File

```bash
npm test -- authentication-tests.js
npm test -- stp-operations-tests.js
npm test -- inquiry-operations-tests.js
npm test -- health-check-tests.js
npm test -- rate-limiting-tests.js
npm test -- headers-tests.js
npm test -- error-handling-tests.js
npm test -- data-validation-tests.js
```

### Run a Specific Test Case

```bash
npm test -- -t "AUTH-001"
npm test -- -t "STP-001"
npm test -- -t "INQ-001"
npm test -- -t "HEALTH-001"
npm test -- -t "RATE-001"
npm test -- -t "HEADER-001"
npm test -- -t "ERR-001"
npm test -- -t "VAL-001"
```

### Run Tests with the Shell Script

```bash
./run-tests.sh
```

### Run Only Data Validation Tests

```bash
# Option 1: Using npm script
npm run test:validation

# Option 2: Using shell script
./run-validation-tests.sh
```

## Test Categories

The framework includes the following test categories:

### Authentication & Authorization Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| AUTH-001 | Request without Authorization header | Verifies that requests without Authorization header return 401 Unauthorized |
| AUTH-002 | Request with invalid JWT token format | Verifies that requests with invalid JWT token format return 401 Unauthorized |
| AUTH-003 | Request with expired JWT token | Verifies that requests with expired JWT token return 401 Unauthorized with expiration error |
| AUTH-004 | Request with valid JWT token | Verifies that requests with valid JWT token are processed successfully |
| AUTH-005 | Request with JWT token missing required claims | Verifies that requests with JWT token missing required claims return 401 Unauthorized |
| AUTH-006 | Request with JWT token from incorrect issuer | Verifies that requests with JWT token from incorrect issuer return 401 Unauthorized |
| AUTH-007 | Request with JWT token for incorrect audience | Verifies that requests with JWT token for incorrect audience return 401 Unauthorized |
| AUTH-008 | Health check endpoints without authentication | Verifies that health check endpoints are accessible without authentication |
| AUTH-009 | STP endpoint with token missing addvantage.stp scope | Verifies that STP endpoint with token missing addvantage.stp scope returns 403 Forbidden |
| AUTH-010 | Inquiry endpoint with token missing addvantage.inquiry scope | Verifies that Inquiry endpoint with token missing addvantage.inquiry scope returns 403 Forbidden |
| AUTH-011 | Request with token having appropriate scope | Verifies that requests with token having appropriate scope are processed successfully |

### STP Operations Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| STP-001 | Valid STP request with all required fields | Verifies that valid STP request with all required fields returns 200 OK with success response |
| STP-002 | STP request with missing operation field | Verifies that STP request with missing operation field returns 400 Bad Request |
| STP-003 | STP request with missing fields dictionary | Verifies that STP request with missing fields dictionary returns 400 Bad Request |
| STP-004 | STP request with empty fields dictionary | Verifies that STP request with empty fields dictionary returns 400 Bad Request |
| STP-005 | STP request with invalid operation name | Verifies that STP request with invalid operation name returns 404 Not Found |
| STP-006 | STP request missing AddVantage-Authorization header | Verifies that STP request missing AddVantage-Authorization header returns 400 Bad Request |
| STP-007 | STP request missing uuid header | Verifies that STP request missing uuid header returns 400 Bad Request |
| STP-008 | STP request with invalid UUID format | Verifies that STP request with invalid UUID format returns 400 Bad Request |
| STP-009 | STP request with invalid AddVantage-Authorization format | Verifies that STP request with invalid AddVantage-Authorization format returns 400 Bad Request |
| STP-010 | STP request with fields failing format validation rules | Verifies that STP request with fields failing format validation rules returns 400 Bad Request |
| STP-011 | STP request with non-JSON Content-Type | Verifies that STP request with non-JSON Content-Type returns 400 Bad Request or 415 Unsupported Media Type |
| STP-012 | STP request with malformed JSON body | Verifies that STP request with malformed JSON body returns 400 Bad Request |
| BATCH-001 | Valid batch request with multiple items | Verifies that valid batch request with multiple items returns 200 OK with batch response |
| BATCH-002 | Batch request with empty items array | Verifies that batch request with empty items array returns 400 Bad Request |
| BATCH-003 | Batch request with null items | Verifies that batch request with null items returns 400 Bad Request |
| BATCH-004 | Batch request exceeding MaxBatchSize | Verifies that batch request exceeding MaxBatchSize returns 429 Too Many Requests |
| BATCH-005 | Batch request with invalid item at index 0 | Verifies that batch request with invalid item at index 0 returns 400 Bad Request |
| BATCH-006 | Batch request with invalid item at middle index | Verifies that batch request with invalid item at middle index returns 200 OK with partial success |
| BATCH-007 | Batch request with batchId provided | Verifies that batch request with batchId provided returns 200 OK with same batchId in response |
| BATCH-009 | Batch request with all items succeeding | Verifies that batch request with all items succeeding returns 200 OK with success: true |
| BATCH-010 | Batch request with mixed success/failure | Verifies that batch request with mixed success/failure returns 200 OK with success: false |

### Inquiry Operations Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| INQ-001 | Valid inquiry request with all required parameters | Verifies that valid inquiry request with all required parameters returns 200 OK with success response |
| INQ-002 | Inquiry request with missing endpoint field | Verifies that inquiry request with missing endpoint field returns 400 Bad Request |
| INQ-003 | Inquiry request with missing parameters object | Verifies that inquiry request with missing parameters object returns 400 Bad Request |
| INQ-004 | Inquiry request with invalid endpoint name | Verifies that inquiry request with invalid endpoint name returns 404 Not Found |
| INQ-005 | Inquiry request with invalid query parameters | Verifies that inquiry request with invalid query parameters returns 400 Bad Request |
| INQ-006 | Inquiry request missing AddVantage-Authorization header | Verifies that inquiry request missing AddVantage-Authorization header returns 400 Bad Request |
| INQ-007 | Inquiry request missing uuid header | Verifies that inquiry request missing uuid header returns 400 Bad Request |
| INQ-008 | Inquiry request with parameters not matching format definition | Verifies that inquiry request with parameters not matching format definition returns 400 Bad Request |
| INQ-011 | Inquiry request with empty parameters object | Verifies that inquiry request with empty parameters object returns 400 Bad Request or successful |

### Health Check Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| HEALTH-001 | Health check request | Verifies that health check request returns 200 OK with status: "Healthy" or 503 with status: "Unhealthy" |
| HEALTH-002 | Health check without authentication | Verifies that health check without authentication is accessible (not return 401) |
| HEALTH-003 | Health check response structure validation | Verifies that health check response structure contains required fields |
| HEALTH-004 | totalDurationMs aggregation validation | Verifies that totalDurationMs equals sum of all reported durationMs values |
| HEALTH-005 | main_api description present | Verifies that main_api description exists and is non-empty |
| HEALTH-006 | Response Content-Type and correlation header | Verifies that response has Content-Type: application/json and X-Correlation-Id header |
| READY-001 | Readiness check request | Verifies that readiness check request returns 200 OK with status: "Ready" or 503 with status: "Not Ready" |
| READY-002 | Readiness check without authentication | Verifies that readiness check without authentication is accessible (not return 401) |
| READY-003 | Readiness check when all dependencies are healthy | Verifies that readiness check when all dependencies are healthy returns 200 OK with all services showing Healthy status |
| READY-006 | Readiness check response structure validation | Verifies that readiness check response structure contains status for all services |
| READY-007 | totalDurationMs aggregation validation | Verifies that totalDurationMs equals sum of all reported durationMs values |
| READY-008 | service descriptions presence | Verifies that each reported service includes a description |
| HEALTH-V2-001 | V2 health check request | Verifies that V2 health check request returns 200 OK with additional ApiVersion information |
| HEALTH-V2-002 | V2 health check response structure | Verifies that V2 health check response includes ApiVersion object with Version, BuildDate, Environment |

### Rate Limiting Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| RATE-001 | STP endpoint - requests within limit | Verifies that STP endpoint - requests within limit (500 req/min) all succeed |
| RATE-002 | STP endpoint - requests exceeding limit | Verifies that STP endpoint - requests exceeding limit return 429 Too Many Requests |
| RATE-003 | Inquiry endpoint - requests within limit | Verifies that Inquiry endpoint - requests within limit (2000 req/min) all succeed |
| RATE-004 | Inquiry endpoint - requests exceeding limit | Verifies that Inquiry endpoint - requests exceeding limit return 429 Too Many Requests |
| RATE-005 | STP Batch endpoint - requests within limit | Verifies that STP Batch endpoint - requests within limit (500 req/min) all succeed |
| RATE-006 | STP Batch endpoint - batch size exceeding MaxBatchSize | Verifies that STP Batch endpoint - batch size exceeding MaxBatchSize returns 429 Too Many Requests |
| RATE-007 | Default endpoint - requests within limit | Verifies that Default endpoint - requests within limit (10 req/min) all succeed |
| RATE-008 | Default endpoint - requests exceeding limit | Verifies that Default endpoint - requests exceeding limit return 429 Too Many Requests |
| RATE-009 | Rate limit response structure | Verifies that rate limit response includes error code "RATE_LIMIT_EXCEEDED", message, and retry after time |
| RATE-010 | Rate limit reset after time window | Verifies that requests succeed after rate limit window resets |

### Request/Response Headers Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| HEADER-001 | Request with X-Correlation-Id header | Verifies that request with X-Correlation-Id header includes same correlation ID in response metadata |
| HEADER-002 | Request without X-Correlation-Id header | Verifies that request without X-Correlation-Id header includes auto-generated correlation ID in metadata |
| HEADER-003 | Response includes X-Correlation-Id header | Verifies that response includes X-Correlation-Id header |
| HEADER-004 | Request with Content-Type: application/json | Verifies that request with Content-Type: application/json is processed successfully |
| HEADER-005 | Request with incorrect Content-Type | Verifies that request with incorrect Content-Type returns 400 Bad Request or 415 Unsupported Media Type |
| HEADER-006 | Response Content-Type is application/json | Verifies that response Content-Type is application/json |

### Error Handling Tests

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

### Data Validation Tests

| TC-ID | Test Case | Description |
|-------|-----------|-------------|
| VAL-001 | Required field validation | Verifies that missing required fields return validation errors |
| VAL-002 | Data type validation | Verifies that incorrect data types return validation errors |
| VAL-003 | Field format validation | Verifies that fields not matching format rules return validation errors |
| VAL-004 | Enum/choice validation | Verifies that invalid enum values return validation errors |
| VAL-005 | Range/length validation | Verifies that values outside allowed ranges return validation errors |
| VAL-006 | Custom validation scripts | Verifies that custom validation rules are executed correctly |
| VAL-007 | Success response structure validation | Verifies that responses match expected schema |
| VAL-008 | Error response structure validation | Verifies that error responses match expected schema |
| VAL-009 | Metadata presence validation | Verifies that all responses include metadata object |
| VAL-010 | Data type validation in responses | Verifies that response data types match specification |

## Adding New Tests

To add a new test case:

1. Determine which test category your test belongs to:
   - Authentication tests: `authentication-tests.js`
   - STP operations tests: `stp-operations-tests.js`
   - Inquiry operations tests: `inquiry-operations-tests.js`
   - Health check tests: `health-check-tests.js`
   - Rate limiting tests: `rate-limiting-tests.js`
   - Request/Response headers tests: `headers-tests.js`
   - Error handling tests: `error-handling-tests.js`
   - Data validation tests: `data-validation-tests.js`

2. Open the appropriate test file
3. Add a new describe block for your test category (if needed)
4. Add test cases within the describe block
5. Use the helper functions from `index.js` to validate the response structure

### Example: Adding an Authentication Test

```javascript
describe('Your New Authentication Test Category', () => {
  test('Your test case description', async () => {
    // Create API client with custom headers
    const client = createApiClient({
      'Authorization': 'Bearer your-test-token'
    });
    
    // Send request to the API
    const response = await client.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Validate the response
    expect(response.status).toBe(expectedStatus);
    expect(response.data).toHaveProperty('success', expectedSuccess);
  });
});
```

All helper functions are available in `index.js` and can be imported into any test file.

## Reporting

The framework generates the following reports:

- **HTML Report**: `test-report.html`
- **JSON Report**: `test-report.json`
- **Markdown Report**: `test-results.md`

To generate reports:

```bash
npm run test:full
```

The test results tracker (`test-results-tracker.js`) processes the JSON report and generates a markdown report with the following sections:

- Summary of test results
- Test results by category
- Acceptance criteria status

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure your JWT token is valid and not expired
   - If you see errors like `{"message": "Token has expired"}` or consistent 401/403 responses, you need to update your token
   - Get a new token from Postman or your authentication service
   - Update the token in your `.env` file or directly in `config.js`
   - The token is stored in the `AUTH_TOKEN` environment variable
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