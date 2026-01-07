# QA Test Plan and Acceptance Criteria for AddVantage Main API

## 10. Data Validation Testing

### 10.1 Request Validation

**Test Cases:**

| | TC-ID | Test Case | Expected Result | Pass/Fail | Actual Result |
|-------|-----------|-----------------|----------|----------|----------|
| VAL-001 | Required field validation | Missing required fields return validation errors | FAIL | Received 404 Not Found instead of 400 Bad Request |
| VAL-002 | Data type validation | Incorrect data types return validation errors | FAIL | Received 404 Not Found instead of 400 Bad Request |
| VAL-003 | Field format validation | Fields not matching format rules return validation errors | FAIL | Received 404 Not Found instead of 400 Bad Request |
| VAL-004 | Enum/choice validation | Invalid enum values return validation errors | FAIL | Received 404 Not Found instead of 400 Bad Request |
| VAL-005 | Range/length validation | Values outside allowed ranges return validation errors | FAIL | Received 404 Not Found instead of 400 Bad Request |
| VAL-006 | Custom validation scripts | Custom validation rules are executed correctly | FAIL | Received 404 Not Found instead of 400 Bad Request |

**Acceptance Criteria:**

- All request fields are validated against format definitions
- Validation errors are specific and identify the exact field and issue
- Validation errors are grouped by field name
- Multiple validation errors can be returned in a single response

### 10.2 Response Validation

**Test Cases:**

| | TC-ID | Test Case | Expected Result | Pass/Fail | Actual Result |
|-------|-----------|-----------------|----------|----------|----------|
| VAL-007 | Success response structure validation | Responses match expected schema | FAIL | Received 404 Not Found instead of 200 OK |
| VAL-008 | Error response structure validation | Error responses match expected schema | FAIL | Received 404 Not Found instead of 400 Bad Request |
| VAL-009 | Metadata presence validation | All responses include metadata object | FAIL | Response data is empty string, no metadata present |
| VAL-010 | Data type validation in responses | Response data types match specification | FAIL | Received 404 Not Found instead of 200 OK |

**Acceptance Criteria:**

- All responses follow the standard structure (success, data/error, metadata)
- Response data types match the API specification
- Metadata always includes ProcessedAt timestamp
- Success responses include data object, error responses include error object