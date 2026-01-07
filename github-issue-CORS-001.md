---
name: CORS Issue Report
about: Report an issue with CORS configuration in the AddVantage API
title: "[CORS] "
labels: cors, bug
assignees: ''
---

## CORS Issue Description

**Test Case ID:** CORS-00X

**Issue Type:** CORS Configuration Issue

**Severity:** P1 (High)

## Expected Behavior
<!-- Describe what should happen -->

The API should respond with appropriate CORS headers when requests come from allowed origins.

## Actual Behavior
<!-- Describe what actually happens -->

The API does not include the expected CORS headers in the response.

## Steps to Reproduce

1. Send a preflight OPTIONS request to the API endpoint with Origin header set to an allowed origin
2. Observe the response headers

## Request Details

**Endpoint:** `/api/v1/stp`

**Method:** OPTIONS

**Headers:**
```
Origin: https://app.cognativ.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization, AddVantage-Authorization, uuid
```

## Response Details

**Status Code:** 200

**Headers:**
```
<!-- List the headers received in the response -->
```

## Expected CORS Headers

The response should include the following CORS headers:
- Access-Control-Allow-Origin: https://app.cognativ.com
- Access-Control-Allow-Methods: POST, OPTIONS
- Access-Control-Allow-Headers: Content-Type, Authorization, AddVantage-Authorization, uuid
- Access-Control-Max-Age: (some value)

## Environment

**Environment:** Development

**API Base URL:** https://nah-avd-dev.cognativ.com

**Browser:** Chrome 120.0.6099.109

## Additional Context

<!-- Add any other context about the problem here -->

This issue prevents web applications from making cross-origin requests to the API.

## Possible Fix

Ensure the CORS middleware is properly configured to:
1. Allow the specified origins
2. Include the appropriate headers in the response
3. Handle preflight OPTIONS requests correctly

## Screenshots

<!-- If applicable, add screenshots to help explain your problem -->