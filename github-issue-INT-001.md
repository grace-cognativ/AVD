---
name: Integration Issue Report
about: Report an issue with external service integration in the AddVantage API
title: "[INT] "
labels: integration, bug
assignees: ''
---

## Integration Issue Description

**Test Case ID:** INT-00X

**Issue Type:** External Service Integration Issue

**Severity:** P1 (High)

## Expected Behavior
<!-- Describe what should happen -->

The API should successfully integrate with external services (Format Management Service, Legacy Service) and handle errors gracefully.

## Actual Behavior
<!-- Describe what actually happens -->

The API fails to properly integrate with the external service or does not handle errors correctly.

## Steps to Reproduce

1. Send a request to the API endpoint that requires integration with the external service
2. Observe the response

## Request Details

**Endpoint:** `/api/v1/stp`

**Method:** POST

**Headers:**
```
Authorization: Bearer {token}
AddVantage-Authorization: Basic {base64_credentials}
uuid: {valid_uuid}
Content-Type: application/json
```

**Body:**
```json
{
  "operation": "CustomerPayment",
  "fields": {
    "function": "PTI",
    "transaction_type": "ERT",
    "account_number": "A4345333",
    "processing_code": "A",
    "reference_code": "3FER"
  }
}
```

## Response Details

**Status Code:** 502

**Response Body:**
```json
{
  "success": false,
  "error": {
    "code": "ExternalServiceError",
    "message": "Error communicating with Format Management Service",
    "details": "Connection refused"
  },
  "metadata": {
    "ProcessedAt": "2026-01-06T11:24:00.000Z",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Environment

**Environment:** Development

**API Base URL:** https://nah-avd-dev.cognativ.com

**External Service URL:** https://nah-fmt-dev.cognativ.com

## Additional Context

<!-- Add any other context about the problem here -->

This issue prevents the API from functioning correctly when the external service is unavailable or experiencing issues.

## Possible Fix

Ensure the API:
1. Implements proper retry logic for external service calls
2. Uses circuit breaker pattern to prevent cascading failures
3. Returns appropriate error responses when external services are unavailable
4. Properly caches format definitions to reduce dependency on the Format Management Service

## Screenshots

<!-- If applicable, add screenshots to help explain your problem -->