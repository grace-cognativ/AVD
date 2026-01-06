# QA Test Plan and Acceptance Criteria for AddVantage Main API

## Overview

This document provides a comprehensive test plan and acceptance criteria from a QA perspective for the AddVantage Main API deployed at `https://nah-avd-dev.cognativ.com`. The API provides STP (Straight-Through Processing) operations, Inquiry operations, and Health Check endpoints with JWT authentication, rate limiting, and integration with external services.

## Test Environment

- **Base URL**: `https://nah-avd-dev.cognativ.com`
- **Swagger Documentation**: `https://nah-avd-dev.cognativ.com/swagger/index.html`
- **API Versions**: V1 (all endpoints), V2 (health checks only)
- **Authentication Provider**: Corio IDP (`https://nah-idp-dev.cognativ.com`)

## Test Scope

### In Scope

- Functional testing of all API endpoints
- Authentication and authorization testing
- Request/response validation
- Error handling and edge cases
- Rate limiting behavior
- Health check endpoints
- CORS configuration (if applicable)
- Integration with external services (Format Management Service, Legacy Service)

### Out of Scope

- Performance/Load testing (covered by separate performance tests)
- Security penetration testing (covered by security team)
- Infrastructure and deployment testing

---

## 1. Authentication & Authorization Testing

### 1.1 JWT Authentication

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail | Actual Results |
|-------|-----------|-----------------|----------|---------|
| AUTH-001 | Request without Authorization header | 401 Unauthorized with appropriate error message | Fail | **Error: response status is 401 without error message** |
| AUTH-002 | Request with invalid JWT token format | 401 Unauthorized with validation error | Fail | **Error: response status is 401 without error message** |
| AUTH-003 | Request with expired JWT token | 401 Unauthorized with expiration error | Pass | **Error: response status is 401** ```{"success": false,"error": {"code": "UNAUTHORIZED","message": "Authentication Failed","details": null,"errors": {}},"metadata": {"message": "Token has expired"}}``` |
| AUTH-004 | Request with valid JWT token in Authorization header | Request processed successfully | Pass | ```{"success": true,"data": {"batchId": "BATCH-2025-12-16-001","totalItems": 2,"processedItems": 0,"success": false,"legacyResponses": [],"failedAtIndex": 0,"validationErrors": {"Item[0].external_source_id": ["External source ID is required"]}}}``` |
| AUTH-005 | Request with JWT token missing required claims (sub, scope, iss, aud) | 401 Unauthorized with missing claim error | Pass | **Error: response status is 401** ```{"success": false,"error": {"code": "UNAUTHORIZED","message": "Authentication Failed","details": null,"errors":{}},"metadata": {"message": "Invalid token"}}``` |
| AUTH-006 | Request with JWT token from incorrect issuer | 401 Unauthorized with issuer validation error | Fail | **Error: response status is 401 without error message** |
| AUTH-007 | Request with JWT token for incorrect audience | 401 Unauthorized with audience validation error | Pass | **Error: response status is 401** ```{"success": false,"error": {"code": "UNAUTHORIZED","message": "Authentication Failed","details": null,"errors": {}},"metadata": {"message": "Invalid token"}}``` |
| AUTH-008 | Health check endpoints without authentication | Request succeeds (health endpoints are public) | Fail | **Error: response status is 503** ```{"status": "Not Ready","totalDurationMs": 181,"timestamp": "2025-12-31T12:54:35.326472+00:00","success": false,"data": {"main_api": {"status":"Ready","durationMs": 0},"format_management_service": {"status": "Ready","description": "Format Management Service is healthy","durationMs": 181},"legacy_service": {"status": "Not Ready","description": "Legacy Service is unhealthy","durationMs": 7}}}``` |

**Acceptance Criteria:**

- All protected endpoints return 401 when JWT token is missing or invalid
- Error responses include error code, message, and details (in development mode)
- Health check endpoints (`/api/v1/health`, `/api/v1/health/ready`) are accessible without authentication
- JWT token validation uses OIDC discovery for key rotation support

### 1.2 Authorization Policies

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|----------|-----------|
| AUTH-009 | STP endpoint with token missing `addvantage.stp` scope | 403 Forbidden (if policy enforced) | Partial Fail | Response status is 401 (needs clarity as policy is not enforced at the moment) |
| AUTH-010 | Inquiry endpoint with token missing `addvantage.inquiry` scope | 403 Forbidden (if policy enforced) | Partial Fail | Response status is 401 (needs clarity as policy is not enforced at the moment) |
| AUTH-011 | Request with token having appropriate scope for both addvantage.stp and addvantage.inquiry | Request processed successfully | Pass | Response status is 200 |

**Acceptance Criteria:**

- Authorization policies are enforced based on endpoint requirements
- Appropriate 403 Forbidden responses returned for insufficient permissions
- Error messages clearly indicate authorization failure

---

## 2. STP Operations Testing

### 2.1 POST /api/v1/stp - Single STP Operation

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|----------|----------------|
| STP-001 | Valid STP request with all required fields | 200 OK with success response containing transactionId, status, processedAt, legacyResponse | Pass |
| STP-002 | STP request with missing `operation` field | 400 Bad Request with validation error for operation field | Pass |
| STP-003 | STP request with missing `fields` dictionary | 400 Bad Request with validation error for fields | Pass |
| STP-004 | STP request with empty `fields` dictionary | 400 Bad Request with validation error indicating fields cannot be empty | Pass |
| STP-005 | STP request with invalid operation name | 404 Not Found with FormatNotFound error | Pass |
| STP-006 | STP request missing `AddVantage-Authorization` header | 400 Bad Request with validation error for missing header | Fail | No error response |
| STP-007 | STP request missing `uuid` header | 400 Bad Request with validation error for missing UUID header | Fail | No error response |
| STP-008 | STP request with invalid UUID format | 400 Bad Request with validation error for invalid UUID format | Pass |
| STP-009 | STP request with invalid `AddVantage-Authorization` format | 400 Bad Request with validation error | Pass |
| STP-010 | STP request with fields failing format validation rules | 400 Bad Request with field-specific validation errors | Pass|
| STP-011 | STP request with non-JSON Content-Type | 400 Bad Request or 415 Unsupported Media Type | Pass |Used Postman here
| STP-012 | STP request with malformed JSON body | 400 Bad Request with JSON parsing error | Pass |
| STP-013 | STP request when Format Management Service is unavailable | 502 Bad Gateway with ExternalServiceError | Fail | Returns 404 instead of expected 502
| STP-014 | STP request when Legacy Service is unavailable | 502 Bad Gateway with ExternalServiceError | TBD | Not yet tested

**Acceptance Criteria:**

- Successful requests return 200 OK with structured response containing `success: true`, `data` object, and `metadata`
- All validation errors return 400 Bad Request with detailed error information grouped by field
- Required headers (`AddVantage-Authorization`, `uuid`) are validated before processing
- Format definitions are retrieved from Format Management Service and cached appropriately
- Request fields are validated against format definition rules before transformation
- Validated requests are transformed to legacy format and forwarded to Legacy Service
- Legacy Service responses are parsed and standardized in the API response
- Processing time is included in metadata
- Correlation ID is included in response metadata for request tracking

**Request Structure:**

```json
{
  "operation": "CustomerPayment",
  "fields": {
    "function": "PTI",
    "transaction_type": "ERT",
    "account_number": "A4345333",
    "processing_code": "A",
    "branch_id": "Bank",
    "terminal_id": "TTY90",
    "bank_code": 32432,
    "merchant_id": "FEH45",
    "transaction_flag": "M",
    "reference_code": "3FER"
  }
}
```

**Success Response Structure:**

```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-2025-12-16-001234",
    "status": "Processed",
    "processedAt": "2025-12-16T21:26:38.001629Z",
    "legacyResponse": "SUCCESS|TXN-2025-12-16-001234|Processed"
  },
  "metadata": {
    "ProcessedAt": "2025-12-16T21:26:38.001629Z",
    "Operation": "CustomerPayment",
    "ProcessingTimeMs": 245
  }
}
```

### 2.2 POST /api/v1/stp/batch - Batch STP Operations

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|-----------|-------------|
| BATCH-001 | Valid batch request with multiple items | 200 OK with batch response containing all items processed | Pass|
| BATCH-002 | Batch request with empty items array | 400 Bad Request with error indicating batch cannot be empty | Pass |
| BATCH-003 | Batch request with null items | 400 Bad Request with error indicating batch cannot be empty | Pass |
| BATCH-004 | Batch request exceeding MaxBatchSize (100 items) | 429 Too Many Requests with rate limit error | Partial Pass | Error response status is 429 ({"success": false,"error": {"code":"RATE_LIMIT_EXCEEDED","message": "Rate limit exceeded. Try again in 0 seconds.","errors":{}},"metadata": {"correlationId": "4065ccf0-94f5-45ce-b072-addbdd202eae","timestamp":"2026-01-02T09:43:01.4372523Z"}}) - message should be updated to "Rate limit exceeded MaxBatchSize (100 items)"
| BATCH-005 | Batch request with invalid item at index 0 | 400 Bad Request with validation errors | Pass|
| BATCH-006 | Batch request with invalid item at middle index | 200 OK with partial success, failedAtIndex set, validationErrors populated | Pass |
| BATCH-007 | Batch request with batchId provided | 200 OK with same batchId in response | Pass |
| BATCH-008 | Batch request when batch processing timeout exceeds | 504 Gateway Timeout with timeout error | TBD | Not yet tested
| BATCH-009 | Batch request with all items succeeding | 200 OK with success: true, failedAtIndex: null | Fail |FailedAtIndex:0 since external source id is required
| BATCH-010 | Batch request with mixed success/failure | 200 OK with success: false, failedAtIndex set, legacyResponses for successful items | TBD | Not yet tested

**Acceptance Criteria:**

- Batch requests process items sequentially
- Batch size limit (100 items) is enforced and returns 429 if exceeded
- Batch timeout (300 seconds) is enforced and returns 504 if exceeded
- Partial batch failures are handled gracefully with detailed error information
- Response includes `totalItems`, `processedItems`, `success` flag, `failedAtIndex`, and `validationErrors`
- All successful items include responses in `legacyResponses` array
- Batch ID is preserved in response if provided in request
- Processing time is included in metadata

**Request Structure:**

```json
{
  "batchId": "BATCH-2025-12-16-001",
  "items": [
    {
      "operation": "CustomerPayment",
      "fields": { ... }
    },
    {
      "operation": "CustomerPayment",
      "fields": { ... }
    }
  ]
}
```

**Success Response Structure:**

```json
{
  "success": true,
  "data": {
    "batchId": "BATCH-2025-12-16-001",
    "totalItems": 2,
    "processedItems": 2,
    "success": true,
    "legacyResponses": [
      "SUCCESS|TXN-001|Processed",
      "SUCCESS|TXN-002|Processed"
    ],
    "failedAtIndex": null,
    "validationErrors": null
  },
  "metadata": {
    "ProcessedAt": "2025-12-16T21:26:38.001629Z",
    "ProcessingTimeMs": 512
  }
}
```

---

## 3. Inquiry Operations Testing

### 3.1 POST /api/v1/inquiry

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Result
|-------|-----------|-----------------|----------|--------------|
| INQ-001 | Valid inquiry request with all required parameters | 200 OK with success response containing data object | Pass |
| INQ-002 | Inquiry request with missing `endpoint` field | 400 Bad Request with validation error for endpoint field | Pass |
| INQ-003 | Inquiry request with missing `parameters` object | 400 Bad Request with validation error for parameters | Pass |
| INQ-004 | Inquiry request with invalid endpoint name | 404 Not Found with FormatNotFound error | Pass |
| INQ-005 | Inquiry request with invalid query parameters | 400 Bad Request with parameter-specific validation errors | Pass |
| INQ-006 | Inquiry request missing `AddVantage-Authorization` header | 400 Bad Request with validation error for missing header | Fail | Error: response status is 401 instead of 400 |
| INQ-007 | Inquiry request missing `uuid` header | 400 Bad Request with validation error for missing UUID header | Fail | Error: response status is 401 instead of 400 |
| INQ-008 | Inquiry request with parameters not matching format definition | 400 Bad Request with validation errors | Pass | Validation errors returned correctly |
| INQ-009 | Inquiry request when Format Management Service is unavailable | 502 Bad Gateway with ExternalServiceError | Fail | Returns 404 instead of expected 502 |
| INQ-010 | Inquiry request when Legacy Service is unavailable | 502 Bad Gateway with ExternalServiceError | TBD | Not yet tested
| INQ-011 | Inquiry request with empty parameters object | 400 Bad Request or successful (depending on endpoint requirements) | Pass |

**Acceptance Criteria:**

- Successful requests return 200 OK with parsed response data from Legacy Service
- Endpoint format definitions are retrieved from Format Management Service
- Query parameters are validated against format definition parameter requirements
- URL is constructed using format template with parameter substitution
- Response is parsed using JSONPath expressions from format definition
- Standardized response format is returned with success flag and data object
- Processing time is included in metadata
- Correlation ID is included in response metadata

**Request Structure:**

```json
{
  "endpoint": "HoldingGroupTenantLoginSearch",
  "parameters": {
    "loginId": "RIA100",
    "tenantId": "RIAF",
    "searchCrit": "account",
    "searchValue": "submitted"
  }
}
```

**Success Response Structure:**

```json
{
  "success": true,
  "data": {
    "factor.valid": "300",
    "price.source": "400",
    "account.number": "M10074",
    "account.internal": "1234",
    "security.typeCode": "500",
    "security.subclassCode": "600"
  },
  "metadata": {
    "ProcessedAt": "2025-12-16T21:26:38.001629Z"
  }
}
```

---

## 4. Health Check Testing

### 4.1 GET /api/v1/health

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/fail | ACTUAL RESULT |
|-------|-----------|-----------------|-----------|---------------|
| HEALTH-001 | Health check request | 200 OK with status: "Healthy" or 503 with status: "Unhealthy" | PASS | OK (200) when main API healthy |
| HEALTH-002 | Health check without authentication | Endpoint is public and does NOT return 401; accept 200 or 503 depending on health | CONDITIONAL FAIL | Error observed: response status is 503 (service Not Healthy) — important: should not return 401 |
| HEALTH-003 | Health check response structure validation | Response contains success, status, data, totalDurationMs, timestamp | P0 | see structure below |
| HEALTH-004 | totalDurationMs aggregation validation | `totalDurationMs` equals sum of all reported `durationMs` values | P0 | **New test** |
| HEALTH-005 | main_api description present | `data.main_api.description` exists and is non-empty | P0 | **New test** |
| HEALTH-006 | Response Content-Type and correlation header | `Content-Type` is `application/json` and `X-Correlation-Id` header present | P1 | **New test** |

**Acceptance Criteria:**

- Health check endpoint is accessible without authentication (no 401)
- Returns 200 OK when service is healthy, 503 when unhealthy
- Response includes status, data object with health check details, `totalDurationMs`, and `timestamp`
- `totalDurationMs` should equal the sum of `durationMs` values for all reported services (or be documented if aggregated differently)
- `data.main_api.description` is present and descriptive
- Response `Content-Type` must be `application/json` and responses include `X-Correlation-Id` header
- Response format is consistent and well-structured

**Notes / Test Hints:**
- When asserting accessibility, check that the endpoint does **not** return 401/WWW-Authenticate. Accept either 200 or 503 as valid based on service health.
- Use jq to assert the aggregation: `jq '. as $b | ($b.totalDurationMs) as $total | ($b.data|.[].durationMs) | add as $sum | {total:$total, sum:$sum, ok: ($total == $sum)}'`
- Validate `X-Correlation-Id` header exists and correlates to metadata if provided in response body.

**Success Response Structure:**

```json
{
  "success": true,
  "status": "Healthy",
  "data": {
    "main_api": {
      "status": "Healthy",
      "description": "Main API is operational",
      "durationMs": 2,
      "data": null
    }
  },
  "totalDurationMs": 2,
  "timestamp": "2025-12-16T21:26:38.001629Z"
}
```

### 4.2 GET /api/v1/health/ready

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/fail | ACTUAL RESULT |
|-------|-----------|-----------------|-----------|---------------|
| READY-001 | Readiness check request | 200 OK with status: "Ready" or 503 with status: "Not Ready" | PASS | Observed 503 when legacy service unhealthy |
| READY-002 | Readiness check without authentication | Request succeeds (endpoint is public; no 401) | PASS | OK (no 401) |
| READY-003 | Readiness check when all dependencies are healthy | 200 OK with all services showing Healthy status | TBD | **New test** |
| READY-004 | Readiness check when Format Management Service is unhealthy | 503 with format_management_service showing Unhealthy status | TBD | **New test** |
| READY-005 | Readiness check when Legacy Service is unhealthy | 503 with legacy_service showing Unhealthy status | PASS | **Observed: legacy_service Not Ready — 503 returned** |
| READY-006 | Readiness check response structure validation | Response contains status for main_api, format_management_service, and legacy_service | TBD | see structure below |
| READY-007 | totalDurationMs aggregation validation | `totalDurationMs` equals sum of all reported `durationMs` values | TBD | **New test** |
| READY-008 | service descriptions presence | Each reported service includes a `description` where applicable | TBD | **New test** |

**Acceptance Criteria:**

- Readiness check includes health status of all dependencies (Format Management Service, Legacy Service)
- Returns 200 OK when all dependencies are ready, 503 when any dependency is not ready
- Response includes individual health status for each dependency with `durationMs` and error/details if applicable
- `totalDurationMs` should equal the sum of all dependency `durationMs` values
- Service description fields should be present to aid diagnostics

**Notes / Test Hints:**
- To reproduce legacy failure: simulate or configure Legacy Service to return unhealthy, then assert `/api/v1/health/ready` returns 503 and shows `legacy_service.status` as `Not Ready` or `Unhealthy`.
- Use the jq aggregation snippet from 4.1 to validate `totalDurationMs`.

**Success Response Structure:**

```json
{
  "success": true,
  "status": "Ready",
  "data": {
    "main_api": {
      "status": "Healthy",
      "description": "Main API is operational",
      "durationMs": 1,
      "data": null
    },
    "format_management_service": {
      "status": "Healthy",
      "description": "Format Management Service is reachable",
      "durationMs": 45,
      "data": null
    },
    "legacy_service": {
      "status": "Healthy",
      "description": "Legacy Service is reachable",
      "durationMs": 32,
      "data": null
    }
  },
  "totalDurationMs": 78,
  "timestamp": "2025-12-16T21:26:38.001629Z"
}
```

### 4.3 GET /api/v2/health and GET /api/v2/health/ready

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|-----------|--------------|
| HEALTH-V2-001 | V2 health check request | 200 OK with additional ApiVersion information in data | P1 |
| HEALTH-V2-002 | V2 health check response structure | Response includes ApiVersion object with Version, BuildDate, Environment | P1 |

**Acceptance Criteria:**

- V2 endpoints return same structure as V1 with additional ApiVersion information
- ApiVersion object includes Version (2.0), BuildDate, and Environment fields
- All tests from V1 (aggregation, description presence, headers, content-type) also apply to V2

---

## 5. Rate Limiting Testing

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|-----------|-------------|
| RATE-001 | STP endpoint - requests within limit (500 req/min) | All requests succeed | P0 |
| RATE-002 | STP endpoint - requests exceeding limit | 429 Too Many Requests with Retry-After header | P0 |
| RATE-003 | Inquiry endpoint - requests within limit (2000 req/min) | All requests succeed | P0 |
| RATE-004 | Inquiry endpoint - requests exceeding limit | 429 Too Many Requests with Retry-After header | P0 |
| RATE-005 | STP Batch endpoint - requests within limit (500 req/min) | All requests succeed | P0 |
| RATE-006 | STP Batch endpoint - batch size exceeding MaxBatchSize (100) | 429 Too Many Requests before processing | P0 |
| RATE-007 | Default endpoint - requests within limit (10 req/min) | All requests succeed | P1 |
| RATE-008 | Default endpoint - requests exceeding limit | 429 Too Many Requests with Retry-After header | P1 |
| RATE-009 | Rate limit response structure | 429 response includes error code "RateLimitExceeded", message, and retry after time | P0 |
| RATE-010 | Rate limit reset after time window | Requests succeed after rate limit window resets | P1 |

**Acceptance Criteria:**

- Rate limits are enforced per endpoint type (STP: 500/min, Inquiry: 2000/min, Default: 10/min)
- Rate limit exceeded responses return 429 Too Many Requests with appropriate error message
- Retry-After header indicates when client can retry
- Batch size limits are enforced separately from request rate limits
- Rate limiting is applied per client/user (using client ID from JWT token)
- Burst size allows temporary spikes in request rate

**Rate Limit Configuration:**

- Default: 10 requests/minute, burst: 2
- STP: 500 requests/minute, burst: 50
- Inquiry: 2000 requests/minute, burst: 200
- STP Batch: 500 requests/minute, burst: 50, MaxBatchSize: 100

---

## 6. Error Handling Testing

### 6.1 Error Response Structure

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|----------|---------------|
| ERR-001 | Validation error response structure | 400 response includes success: false, error object with code, message, details, errors | P0 |
| ERR-002 | Not Found error response structure | 404 response includes success: false, error object with code "FormatNotFound" | P0 |
| ERR-003 | Unauthorized error response structure | 401 response includes appropriate error information | P0 |
| ERR-004 | Rate limit error response structure | 429 response includes success: false, error with code "RateLimitExceeded" | P0 |
| ERR-005 | External service error response structure | 502 response includes success: false, error with code "ExternalServiceError" | P0 |
| ERR-006 | Server error response structure | 500 response includes success: false, error with code "ServerError" | P0 |
| ERR-007 | Error response includes correlation ID | All error responses include correlation ID in metadata | P1 |
| ERR-008 | Error response includes ProcessedAt timestamp | All error responses include ProcessedAt in metadata | P0 |

**Acceptance Criteria:**

- All error responses follow consistent structure with `success: false`, `error` object, and `metadata`
- Error codes are standardized and descriptive
- Error messages are user-friendly but detailed enough for debugging (in development mode)
- Validation errors include field-specific error arrays
- Correlation ID is present in all responses for request tracking
- HTTP status codes are appropriate for error types

**Standard Error Response Structure:**

```json
{
  "success": false,
  "error": {
    "code": "ErrorCode",
    "message": "User-friendly error message",
    "details": "Technical details for debugging (only in Development)",
    "errors": {
      "fieldName": ["Error message 1", "Error message 2"]
    }
  },
  "metadata": {
    "ProcessedAt": "2025-12-16T21:26:38.001629Z",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 6.2 HTTP Status Codes

**Acceptance Criteria:**

- 200 OK: Successful requests
- 400 Bad Request: Validation errors, malformed requests
- 401 Unauthorized: Authentication failures
- 403 Forbidden: Authorization failures (if enforced)
- 404 Not Found: Format/endpoint not found
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Unexpected server errors
- 502 Bad Gateway: External service errors
- 503 Service Unavailable: Health/readiness check failures
- 504 Gateway Timeout: Request timeout (batch operations)

---

## 7. Request/Response Headers Testing

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail | Actual Results
|-------|-----------|-----------------|----------|-----------------|
| HEADER-001 | Request with X-Correlation-Id header | Response includes same correlation ID in metadata | Fail |No response in metadata
| HEADER-002 | Request without X-Correlation-Id header | Response includes auto-generated correlation ID in metadata |Fail |No  auto-generated correlation ID in metadata 
| HEADER-003 | Response includes X-Correlation-Id header | Response header contains correlation ID | Pass |
| HEADER-004 | Request with Content-Type: application/json | Request processed successfully | Pass |
| HEADER-005 | Request with incorrect Content-Type | 400 Bad Request or 415 Unsupported Media Type | Pass |
| HEADER-006 | Response Content-Type is application/json | Response Content-Type header is application/json | Pass |

**Acceptance Criteria:**

- Correlation ID is generated for each request if not provided
- Correlation ID is included in response metadata and X-Correlation-Id header
- Content-Type: application/json is required for POST requests
- All responses have Content-Type: application/json

---

## 8. CORS Testing (if applicable)

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|----------|---------------|
| CORS-001 | Preflight OPTIONS request from allowed origin | 200 OK with appropriate CORS headers | P1 |
| CORS-002 | Preflight OPTIONS request from disallowed origin | CORS error (browser blocks request) | P1 |
| CORS-003 | Actual request from allowed origin | Request succeeds with CORS headers | P1 |
| CORS-004 | CORS headers in response | Response includes Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc. | P1 |

**Acceptance Criteria:**

- CORS is configured appropriately for the environment
- Preflight requests are handled correctly
- CORS headers are included in responses when CORS is enabled
- Allowed origins, methods, and headers are properly configured

**Note**: CORS configuration may be disabled in production. Verify based on environment configuration.

---

## 9. Integration Testing

### 9.1 External Service Integration

**Test Cases:**

| TC-ID | Test Case | Expected Result | Pass/Fail |Actual Results
|-------|-----------|-----------------|----------|---------------|
| INT-001 | Format Management Service integration - successful | Format definitions retrieved and cached | P0 |
| INT-002 | Format Management Service integration - service unavailable | 502 Bad Gateway with appropriate error | P1 |
| INT-003 | Format Management Service integration - timeout | 502 Bad Gateway or 504 Gateway Timeout | P1 |
| INT-004 | Legacy Service integration - successful | Requests forwarded and responses parsed correctly | P0 |
| INT-005 | Legacy Service integration - service unavailable | 502 Bad Gateway with appropriate error | P1 |
| INT-006 | Legacy Service integration - timeout | 504 Gateway Timeout | P1 |
| INT-007 | Format definition caching | Subsequent requests use cached format definitions | P1 |
| INT-008 | Format definition cache expiration | Stale cache entries are refreshed after expiration | P1 |

**Acceptance Criteria:**

- Format Management Service integration uses retry and circuit breaker patterns
- Legacy Service integration handles timeouts appropriately
- External service errors are handled gracefully with appropriate error responses
- Format definitions are cached to improve performance
- Cache expiration (5 minutes) works correctly

---

## 10. Data Validation Testing

### 10.1 Request Validation

**Test Cases:**

| TC-ID | Test Case | Expected Result | Priority |
|-------|-----------|-----------------|----------|
| VAL-001 | Required field validation | Missing required fields return validation errors | P0 |
| VAL-002 | Data type validation | Incorrect data types return validation errors | P0 |
| VAL-003 | Field format validation | Fields not matching format rules return validation errors | P0 |
| VAL-004 | Enum/choice validation | Invalid enum values return validation errors | P0 |
| VAL-005 | Range/length validation | Values outside allowed ranges return validation errors | P0 |
| VAL-006 | Custom validation scripts | Custom validation rules are executed correctly | P1 |

**Acceptance Criteria:**

- All request fields are validated against format definitions
- Validation errors are specific and identify the exact field and issue
- Validation errors are grouped by field name
- Multiple validation errors can be returned in a single response

### 10.2 Response Validation

**Test Cases:**

| TC-ID | Test Case | Expected Result | Priority |
|-------|-----------|-----------------|----------|
| VAL-007 | Success response structure validation | Responses match expected schema | P0 |
| VAL-008 | Error response structure validation | Error responses match expected schema | P0 |
| VAL-009 | Metadata presence validation | All responses include metadata object | P0 |
| VAL-010 | Data type validation in responses | Response data types match specification | P0 |

**Acceptance Criteria:**

- All responses follow the standard structure (success, data/error, metadata)
- Response data types match the API specification
- Metadata always includes ProcessedAt timestamp
- Success responses include data object, error responses include error object

---

## 11. API Versioning Testing

**Test Cases:**

| TC-ID | Test Case | Expected Result | Priority |
|-------|-----------|-----------------|----------|
| VER-001 | V1 endpoint request | V1 endpoint responds correctly | P0 |
| VER-002 | V2 endpoint request (health checks) | V2 endpoint responds with additional information | P1 |
| VER-003 | Invalid version in URL | 404 Not Found | P1 |

**Acceptance Criteria:**

- Version is specified in URL path: `/api/v{version}/...`
- V1 endpoints are available for all operations
- V2 endpoints are available for health checks only
- Invalid versions return 404 Not Found

---

## Test Data Requirements

### Valid Test Data

1. **JWT Tokens**:

   - Valid token with appropriate scopes (addvantage.stp, addvantage.inquiry, api)
   - Token from Corio IDP (`https://nah-idp-dev.cognativ.com`)
   - Audience: `nah_api`

2. **STP Operations**:

   - Valid operation names (e.g., "CustomerPayment")
   - Valid field values according to format definitions
   - Test data for various operation types

3. **Inquiry Endpoints**:

   - Valid endpoint names (e.g., "HoldingGroupTenantLoginSearch")
   - Valid parameter combinations
   - Test data for various inquiry types

4. **Headers**:

   - Valid AddVantage-Authorization: Basic base64(username:password)
   - Valid UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

### Invalid Test Data

1. **JWT Tokens**:

   - Expired tokens
   - Invalid signature tokens
   - Tokens with missing claims
   - Tokens from wrong issuer

2. **Requests**:

   - Missing required fields
   - Invalid data types
   - Values outside allowed ranges
   - Invalid operation/endpoint names

3. **Headers**:

   - Missing required headers
   - Invalid UUID formats
   - Invalid Authorization header formats

---

## Test Execution Strategy

### Phase 1: Smoke Testing (Priority P0)

- Execute all P0 test cases to verify basic functionality
- Focus on authentication, basic CRUD operations, and error handling
- Estimated duration: 2-3 days

### Phase 2: Functional Testing (Priority P0 and P1)

- Execute all remaining test cases
- Focus on edge cases, integration scenarios, and advanced features
- Estimated duration: 5-7 days

### Phase 3: Regression Testing

- Re-execute critical test cases after bug fixes
- Verify fixes don't introduce new issues
- Estimated duration: 2-3 days

### Phase 4: Acceptance Testing

- Execute acceptance criteria validation
- Business stakeholder review and sign-off
- Estimated duration: 1-2 days

---

## Test Environment Setup

### Prerequisites

1. **Access Requirements**:

   - Access to test environment: `https://nah-avd-dev.cognativ.com`
   - Valid JWT tokens from Corio IDP
   - Test credentials for Legacy Service (for AddVantage-Authorization header)

2. **Test Tools**:

   - API testing tool (Postman, REST Assured, etc.)
   - JWT token generation/validation tools
   - JSON validation tools
   - Load testing tools (for rate limiting tests)

3. **Test Data**:

   - Format definitions available in Format Management Service
   - Test operations and endpoints configured
   - Mock or test Legacy Service endpoints

### Test Configuration

1. **Base Configuration**:

   - Base URL: `https://nah-avd-dev.cognativ.com`
   - API Version: v1 (default), v2 (for health checks)
   - Content-Type: application/json

2. **Authentication Configuration**:

   - Authorization: Bearer {JWT_TOKEN}
   - Token source: Corio IDP
   - Token audience: nah_api

3. **Required Headers** (for STP/Inquiry):

   - AddVantage-Authorization: Basic {base64_credentials}
   - uuid: {valid_uuid}

---

## Defect Management

### Defect Severity Levels

- **Critical (P0)**: Blocks testing or causes system failure
- **High (P1)**: Major functionality not working as expected
- **Medium (P2)**: Minor functionality issues, workarounds available
- **Low (P3)**: Cosmetic issues, documentation updates

### Defect Reporting Template

- **Defect ID**: Unique identifier
- **Title**: Brief description
- **Severity**: P0/P1/P2/P3
- **Test Case ID**: Associated test case
- **Steps to Reproduce**: Detailed steps
- **Expected Result**: What should happen
- **Actual Result**: What actually happens
- **Environment**: Test environment details
- **Screenshots/Logs**: Supporting evidence

---

## Acceptance Criteria Summary

### Must Have (P0)

1. ✅ All endpoints require valid JWT authentication (except health checks)
2. ✅ STP operations validate requests and return appropriate responses
3. ✅ Inquiry operations validate parameters and return parsed responses
4. ✅ Health checks return accurate status information
5. ✅ Rate limiting is enforced per endpoint type
6. ✅ Error responses follow standard structure with appropriate HTTP status codes
7. ✅ Required headers (AddVantage-Authorization, uuid) are validated
8. ✅ Request validation errors are detailed and field-specific
9. ✅ All responses include correlation ID and metadata

### Should Have (P1)

1. ✅ Batch operations handle partial failures gracefully
2. ✅ External service errors are handled with appropriate error codes
3. ✅ Format definitions are cached and refreshed appropriately
4. ✅ V2 health endpoints include additional version information
5. ✅ CORS is configured appropriately for the environment
6. ✅ Authorization policies are enforced (if applicable)

### Nice to Have (P2)

1. ✅ Custom validation scripts execute correctly
2. ✅ Detailed error messages in development mode
3. ✅ Comprehensive logging for debugging

---

## Sign-off Criteria

The API is considered ready for production when:

1. ✅ All P0 test cases pass
2. ✅ At least 95% of P1 test cases pass
3. ✅ All critical defects (P0) are resolved
4. ✅ All high-severity defects (P1) are resolved or have approved workarounds
5. ✅ Performance meets requirements (covered by separate performance tests)
6. ✅ Security review is completed (covered by security team)
7. ✅ Documentation is complete and accurate
8. ✅ Business stakeholders have signed off on acceptance criteria

---

## Appendix

### A. Reference Documentation

- API Specification: `docs/api-specification.md`
- Authentication Implementation: `docs/authentication-implementation.md`
- CORS Implementation: `docs/cors_implementation.md`
- Swagger Documentation: `https://nah-avd-dev.cognativ.com/swagger/index.html`

### B. Common Error Codes

- `ValidationError`: Request validation failed
- `FormatNotFound`: Endpoint or operation format definition not found
- `ExternalServiceError`: Error communicating with external services
- `RateLimitExceeded`: Rate limit exceeded
- `Unauthorized`: Authentication failed
- `Forbidden`: Insufficient permissions
- `NotFound`: Resource not found
- `ServerError`: Internal server error

### C. Test Case Tracking

Use a test management tool to track:

- Test case execution status
- Test results and evidence
- Defects linked to test cases
- Test coverage metrics
- Execution history and trends

---

**Document Version**: 1.0

**Last Updated**: 2026-01-05

**Author**: QA Team

**Review Status**: Draft - Updated with test results

