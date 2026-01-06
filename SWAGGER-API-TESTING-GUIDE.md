# Testing the NAH-AVD Swagger API

This guide explains how to use the test automation framework to test any endpoint in the NAH-AVD Swagger API at https://nah-avd-dev.cognativ.com/swagger/index.html.

## Table of Contents

- [Overview](#overview)
- [Testing Different Endpoints](#testing-different-endpoints)
- [Testing STP Operations](#testing-stp-operations)
- [Testing STP Batch Operations](#testing-stp-batch-operations)
- [Testing Inquiry Operations](#testing-inquiry-operations)
- [Testing Health Endpoints](#testing-health-endpoints)
- [Creating Comprehensive Test Suites](#creating-comprehensive-test-suites)

## Overview

The test automation framework can be used to test any endpoint in the NAH-AVD Swagger API. The framework is designed to be flexible and extensible, allowing you to add new test cases for any endpoint in the API.

## Testing Different Endpoints

### General Approach

For each endpoint in the Swagger API, you can create a test file following this pattern:

```javascript
const axios = require('axios');
const config = require('./config');

// Helper function to create an authenticated API client
const createApiClient = () => {
  const client = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.AUTH_TOKEN}`,
      'AddVantage-Authorization': config.ADD_VANTAGE_AUTH,
      'uuid': config.UUID
    },
    validateStatus: () => true // Don't throw on error status codes
  });
  return client;
};

describe('Endpoint Name', () => {
  test('Test case description', async () => {
    const client = createApiClient();
    
    // Send request to the endpoint
    const response = await client.post('/api/v1/endpoint-path', {
      // Request body based on Swagger documentation
    });
    
    // Validate the response
    expect(response.status).toBe(200); // Or expected status code
    expect(response.data).toHaveProperty('success', true);
    // Additional assertions based on expected response
  });
});
```

## Testing STP Operations

### POST /api/v1/stp

To test the STP operations endpoint:

```javascript
describe('STP Operations', () => {
  test('Process a valid STP request', async () => {
    const client = createApiClient();
    
    const response = await client.post('/api/v1/stp', {
      operation: "CustomerPayment",
      fields: {
        function: "PTI",
        transaction_type: "ERT",
        external_source_id: "Google",
        account_number: "A4345333",
        processing_code: "A",
        branch_id: "Bank",
        terminal_id: "TTY90",
        bank_code: 32432,
        merchant_id: "FEH45",
        transaction_flag: "M",
        reference_code: "3FER"
      }
    });
    
    // Validate successful response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('data');
    expect(response.data.data).toHaveProperty('transactionId');
    expect(response.data.data).toHaveProperty('status');
    expect(response.data.data).toHaveProperty('processedAt');
    expect(response.data.data).toHaveProperty('legacyResponse');
    
    // Validate metadata
    expect(response.data).toHaveProperty('metadata');
    expect(response.data.metadata).toHaveProperty('ProcessedAt');
    expect(response.data.metadata).toHaveProperty('Operation', 'CustomerPayment');
    expect(response.data.metadata).toHaveProperty('ProcessingTimeMs');
  });
  
  // Add more test cases for different operations and scenarios
});
```

## Testing STP Batch Operations

### POST /api/v1/stp/batch

To test the STP batch operations endpoint:

```javascript
describe('STP Batch Operations', () => {
  test('Process a valid batch request', async () => {
    const client = createApiClient();
    
    const response = await client.post('/api/v1/stp/batch', {
      batchId: "BATCH-2025-12-16-001",
      items: [
        {
          operation: "CustomerPayment",
          fields: {
            function: "PTI",
            transaction_type: "ERT",
            account_number: "A4345333",
            processing_code: "A",
            reference_code: "3FER"
          }
        },
        {
          operation: "CustomerPayment",
          fields: {
            function: "PTI",
            transaction_type: "ERT",
            account_number: "A4345334",
            processing_code: "B",
            reference_code: "4FER"
          }
        }
      ]
    });
    
    // Validate successful response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('data');
    expect(response.data.data).toHaveProperty('batchId');
    expect(response.data.data).toHaveProperty('totalItems');
    expect(response.data.data).toHaveProperty('processedItems');
    expect(response.data.data).toHaveProperty('success', true);
    expect(response.data.data).toHaveProperty('legacyResponses');
    
    // Validate metadata
    expect(response.data).toHaveProperty('metadata');
    expect(response.data.metadata).toHaveProperty('ProcessedAt');
    expect(response.data.metadata).toHaveProperty('ProcessingTimeMs');
  });
  
  // Add more test cases for different batch scenarios
});
```

## Testing Inquiry Operations

### POST /api/v1/inquiry

To test the inquiry operations endpoint:

```javascript
describe('Inquiry Operations', () => {
  test('Process a valid inquiry request', async () => {
    const client = createApiClient();
    
    const response = await client.post('/api/v1/inquiry', {
      endpoint: "HoldingGroupTenantLoginSearch",
      parameters: {
        loginId: "RIA100",
        tenantId: "RIAF",
        searchCrit: "account",
        searchValue: "submitted"
      }
    });
    
    // Validate successful response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('data');
    
    // Validate metadata
    expect(response.data).toHaveProperty('metadata');
    expect(response.data.metadata).toHaveProperty('ProcessedAt');
  });
  
  // Add more test cases for different inquiry endpoints
});
```

## Testing Health Endpoints

### GET /api/v1/Health

To test the health endpoint:

```javascript
describe('Health Endpoints', () => {
  test('Get basic health status', async () => {
    const client = createApiClient();
    
    const response = await client.get('/api/v1/Health');
    
    // Validate successful response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('status', 'Healthy');
    expect(response.data).toHaveProperty('data');
    expect(response.data.data).toHaveProperty('main_api');
    expect(response.data).toHaveProperty('totalDurationMs');
    expect(response.data).toHaveProperty('timestamp');
  });
  
  test('Get readiness status', async () => {
    const client = createApiClient();
    
    const response = await client.get('/api/v1/Health/ready');
    
    // Validate successful response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('status', 'Ready');
    expect(response.data).toHaveProperty('data');
    expect(response.data.data).toHaveProperty('main_api');
    expect(response.data.data).toHaveProperty('format_management_service');
    expect(response.data.data).toHaveProperty('legacy_service');
    expect(response.data).toHaveProperty('totalDurationMs');
    expect(response.data).toHaveProperty('timestamp');
  });
});
```

## Creating Comprehensive Test Suites

To create a comprehensive test suite for the entire API, organize your tests into separate files for each endpoint or category:

### File Structure

```
tests/
  stp-operations.test.js
  stp-batch-operations.test.js
  inquiry-operations.test.js
  health-endpoints.test.js
  error-handling.test.js
```

### Running All Tests

To run all tests:

```bash
npm test
```

### Creating a Test Matrix

Create a test matrix to track which endpoints and scenarios have been tested:

| Endpoint | Success Case | Validation Error | Not Found | Unauthorized | Rate Limit | External Error | Server Error |
|----------|--------------|------------------|-----------|--------------|------------|----------------|--------------|
| /api/v1/stp | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/v1/stp/batch | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/v1/inquiry | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| /api/v1/Health | ✅ | N/A | N/A | N/A | N/A | N/A | ✅ |
| /api/v1/Health/ready | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ |

## Advanced Testing Techniques

### Parameterized Tests

Use Jest's `test.each` to run the same test with different parameters:

```javascript
describe('STP Operations with different parameters', () => {
  const testCases = [
    { operation: 'CustomerPayment', function: 'PTI', expectedStatus: 200 },
    { operation: 'MerchantPayment', function: 'MTI', expectedStatus: 200 },
    { operation: 'InvalidOperation', function: 'PTI', expectedStatus: 400 }
  ];
  
  test.each(testCases)(
    '$operation with function $function should return status $expectedStatus',
    async ({ operation, function: func, expectedStatus }) => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        operation: operation,
        fields: {
          function: func,
          transaction_type: "ERT",
          account_number: "A4345333",
          processing_code: "A",
          reference_code: "3FER"
        }
      });
      
      expect(response.status).toBe(expectedStatus);
    }
  );
});
```

### Data-Driven Testing

Create a data file with test cases and expected results:

```javascript
// test-data.js
module.exports = {
  stpOperations: [
    {
      name: 'Valid CustomerPayment',
      request: {
        operation: "CustomerPayment",
        fields: {
          function: "PTI",
          transaction_type: "ERT",
          account_number: "A4345333",
          processing_code: "A",
          reference_code: "3FER"
        }
      },
      expectedStatus: 200,
      expectedSuccess: true
    },
    // More test cases...
  ]
};
```

Then use the data in your tests:

```javascript
const testData = require('./test-data');

describe('STP Operations Data-Driven Tests', () => {
  testData.stpOperations.forEach(testCase => {
    test(testCase.name, async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', testCase.request);
      
      expect(response.status).toBe(testCase.expectedStatus);
      expect(response.data.success).toBe(testCase.expectedSuccess);
    });
  });
});
```

## Conclusion

With this guide and the test automation framework, your team can now test any endpoint in the NAH-AVD Swagger API. The framework provides a flexible and extensible way to create comprehensive test suites for the entire API.