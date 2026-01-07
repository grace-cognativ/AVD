# CORS Testing Guide for AddVantage API

This guide provides detailed information on testing Cross-Origin Resource Sharing (CORS) functionality in the AddVantage API.

## Table of Contents

- [Overview](#overview)
- [Test Cases](#test-cases)
- [Testing Tools](#testing-tools)
- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Environment-Specific Considerations](#environment-specific-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

Cross-Origin Resource Sharing (CORS) is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the original page. The AddVantage API implements CORS to allow specific origins to access its resources while blocking unauthorized origins.

### Key CORS Concepts

1. **Same-Origin Policy**: By default, browsers restrict cross-origin HTTP requests initiated from scripts.
2. **Preflight Requests**: For non-simple requests, browsers send an OPTIONS request to check if the actual request is allowed.
3. **CORS Headers**: The server includes specific headers in responses to indicate which origins, methods, and headers are allowed.

## Test Cases

### CORS-001: Preflight OPTIONS request from allowed origin

**Description**: Verify that OPTIONS requests from allowed origins return 200 OK with appropriate CORS headers.

**Steps**:
1. Send an OPTIONS request to an API endpoint (e.g., `/api/v1/stp`)
2. Include `Origin: https://app.cognativ.com` header
3. Include `Access-Control-Request-Method: POST` header
4. Include `Access-Control-Request-Headers: Content-Type, Authorization, AddVantage-Authorization, uuid` header

**Expected Result**:
- Status code: 200 OK
- Response includes headers:
  - `Access-Control-Allow-Origin: https://app.cognativ.com`
  - `Access-Control-Allow-Methods: POST, OPTIONS, ...`
  - `Access-Control-Allow-Headers: Content-Type, Authorization, AddVantage-Authorization, uuid, ...`
  - `Access-Control-Max-Age: [some value]`

### CORS-002: Preflight OPTIONS request from disallowed origin

**Description**: Verify that OPTIONS requests from disallowed origins do not include CORS headers that would allow the request.

**Steps**:
1. Send an OPTIONS request to an API endpoint (e.g., `/api/v1/stp`)
2. Include `Origin: https://malicious-site.example.com` header
3. Include `Access-Control-Request-Method: POST` header
4. Include `Access-Control-Request-Headers: Content-Type, Authorization, AddVantage-Authorization, uuid` header

**Expected Result**:
- Either:
  - Status code: 200 OK but without CORS headers that match the request origin
  - Status code: 403 Forbidden
- Response should not include `Access-Control-Allow-Origin: https://malicious-site.example.com`
- In a real browser, this would result in a CORS error and the browser would block the actual request

### CORS-003: Actual request from allowed origin

**Description**: Verify that actual requests from allowed origins succeed with CORS headers.

**Steps**:
1. Send a POST request to an API endpoint (e.g., `/api/v1/stp`)
2. Include `Origin: https://app.cognativ.com` header
3. Include all required headers for the request (Authorization, etc.)
4. Include a valid request body

**Expected Result**:
- Request is processed normally (status code depends on the request validity)
- Response includes header: `Access-Control-Allow-Origin: https://app.cognativ.com`
- Other CORS headers may be included as well

### CORS-004: CORS headers in response

**Description**: Verify that responses include appropriate CORS headers.

**Steps**:
1. Send a GET request to a public endpoint (e.g., `/api/v1/health`)
2. Include `Origin: https://app.cognativ.com` header

**Expected Result**:
- Response includes headers:
  - `Access-Control-Allow-Origin: https://app.cognativ.com`
  - `Access-Control-Allow-Methods: GET, POST, OPTIONS, ...`
  - `Vary: Origin` (important for caching)

## Testing Tools

### Automated Testing

The automated test suite includes CORS tests in `cors-testing.js`. Run these tests with:

```bash
# Run only CORS tests
npm run test:cors

# Or using the shell script
./run-tests.sh --cors
```

### Manual Testing

For manual testing, you can use:

1. **Postman**:
   - Set the `Origin` header in your request
   - For preflight testing, send OPTIONS requests with appropriate headers

2. **curl**:
   ```bash
   # Preflight request
   curl -X OPTIONS https://nah-avd-dev.cognativ.com/api/v1/stp \
     -H "Origin: https://app.cognativ.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization, AddVantage-Authorization, uuid" \
     -v
   
   # Actual request
   curl -X GET https://nah-avd-dev.cognativ.com/api/v1/health \
     -H "Origin: https://app.cognativ.com" \
     -v
   ```

3. **Browser Developer Tools**:
   - Create a simple HTML page with JavaScript that makes cross-origin requests
   - Use the Network tab to observe the preflight request and actual request
   - Check for CORS errors in the Console

## Environment-Specific Considerations

CORS configuration may vary by environment:

- **Development**: CORS might be more permissive to facilitate testing
- **Production**: CORS should be strictly configured to allow only specific origins

Always verify the CORS configuration is appropriate for the environment being tested.

## Troubleshooting

### Common CORS Issues

1. **Missing CORS Headers**:
   - Check if the server is configured to include CORS headers
   - Verify the `Origin` header is being sent in the request

2. **Incorrect Origin Value**:
   - Ensure the origin in the request matches an allowed origin
   - Check for exact matches (including protocol, subdomain, and port)

3. **Missing Preflight Response**:
   - Verify the server handles OPTIONS requests correctly
   - Check if all requested methods and headers are allowed

4. **Credentials Issues**:
   - If using credentials, verify `Access-Control-Allow-Credentials: true` is included
   - When credentials are allowed, `Access-Control-Allow-Origin` cannot be `*`

### Reporting CORS Issues

When reporting CORS issues, include:

1. The complete request (including all headers)
2. The complete response (including all headers)
3. The browser console error message (if applicable)
4. The environment where the issue occurs

Use the GitHub issue template `github-issue-CORS-001.md` as a starting point.

## References

- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS Protocol Specification](https://fetch.spec.whatwg.org/#cors-protocol)
- [AddVantage API Documentation](https://nah-avd-dev.cognativ.com/swagger/index.html)