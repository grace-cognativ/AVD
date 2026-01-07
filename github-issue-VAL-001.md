---
name: Data Validation Issue
about: Report an issue with API data validation
title: "[VAL] "
labels: validation, bug
assignees: ''
---

## Issue Description

**Test Case ID:** VAL-001
**Priority:** P0
**Environment:** Development

### Summary

Required field validation is not working correctly for the STP endpoint. The API accepts requests with missing required fields without returning proper validation errors.

### Steps to Reproduce

1. Send a POST request to `/api/v1/stp` with the following payload (missing the required `operation` field):

```json
{
  "fields": {
    "function": "PTI",
    "transaction_type": "ERT",
    "account_number": "A4345333",
    "processing_code": "A",
    "reference_code": "3FER"
  }
}
```

2. Observe the response

### Expected Result

The API should return a 400 Bad Request response with a ValidationError code and specific error details about the missing `operation` field:

```json
{
  "success": false,
  "error": {
    "code": "ValidationError",
    "message": "Request validation failed",
    "errors": {
      "operation": [
        "The operation field is required"
      ]
    }
  },
  "metadata": {
    "ProcessedAt": "2026-01-07T06:43:52.289Z",
    "correlationId": "uuid-value-here"
  }
}
```

### Actual Result

The API accepts the request and returns a 500 Internal Server Error:

```json
{
  "success": false,
  "error": {
    "code": "ServerError",
    "message": "An unexpected error occurred"
  },
  "metadata": {
    "ProcessedAt": "2026-01-07T06:43:52.289Z",
    "correlationId": "uuid-value-here"
  }
}
```

### Test Evidence

**Request:**
```
POST /api/v1/stp HTTP/1.1
Host: nah-avd-dev.cognativ.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkIwRUM1M0QwRUJCMUUzOUE1NTkzOTA2NzUzODU2MDY1REI3NzAyNjgiLCJ0eXAiOiJKV1QifQ...
AddVantage-Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
uuid: 123e4567-e89b-12d3-a456-426614174000

{
  "fields": {
    "function": "PTI",
    "transaction_type": "ERT",
    "account_number": "A4345333",
    "processing_code": "A",
    "reference_code": "3FER"
  }
}
```

**Response:**
```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
Date: Wed, 07 Jan 2026 06:43:52 GMT

{
  "success": false,
  "error": {
    "code": "ServerError",
    "message": "An unexpected error occurred"
  },
  "metadata": {
    "ProcessedAt": "2026-01-07T06:43:52.289Z",
    "correlationId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Additional Information

- This issue was discovered during automated testing of the data validation requirements
- The issue is reproducible in the development environment
- The issue affects all operations in the STP endpoint
- The API specification clearly states that the `operation` field is required

### Impact

**Severity:** High

This issue could lead to:
- Data corruption if invalid requests are processed
- Unexpected server errors instead of clear validation messages
- Poor developer experience when integrating with the API

### Suggested Fix

Implement proper request validation for all required fields before processing the request. The validation should:

1. Check for the presence of all required fields
2. Return a 400 Bad Request with ValidationError code
3. Include specific error messages for each missing field
4. Follow the standard error response format

```javascript
// Pseudocode for validation
if (!request.body.operation) {
  return {
    status: 400,
    body: {
      success: false,
      error: {
        code: "ValidationError",
        message: "Request validation failed",
        errors: {
          operation: ["The operation field is required"]
        }
      },
      metadata: {
        ProcessedAt: new Date().toISOString(),
        correlationId: request.headers["uuid"]
      }
    }
  };
}