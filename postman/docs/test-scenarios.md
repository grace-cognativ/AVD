# Test Scenarios

This document lists the test scenarios included in the Postman collection.

## STP Operations

### Batch STP Requests (`POST /api/v1/stp/batch`)
- Valid batch request → All items processed successfully.
- Partial failure → Returns `failedAtIndex` for invalid item.
<!-- - Empty batch → Returns 0 processed items. -->
- Missing headers → API returns 400/unauthorized.
<!-- - Large batch → Test performance and processing time. -->

### Single STP Request (`POST /api/v1/stp`)
- Valid request → Success, transactionId returned.
- Invalid request → Returns validation errors.
- Missing headers → 400/unauthorized.
<!-- - Duplicate transaction → Ensures idempotency. -->

## Inquiry Operations (`POST /api/v1/inquiry`)
- Valid inquiry → Response contains expected fields.
<!-- - Invalid endpoint → Returns 404.
- Missing headers → Returns 400/unauthorized.
- Invalid parameters → Returns validation errors. -->

## Health Endpoints
### `/api/v1/Health` → Healthy and Unhealthy status.
- Valid inquiry → Response contains expected response.

### `/api/v1/Health/ready` → Ready or NotReady based on dependencies.
- Valid inquiry → Response contains expected fields.

## Notes
- Use environment variables for all sensitive values.
- Tests include assertions on `success`, response schema, and timestamps.
- Pre-request scripts handle token setup and dynamic values.
