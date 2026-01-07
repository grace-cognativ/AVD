/**
 * STP Operations Tests for AddVantage API
 * 
 * This file contains tests for STP (Straight-Through Processing) operations
 * as specified in Section 2 of the QA Test Plan.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

// Import configuration
const BASE_URL = config.baseUrl;
const AUTH_TOKEN = config.auth.token;
const ADD_VANTAGE_AUTH = config.auth.addVantageAuth;
const VALID_OPERATION = config.testData.validOperation;
const VALID_FIELDS = config.testData.validFields;
const MAX_BATCH_SIZE = config.testSettings.maxBatchSize;

// Helper function to create axios instance with common headers
const createApiClient = (customHeaders = {}) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'AddVantage-Authorization': ADD_VANTAGE_AUTH,
      'uuid': uuidv4(),
      ...customHeaders
    },
    validateStatus: () => true, // Don't throw on error status codes
    timeout: config.testSettings.timeout
  });
};

// Helper function to validate success response structure
const validateSuccessResponseStructure = (response) => {
  // Check HTTP status code
  expect(response.status).toBe(200);
  
  // Check basic response structure
  expect(response.data).toHaveProperty('success', true);
  expect(response.data).toHaveProperty('data');
  expect(response.data).toHaveProperty('metadata');
  
  // Check metadata
  expect(response.data.metadata).toHaveProperty('ProcessedAt');
  
  // Return the response for further assertions
  return response;
};

// Helper function to validate error response structure
const validateErrorResponseStructure = (response, expectedCode, expectedHttpStatus) => {
  // Check HTTP status code
  expect(response.status).toBe(expectedHttpStatus);
  
  // Check basic response structure
  expect(response.data).toHaveProperty('success', false);
  expect(response.data).toHaveProperty('error');
  expect(response.data).toHaveProperty('metadata');
  
  // Check error object structure
  expect(response.data.error).toHaveProperty('code');
  expect(response.data.error).toHaveProperty('message');
  
  // Check specific error code if provided
  if (expectedCode) {
    expect(response.data.error.code).toBe(expectedCode);
  }
  
  // Return the response for further assertions
  return response;
};

// Test suite for STP operations
describe('STP Operations Testing', () => {
  
  // 2.1 POST /api/v1/stp - Single STP Operation
  describe('2.1 POST /api/v1/stp - Single STP Operation', () => {
    
    // STP-001: Valid STP request with all required fields
    test('STP-001: Valid STP request with all required fields should return 200 OK with success response', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateSuccessResponseStructure(response);
      
      // Check STP-specific response structure
      expect(validatedResponse.data.data).toHaveProperty('transactionId');
      expect(validatedResponse.data.data).toHaveProperty('status');
      expect(validatedResponse.data.data).toHaveProperty('processedAt');
      expect(validatedResponse.data.data).toHaveProperty('legacyResponse');
      
      // Check metadata
      expect(validatedResponse.data.metadata).toHaveProperty('Operation', VALID_OPERATION);
      expect(validatedResponse.data.metadata).toHaveProperty('ProcessingTimeMs');
    });
    
    // STP-002: STP request with missing operation field
    test('STP-002: STP request with missing operation field should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        // Missing 'operation' field
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('operation');
    });
    
    // STP-003: STP request with missing fields dictionary
    test('STP-003: STP request with missing fields dictionary should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION
        // Missing 'fields' dictionary
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('fields');
    });
    
    // STP-004: STP request with empty fields dictionary
    test('STP-004: STP request with empty fields dictionary should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: {} // Empty fields dictionary
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('fields');
    });
    
    // STP-005: STP request with invalid operation name
    test('STP-005: STP request with invalid operation name should return 404 Not Found', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        operation: 'NonExistentOperation', // Invalid operation name
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'FormatNotFound', 404);
      
      // Check for operation name in error message
      expect(validatedResponse.data.error.message).toContain('NonExistentOperation');
    });
    
    // STP-006: STP request missing AddVantage-Authorization header
    test('STP-006: STP request missing AddVantage-Authorization header should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      // Remove AddVantage-Authorization header
      delete client.defaults.headers['AddVantage-Authorization'];
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      // Should return 400 Bad Request
      expect(response.status).toBe(400);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // STP-007: STP request missing uuid header
    test('STP-007: STP request missing uuid header should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      // Remove uuid header
      delete client.defaults.headers['uuid'];
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      // Should return 400 Bad Request
      expect(response.status).toBe(400);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // STP-008: STP request with invalid UUID format
    test('STP-008: STP request with invalid UUID format should return 400 Bad Request', async () => {
      const client = createApiClient({
        'uuid': 'invalid-uuid-format' // Invalid UUID format
      });
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      // Should return 400 Bad Request
      expect(response.status).toBe(400);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // STP-009: STP request with invalid AddVantage-Authorization format
    test('STP-009: STP request with invalid AddVantage-Authorization format should return 400 Bad Request', async () => {
      const client = createApiClient({
        'AddVantage-Authorization': 'InvalidFormat' // Invalid format (not Basic base64)
      });
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      // Should return 400 Bad Request
      expect(response.status).toBe(400);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // STP-010: STP request with fields failing format validation rules
    test('STP-010: STP request with fields failing format validation rules should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: {
          ...VALID_FIELDS,
          account_number: '123', // Too short or invalid format
          reference_code: '' // Empty string
        }
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      
      // Check for validation errors on specific fields
      const errorFields = Object.keys(validatedResponse.data.error.errors);
      const hasAccountNumberError = errorFields.some(field => field.includes('account_number'));
      const hasReferenceCodeError = errorFields.some(field => field.includes('reference_code'));
      
      expect(hasAccountNumberError || hasReferenceCodeError).toBe(true);
    });
    
    // STP-011: STP request with non-JSON Content-Type
    test('STP-011: STP request with non-JSON Content-Type should return 400 Bad Request or 415 Unsupported Media Type', async () => {
      // This test requires modifying the Content-Type header
      // We'll create a custom axios instance for this test
      const client = axios.create({
        baseURL: BASE_URL,
        headers: {
          'Content-Type': 'text/plain', // Non-JSON Content-Type
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'AddVantage-Authorization': ADD_VANTAGE_AUTH,
          'uuid': uuidv4()
        },
        validateStatus: () => true,
        timeout: config.testSettings.timeout
      });
      
      const response = await client.post('/api/v1/stp', 
        JSON.stringify({
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        })
      );
      
      // Should return 400 Bad Request or 415 Unsupported Media Type
      expect([400, 415]).toContain(response.status);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // STP-012: STP request with malformed JSON body
    test('STP-012: STP request with malformed JSON body should return 400 Bad Request', async () => {
      // This test requires sending malformed JSON
      // We'll create a custom axios instance for this test
      const client = axios.create({
        baseURL: BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'AddVantage-Authorization': ADD_VANTAGE_AUTH,
          'uuid': uuidv4()
        },
        validateStatus: () => true,
        timeout: config.testSettings.timeout,
        transformRequest: [(data, headers) => {
          // Return malformed JSON
          return '{"operation": "' + VALID_OPERATION + '", "fields": {';
        }]
      });
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      // Should return 400 Bad Request
      expect(response.status).toBe(400);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // STP-013 and STP-014 require external service unavailability
    // These tests are placeholders and would need to be implemented with service virtualization
    test('STP-013: STP request when Format Management Service is unavailable should return 502 Bad Gateway', () => {
      console.log('STP-013: This test requires service virtualization or controlled test environment');
    });
    
    test('STP-014: STP request when Legacy Service is unavailable should return 502 Bad Gateway', () => {
      console.log('STP-014: This test requires service virtualization or controlled test environment');
    });
  });
  
  // 2.2 POST /api/v1/stp/batch - Batch STP Operations
  describe('2.2 POST /api/v1/stp/batch - Batch STP Operations', () => {
    
    // BATCH-001: Valid batch request with multiple items
    test('BATCH-001: Valid batch request with multiple items should return 200 OK with batch response', async () => {
      const client = createApiClient();
      
      // Create a batch with 2 items
      const items = [
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        },
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        }
      ];
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-001',
        items
      });
      
      const validatedResponse = validateSuccessResponseStructure(response);
      
      // Check batch-specific response structure
      expect(validatedResponse.data.data).toHaveProperty('batchId', 'TEST-BATCH-001');
      expect(validatedResponse.data.data).toHaveProperty('totalItems', 2);
      expect(validatedResponse.data.data).toHaveProperty('processedItems');
      expect(validatedResponse.data.data).toHaveProperty('success');
      expect(validatedResponse.data.data).toHaveProperty('legacyResponses');
      
      // Check metadata
      expect(validatedResponse.data.metadata).toHaveProperty('ProcessedAt');
      expect(validatedResponse.data.metadata).toHaveProperty('ProcessingTimeMs');
    });
    
    // BATCH-002: Batch request with empty items array
    test('BATCH-002: Batch request with empty items array should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-002',
        items: [] // Empty items array
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('items');
    });
    
    // BATCH-003: Batch request with null items
    test('BATCH-003: Batch request with null items should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-003',
        items: null // Null items
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('items');
    });
    
    // BATCH-004: Batch request exceeding MaxBatchSize
    test('BATCH-004: Batch request exceeding MaxBatchSize should return 429 Too Many Requests', async () => {
      const client = createApiClient();
      
      // Create a batch with more than MaxBatchSize items
      const items = Array(MAX_BATCH_SIZE).fill().map(() => ({
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      }));
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-004',
        items
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'RATE_LIMIT_EXCEEDED', 429);
      
      // Check for Retry-After header
      expect(response.headers).toHaveProperty('retry-after');
    });
    
    // BATCH-005: Batch request with invalid item at index 0
    test('BATCH-005: Batch request with invalid item at index 0 should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      // Create a batch with invalid first item
      const items = [
        {
          operation: VALID_OPERATION,
          fields: {} // Empty fields (invalid)
        },
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        }
      ];
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-005',
        items
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      
      // Check for validation errors on specific fields
      const errorFields = Object.keys(validatedResponse.data.error.errors);
      const hasItemError = errorFields.some(field => field.includes('Item[0]'));
      
      expect(hasItemError).toBe(true);
    });
    
    // BATCH-006: Batch request with invalid item at middle index
    test('BATCH-006: Batch request with invalid item at middle index should return 200 OK with partial success', async () => {
      const client = createApiClient();
      
      // Create a batch with invalid middle item
      const items = [
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        },
        {
          operation: VALID_OPERATION,
          fields: {} // Empty fields (invalid)
        },
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        }
      ];
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-006',
        items
      });
      
      // Should return 200 OK
      expect(response.status).toBe(200);
      
      // Check batch-specific response structure
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('batchId', 'TEST-BATCH-006');
      expect(response.data.data).toHaveProperty('totalItems', 3);
      expect(response.data.data).toHaveProperty('processedItems', 1);
      expect(response.data.data).toHaveProperty('success', false);
      expect(response.data.data).toHaveProperty('failedAtIndex', 1);
      expect(response.data.data).toHaveProperty('validationErrors');
      expect(response.data.data).toHaveProperty('legacyResponses');
      
      // Check that we have one successful response
      expect(response.data.data.legacyResponses.length).toBe(1);
    });
    
    // BATCH-007: Batch request with batchId provided
    test('BATCH-007: Batch request with batchId provided should return 200 OK with same batchId in response', async () => {
      const client = createApiClient();
      
      const customBatchId = 'CUSTOM-BATCH-ID-007';
      
      // Create a batch with 2 items
      const items = [
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        },
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        }
      ];
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: customBatchId,
        items
      });
      
      const validatedResponse = validateSuccessResponseStructure(response);
      
      // Check that batchId is preserved
      expect(validatedResponse.data.data).toHaveProperty('batchId', customBatchId);
    });
    
    // BATCH-008: Batch request when batch processing timeout exceeds
    test('BATCH-008: Batch request when batch processing timeout exceeds should return 504 Gateway Timeout', () => {
      console.log('BATCH-008: This test requires a controlled test environment with timeout configuration');
    });
    
    // BATCH-009: Batch request with all items succeeding
    test('BATCH-009: Batch request with all items succeeding should return 200 OK with success: true', async () => {
      const client = createApiClient();
      
      // Create a batch with 2 valid items
      const items = [
        {
          operation: VALID_OPERATION,
          fields: {
            ...VALID_FIELDS,
            external_source_id: 'SRC-001' // Add required field
          }
        },
        {
          operation: VALID_OPERATION,
          fields: {
            ...VALID_FIELDS,
            external_source_id: 'SRC-002' // Add required field
          }
        }
      ];
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-009',
        items
      });
      
      const validatedResponse = validateSuccessResponseStructure(response);
      
      // Check batch-specific response structure
      expect(validatedResponse.data.data).toHaveProperty('batchId', 'TEST-BATCH-009');
      expect(validatedResponse.data.data).toHaveProperty('totalItems', 2);
      expect(validatedResponse.data.data).toHaveProperty('processedItems', 2);
      expect(validatedResponse.data.data).toHaveProperty('success', true);
      expect(validatedResponse.data.data).toHaveProperty('failedAtIndex', null);
      expect(validatedResponse.data.data).toHaveProperty('legacyResponses');
      
      // Check that we have two successful responses
      expect(validatedResponse.data.data.legacyResponses.length).toBe(2);
    });
    
    // BATCH-010: Batch request with mixed success/failure
    test('BATCH-010: Batch request with mixed success/failure should return 200 OK with success: false', async () => {
      const client = createApiClient();
      
      // Create a batch with mixed valid/invalid items
      const items = [
        {
          operation: VALID_OPERATION,
          fields: {
            ...VALID_FIELDS,
            external_source_id: 'SRC-001' // Add required field
          }
        },
        {
          operation: VALID_OPERATION,
          fields: {
            // Missing required fields
          }
        },
        {
          operation: VALID_OPERATION,
          fields: {
            ...VALID_FIELDS,
            external_source_id: 'SRC-003' // Add required field
          }
        }
      ];
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-010',
        items
      });
      
      // Should return 200 OK
      expect(response.status).toBe(200);
      
      // Check batch-specific response structure
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('batchId', 'TEST-BATCH-010');
      expect(response.data.data).toHaveProperty('totalItems', 3);
      expect(response.data.data).toHaveProperty('processedItems', 1);
      expect(response.data.data).toHaveProperty('success', false);
      expect(response.data.data).toHaveProperty('failedAtIndex', 1);
      expect(response.data.data).toHaveProperty('validationErrors');
      expect(response.data.data).toHaveProperty('legacyResponses');
      
      // Check that we have one successful response
      expect(response.data.data.legacyResponses.length).toBe(1);
    });
  });
});