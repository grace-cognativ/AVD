# Integration Testing Guide for AddVantage API

This guide provides detailed information on testing the integration between the AddVantage API and its external dependencies, specifically the Format Management Service and Legacy Service.

## Table of Contents

- [Overview](#overview)
- [Test Cases](#test-cases)
- [Testing Tools](#testing-tools)
- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Troubleshooting](#troubleshooting)
- [Service Virtualization](#service-virtualization)

## Overview

The AddVantage API integrates with two primary external services:

1. **Format Management Service**: Provides format definitions for STP operations and inquiry endpoints
2. **Legacy Service**: Processes STP operations and inquiry requests

Integration testing verifies that these integrations work correctly, including:
- Successful communication with external services
- Proper handling of external service errors
- Caching mechanisms for format definitions
- Retry and circuit breaker patterns

## Test Cases

### INT-001: Format Management Service integration - successful

**Description**: Verify that the API successfully retrieves format definitions from the Format Management Service.

**Steps**:
1. Send a request to an API endpoint that requires format definitions (e.g., `/api/v1/stp`)
2. Include all required headers and a valid request body

**Expected Result**:
- Status code: 200 OK
- Response indicates successful processing
- Format definitions are retrieved and used to validate the request

### INT-002: Format Management Service integration - service unavailable

**Description**: Verify that the API handles Format Management Service unavailability gracefully.

**Steps**:
1. Configure the Format Management Service to be unavailable (or use service virtualization)
2. Send a request to an API endpoint that requires format definitions

**Expected Result**:
- Status code: 502 Bad Gateway
- Error code: ExternalServiceError
- Error message indicates Format Management Service issue
- Response includes correlation ID for troubleshooting

### INT-003: Format Management Service integration - timeout

**Description**: Verify that the API handles Format Management Service timeouts gracefully.

**Steps**:
1. Configure the Format Management Service to time out (or use service virtualization)
2. Send a request to an API endpoint that requires format definitions

**Expected Result**:
- Status code: 502 Bad Gateway or 504 Gateway Timeout
- Error message indicates timeout issue
- Response includes correlation ID for troubleshooting

### INT-004: Legacy Service integration - successful

**Description**: Verify that the API successfully forwards requests to the Legacy Service and parses responses.

**Steps**:
1. Send a request to an API endpoint that requires Legacy Service (e.g., `/api/v1/stp`)
2. Include all required headers and a valid request body

**Expected Result**:
- Status code: 200 OK
- Response includes parsed Legacy Service response
- Response includes metadata with processing time

### INT-005: Legacy Service integration - service unavailable

**Description**: Verify that the API handles Legacy Service unavailability gracefully.

**Steps**:
1. Configure the Legacy Service to be unavailable (or use service virtualization)
2. Send a request to an API endpoint that requires Legacy Service

**Expected Result**:
- Status code: 502 Bad Gateway
- Error code: ExternalServiceError
- Error message indicates Legacy Service issue
- Response includes correlation ID for troubleshooting

### INT-006: Legacy Service integration - timeout

**Description**: Verify that the API handles Legacy Service timeouts gracefully.

**Steps**:
1. Configure the Legacy Service to time out (or use service virtualization)
2. Send a request to an API endpoint that requires Legacy Service

**Expected Result**:
- Status code: 504 Gateway Timeout
- Error message indicates timeout issue
- Response includes correlation ID for troubleshooting

### INT-007: Format definition caching

**Description**: Verify that format definitions are cached to improve performance.

**Steps**:
1. Send a request to an API endpoint that requires format definitions
2. Send a second identical request immediately after the first

**Expected Result**:
- Both requests succeed
- The second request should be faster (lower processing time)
- No additional calls to Format Management Service for the second request

### INT-008: Format definition cache expiration

**Description**: Verify that cached format definitions expire after the configured time.

**Steps**:
1. Send a request to an API endpoint that requires format definitions
2. Wait for the cache expiration time (5 minutes by default)
3. Send a second identical request

**Expected Result**:
- Both requests succeed
- The API retrieves fresh format definitions from Format Management Service after cache expiration

## Testing Tools

### Automated Testing

The automated test suite includes integration tests in `integration-testing.js`. Run these tests with:

```bash
# Run only integration tests
npm run test:integration

# Or using the shell script
./run-tests.sh --integration
```

### Manual Testing

For manual testing, you can use:

1. **Postman**:
   - Create a collection for integration tests
   - Set up environment variables for different scenarios
   - Use pre-request scripts to manipulate request data

2. **curl**:
   ```bash
   # Test successful integration
   curl -X POST https://nah-avd-dev.cognativ.com/api/v1/stp \
     -H "Authorization: Bearer ${AUTH_TOKEN}" \
     -H "AddVantage-Authorization: ${ADD_VANTAGE_AUTH}" \
     -H "uuid: ${UUID}" \
     -H "Content-Type: application/json" \
     -d '{
       "operation": "CustomerPayment",
       "fields": {
         "function": "PTI",
         "transaction_type": "ERT",
         "account_number": "A4345333",
         "processing_code": "A",
         "reference_code": "3FER"
       }
     }' \
     -v
   ```

## Troubleshooting

### Common Integration Issues

1. **Connection Refused**:
   - Check if the external service is running
   - Verify network connectivity
   - Check firewall rules

2. **Timeout Issues**:
   - Check if the external service is overloaded
   - Verify timeout configuration is appropriate
   - Check for network latency issues

3. **Authentication Issues**:
   - Verify credentials are correct
   - Check if authentication tokens are expired
   - Ensure required headers are included

4. **Caching Issues**:
   - Verify cache expiration time is configured correctly
   - Check if cache is being invalidated properly
   - Monitor cache hit/miss rates

### Reporting Integration Issues

When reporting integration issues, include:

1. The complete request (including all headers)
2. The complete response (including all headers)
3. Timestamps for when the issue occurred
4. Correlation IDs for request tracking
5. Any relevant logs from the API and external services

Use the GitHub issue template `github-issue-INT-001.md` as a starting point.

## Service Virtualization

For testing external service failures and timeouts, service virtualization is recommended. This allows you to simulate different behaviors of external services without affecting real systems.

### Options for Service Virtualization

1. **Mock Servers**:
   - Use tools like Mockoon, WireMock, or Prism to create mock servers
   - Configure different responses for different scenarios
   - Simulate timeouts, errors, and successful responses

2. **Environment Configuration**:
   - Use environment variables to enable mock modes in the API
   - Configure the API to use mock implementations instead of real services
   - Set `MOCK_UNAVAILABLE_SERVICES=true` or `MOCK_TIMEOUT_SERVICES=true` in the `.env` file

3. **Test Proxies**:
   - Use tools like Charles Proxy or Fiddler to intercept and modify requests/responses
   - Configure rules to simulate different scenarios
   - Record and replay real interactions for testing

### Example: Mocking Format Management Service Unavailability

```bash
# Set environment variables for mocking
export MOCK_UNAVAILABLE_SERVICES=true

# Run integration tests with mocking enabled
npm run test:integration
```

## References

- [AddVantage API Documentation](https://nah-avd-dev.cognativ.com/swagger/index.html)
- [Format Management Service Documentation](https://nah-fmt-dev.cognativ.com/swagger/index.html)
- [Circuit Breaker Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [Retry Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)