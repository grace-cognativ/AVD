---
name: Data Validation Issues
about: Report issues with API data validation
title: "[AddVantage_Main]BUG: Data Validation Issues Identified in Automated Tests"
labels: validation, bug
assignees: '@jesse-cognativ'
---

## Issue Description

**Test Category:** Data Validation Testing
**Environment:** Development

### Summary

During automated testing of the data validation capabilities of the AddVantage API, several issues were identified where the API's validation responses do not match the expected behavior defined in the QA plan. All tests are currently failing with a 404 Not Found status code instead of the expected 400 Bad Request for validation errors or 200 OK for successful responses.

## Issues Found

| Test ID | Test Case | Expected | Actual | Pass/Fail |
|---------|-----------|----------|--------|-----------|
| VAL-001 | Required field validation | 400 Bad Request with validation errors | 404 Not Found | FAIL |
| VAL-002 | Data type validation | 400 Bad Request with validation errors | 404 Not Found | FAIL |
| VAL-003 | Field format validation | 400 Bad Request with validation errors | 404 Not Found | FAIL |
| VAL-004 | Enum/choice validation | 400 Bad Request with validation errors | 404 Not Found | FAIL |
| VAL-005 | Range/length validation | 400 Bad Request with validation errors | 404 Not Found | FAIL |
| VAL-006 | Custom validation scripts | 400 Bad Request with validation errors | 404 Not Found | FAIL |
| VAL-007 | Success response structure | 200 OK with success response | 404 Not Found | FAIL |
| VAL-008 | Error response structure | 400 Bad Request with error structure | 404 Not Found | FAIL |
| VAL-009 | Metadata presence | Metadata object in all responses | 404 Not Found, empty response | FAIL |
| VAL-010 | Response data type validation | 200 OK with correct data types | 404 Not Found | FAIL |

### Steps to Reproduce

1. Run the data validation test suite:
```bash
npm test -- data-validation-tests.js
```

2. Observe that all tests fail with a 404 Not Found status code instead of the expected status codes.

## Expected Behavior

### Request Validation (VAL-001 to VAL-006)
- Invalid requests should return 400 Bad Request status code
- Response should include a ValidationError code
- Response should include specific error details for each validation failure
- Response should follow the standard error format with success:false, error object, and metadata

### Response Validation (VAL-007 to VAL-010)
- Valid requests should return 200 OK status code
- Success responses should include success:true, data object, and metadata
- Error responses should follow the standard error format
- All responses should include a metadata object with ProcessedAt timestamp

## Actual Behavior

All endpoints are returning 404 Not Found status code regardless of the request validity. This suggests that either:

1. The API endpoints are not properly implemented or deployed
2. The routing configuration is incorrect
3. The API is not handling the requests correctly

## Test Evidence

### Example Test Failure (VAL-001):
```
expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 404

  72 | const validateValidationErrorResponse = (response, fieldName) => {
  73 |   // Check HTTP status code
> 74 |   expect(response.status).toBe(400);
     |                           ^
  75 |   
  76 |   // Check basic response structure
  77 |   expect(response.data).toHaveProperty('success', false);
```

### Example Test Failure (VAL-007):
```
expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404

  29 | const validateSuccessResponseStructure = (response) => {
  30 |   // Check HTTP status code
> 31 |   expect(response.status).toBe(200);
     |                           ^
  32 |   
  33 |   // Check basic response structure
  34 |   expect(response.data).toHaveProperty('success', true);
```

## Additional Information

- All 10 data validation tests are failing with the same 404 Not Found status code
- The issue affects both the STP and Inquiry endpoints
- The issue affects both request validation and response validation tests
- The API specification clearly defines the expected validation behavior and response formats

## Failing Endpoints

Based on the test results and code analysis, the following endpoints are failing:

### 1. `/api/v1/stp` Endpoint

**Status:** FAILING with 404 Not Found

**Failing Test Cases**:
- VAL-001: Required field validation (missing operation field)
- VAL-002: Data type validation (incorrect data types)
- VAL-003: Field format validation (invalid field formats)
- VAL-004: Enum/choice validation (invalid enum values)
- VAL-005: Range/length validation (values outside allowed ranges)
- VAL-006: Custom validation scripts (custom validation rules)
- VAL-007: Success response structure validation
- VAL-008: Error response structure validation
- VAL-009: Metadata presence validation
- VAL-010: Data type validation in responses

**Expected Behavior**:
- Should return 400 Bad Request for validation errors
- Should return 200 OK for successful requests
- Should include proper error structure with validation details
- Should include metadata in all responses

**Actual Behavior**:
- Returns 404 Not Found for all requests
- No proper error structure or validation details
- No metadata in responses

### 2. `/api/v1/inquiry` Endpoint

**Status:** FAILING with 404 Not Found

**Failing Test Cases**:
- VAL-001: Required field validation (missing endpoint field, missing parameters)
- VAL-002: Data type validation (incorrect data types)
- VAL-003: Field format validation (invalid field formats)
- VAL-005: Range/length validation (values outside allowed ranges)
- VAL-006: Custom validation scripts (conditional field requirements)
- VAL-007: Success response structure validation
- VAL-010: Data type validation in responses

**Expected Behavior**:
- Should return 400 Bad Request for validation errors
- Should return 200 OK for successful requests
- Should include proper error structure with validation details
- Should include metadata in all responses

**Actual Behavior**:
- Returns 404 Not Found for all requests
- No proper error structure or validation details
- No metadata in responses

## Recommended Next Steps for Assignee

- Reproduce failures locally and capture request/response payloads for both endpoints
- Confirm whether issue is routing, missing handlers, or deployment
- Implement fixes to routing/handlers and add validation middleware
- Add tests to cover fixed behavior and prevent regressions
- Verify that VAL-001 → VAL-010 pass for both endpoints and update this issue with results

## Impact

This issue prevents proper validation of API requests, which could lead to:

1. Invalid data being processed by the system
2. Poor developer experience when integrating with the API
3. Inability to properly test the API's validation capabilities
4. Potential data integrity issues if invalid requests are processed

## Suggested Fix

1. Verify that all API endpoints are properly implemented and deployed
2. Ensure that the routing configuration is correct
3. Implement proper request validation for all endpoints
4. Return appropriate status codes and error messages for validation failures
5. Follow the standard response format for both success and error responses
6. Include metadata in all responses

### Implementation Recommendations

1. Implement middleware for request validation
2. Use a validation library (e.g., Joi, express-validator) for request validation
3. Create standardized error handling middleware
4. Ensure all responses follow the defined schema
5. Add comprehensive logging for debugging

## Related Issues

This issue is similar to the error handling issues identified in ERR-001, suggesting a systemic problem with the API's request handling and response formatting.