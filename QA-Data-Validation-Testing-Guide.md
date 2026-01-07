# Data Validation Testing Guide

This guide outlines the approach for testing data validation in the AddVantage API. It covers both request validation and response validation testing.

## Overview

Data validation testing ensures that:
1. The API properly validates all incoming request data
2. The API returns appropriate validation errors when invalid data is provided
3. The API responses conform to the expected structure and data types

## Test Coverage

The data validation tests cover:

- Required field validation
- Data type validation
- Field format validation
- Enum/choice validation
- Range/length validation
- Custom validation rules
- Response structure validation
- Response data type validation

## Running the Tests

To run the data validation tests:

```bash
# Run all data validation tests (Option 1)
npm test -- data-validation-tests.js

# Run all data validation tests (Option 2)
npm run test:validation

# Run all data validation tests (Option 3)
./run-validation-tests.sh

# Run a specific test suite
npm test -- -t "10.1 Request Validation"

# Run a specific test case
npm test -- -t "VAL-001"
```

## Test Cases

### 10.1 Request Validation

| TC-ID | Test Case | Expected Result | Priority |
|-------|-----------|-----------------|----------|
| VAL-001 | Required field validation | Missing required fields return validation errors | P0 |
| VAL-002 | Data type validation | Incorrect data types return validation errors | P0 |
| VAL-003 | Field format validation | Fields not matching format rules return validation errors | P0 |
| VAL-004 | Enum/choice validation | Invalid enum values return validation errors | P0 |
| VAL-005 | Range/length validation | Values outside allowed ranges return validation errors | P0 |
| VAL-006 | Custom validation scripts | Custom validation rules are executed correctly | P1 |

### 10.2 Response Validation

| TC-ID | Test Case | Expected Result | Priority |
|-------|-----------|-----------------|----------|
| VAL-007 | Success response structure validation | Responses match expected schema | P0 |
| VAL-008 | Error response structure validation | Error responses match expected schema | P0 |
| VAL-009 | Metadata presence validation | All responses include metadata object | P0 |
| VAL-010 | Data type validation in responses | Response data types match specification | P0 |

## Validation Error Response Format

All validation errors should follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ValidationError",
    "message": "Request validation failed",
    "errors": {
      "fieldName": [
        "Error message for this field"
      ],
      "nestedField.property": [
        "Error message for this nested property"
      ]
    }
  },
  "metadata": {
    "ProcessedAt": "2026-01-07T06:43:52.289Z",
    "correlationId": "uuid-value-here"
  }
}
```

## Success Response Format

All success responses should follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  },
  "metadata": {
    "ProcessedAt": "2026-01-07T06:43:52.289Z",
    "correlationId": "uuid-value-here"
  }
}
```

## Common Validation Rules

### STP Endpoint

- `operation`: Required, string, must be a valid operation name
- `fields`: Required, object, contains operation-specific fields
  - `function`: String, must be one of the allowed values (e.g., "PTI")
  - `transaction_type`: String, must be one of the allowed values (e.g., "ERT")
  - `account_number`: String, must start with a letter, length between 5-20 characters
  - `processing_code`: String, must be one of the allowed values (e.g., "A")
  - `reference_code`: String, length between 1-20 characters

### Inquiry Endpoint

- `endpoint`: Required, string, must be a valid endpoint name
- `parameters`: Required, object, contains endpoint-specific parameters
  - `loginId`: String, alphanumeric, length between 3-20 characters
  - `tenantId`: String, alphanumeric, length between 2-10 characters
  - `searchCrit`: String, must be one of the allowed values
  - `searchValue`: String, length between 1-255 characters

## Troubleshooting

### Common Issues

1. **Token Expiration**: The most common issue is an expired authentication token. If you see errors like "Token has expired" or consistent 401/403 responses, you need to update your token:
   
   ```
   # Error message indicating token expiration
   {"message": "Token has expired"}
   ```
   
   **Solution**:
   - Get a new token from Postman or your authentication service
   - Update the token in your `.env` file or directly in `config.js`
   - The token is stored in the `AUTH_TOKEN` environment variable

2. **Test environment configuration**: Ensure the `config.js` file has the correct API base URL and authentication credentials.

3. **API availability**: Verify that the API is running and accessible before running tests.

4. **Test data**: If tests are failing due to invalid test data, check the `config.js` file and update the test data as needed.

### Debugging Tips

1. Add console.log statements to print response data:

```javascript
console.log(JSON.stringify(response.data, null, 2));
```

2. Use the `--verbose` flag to see more detailed test output:

```bash
npm test -- data-validation-tests.js --verbose
```

3. Run a single test case to isolate issues:

```bash
npm test -- -t "VAL-001" data-validation-tests.js
```

## Reporting Issues

When reporting validation issues, include:

1. The test case ID (e.g., VAL-001)
2. The request payload that triggered the issue
3. The actual response received
4. The expected response
5. Any relevant error messages

Use the GitHub issue template for reporting validation issues.