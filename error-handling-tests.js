const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

// Import configuration
const BASE_URL = config.baseUrl;
const AUTH_TOKEN = config.auth.token;
const ADD_VANTAGE_AUTH = config.auth.addVantageAuth;
const TEST_CORRELATION_ID = config.testSettings.testCorrelationId;
const MAX_BATCH_SIZE = config.testSettings.maxBatchSize;
const VALID_OPERATION = config.testData.validOperation;
const INVALID_OPERATION = config.testData.invalidOperation;
const INVALID_ENDPOINT = config.testData.invalidEndpoint;
const VALID_FIELDS = config.testData.validFields;
const VALID_PARAMETERS = config.testData.validParameters;

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
  
  // Check metadata
  expect(response.data.metadata).toHaveProperty('ProcessedAt');
  
  // Return the response for further assertions
  return response;
};

// Test suite for error handling
describe('Error Handling Tests', () => {
  
  // ERR-001: Validation error response structure
  describe('ERR-001: Validation Error Response Structure', () => {
    test('STP request with missing operation field should return 400 with validation error', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/stp', {
        // Missing 'operation' field
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Additional validation error specific checks
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('operation');
    });
    
    test('STP request with missing fields dictionary should return 400 with validation error', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION
        // Missing 'fields' dictionary
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Additional validation error specific checks
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('fields');
    });
    
    test('Batch request with empty items array should return 400 with validation error', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-001',
        items: [] // Empty items array
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Additional validation error specific checks
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('items');
    });
  });
  
  // ERR-002: Not Found error response structure
  describe('ERR-002: Not Found Error Response Structure', () => {
    test('STP request with invalid operation name should return 404 with FormatNotFound error', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/stp', {
        operation: INVALID_OPERATION, // Invalid operation name
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'FormatNotFound', 404);
      
      // Additional not found specific checks
      expect(validatedResponse.data.error.message).toContain(INVALID_OPERATION);
    });
    
    test('Inquiry request with invalid endpoint should return 404 with FormatNotFound error', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/inquiry', {
        endpoint: INVALID_ENDPOINT, // Invalid endpoint name
        parameters: VALID_PARAMETERS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'FormatNotFound', 404);
      
      // Additional not found specific checks
      expect(validatedResponse.data.error.message).toContain(INVALID_ENDPOINT);
    });
  });
  
  // ERR-003: Unauthorized error response structure
  describe('ERR-003: Unauthorized Error Response Structure', () => {
    test('Request without Authorization header should return 401 with appropriate error', async () => {
      const client = createApiClient({
        'Authorization': '' // Empty Authorization header
      });
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, null, 401);
      
      // Additional unauthorized specific checks
      expect(validatedResponse.data.error.message).toBeTruthy();
    });
    
    test('Request with invalid JWT token should return 401 with appropriate error', async () => {
      const client = createApiClient({
        'Authorization': 'Bearer invalid.token.here'
      });
      
      const response = await client.post('/api/v1/stp', {
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, null, 401);
      
      // Additional unauthorized specific checks
      expect(validatedResponse.data.error.message).toBeTruthy();
    });
  });
  
  // ERR-004: Rate limit error response structure
  describe('ERR-004: Rate Limit Error Response Structure', () => {
    test('Batch request exceeding MaxBatchSize should return 429 with RateLimitExceeded error', async () => {
      const client = createApiClient();
      
      // Create a batch with more than MaxBatchSize items
      const items = Array(MAX_BATCH_SIZE).fill().map(() => ({
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      }));
      
      const response = await client.post('/api/v1/stp/batch', {
        batchId: 'TEST-BATCH-002',
        items
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'RateLimitExceeded', 429);
      
      // Additional rate limit specific checks
      expect(response.headers).toHaveProperty('retry-after');
    });
  });
  
  // ERR-005: External service error response structure
  describe('ERR-005: External Service Error Response Structure', () => {
    // Note: This test is more challenging to automate as it requires the external service to be unavailable
    // In a real environment, you might use service virtualization or mocking
    test('STP request when Format Management Service is unavailable should return 502', async () => {
      // This is a placeholder test that would need to be implemented with service virtualization
      // or by temporarily disabling the external service in a controlled test environment
      console.log('ERR-005: This test requires service virtualization or controlled test environment');
      
      // For demonstration purposes, we'll skip the actual test
      // In a real implementation, you would:
      // 1. Configure the test environment to make Format Management Service unavailable
      // 2. Send a request that requires Format Management Service
      // 3. Validate the 502 response with ExternalServiceError code
    });
  });
  
  // ERR-006: Server error response structure
  describe('ERR-006: Server Error Response Structure', () => {
    // Note: This test is challenging to automate as it requires causing a server error
    // In a real environment, you might use a special test endpoint that triggers a server error
    test('Request that triggers server error should return 500 with ServerError', async () => {
      // This is a placeholder test that would need a special test endpoint
      console.log('ERR-006: This test requires a special test endpoint that triggers a server error');
      
      // For demonstration purposes, we'll skip the actual test
      // In a real implementation, you would:
      // 1. Send a request to a special test endpoint that triggers a server error
      // 2. Validate the 500 response with ServerError code
    });
  });
  
  // ERR-007: Error response includes correlation ID
  describe('ERR-007: Error Response Includes Correlation ID', () => {
    test('Error responses should include correlation ID in metadata', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/stp', {
        // Missing 'operation' field to trigger validation error
        fields: VALID_FIELDS
      });
      
      // Validate basic error structure
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
      expect(response.data).toHaveProperty('metadata');
      
      // Check for correlation ID in metadata
      expect(response.data.metadata).toHaveProperty('correlationId');
      expect(typeof response.data.metadata.correlationId).toBe('string');
      expect(response.data.metadata.correlationId).not.toBe('');
    });
    
    test('Custom correlation ID in request header should be preserved in response', async () => {
      const client = createApiClient({
        'X-Correlation-Id': TEST_CORRELATION_ID
      });
      
      const response = await client.post('/api/v1/stp', {
        // Missing 'operation' field to trigger validation error
        fields: VALID_FIELDS
      });
      
      // Validate basic error structure
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('metadata');
      
      // Check that our custom correlation ID was preserved
      expect(response.data.metadata).toHaveProperty('correlationId', TEST_CORRELATION_ID);
    });
  });
  
  // ERR-008: Error response includes ProcessedAt timestamp
  describe('ERR-008: Error Response Includes ProcessedAt Timestamp', () => {
    test('All error responses should include ProcessedAt timestamp in metadata', async () => {
      const client = createApiClient();
      const response = await client.post('/api/v1/stp', {
        // Missing 'operation' field to trigger validation error
        fields: VALID_FIELDS
      });
      
      // Validate basic error structure
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('metadata');
      
      // Check for ProcessedAt timestamp in metadata
      expect(response.data.metadata).toHaveProperty('ProcessedAt');
      
      // Validate timestamp format (ISO 8601)
      const processedAt = response.data.metadata.ProcessedAt;
      expect(typeof processedAt).toBe('string');
      expect(Date.parse(processedAt)).not.toBeNaN();
      
      // Validate timestamp is recent (within last minute)
      const processedAtDate = new Date(processedAt);
      const now = new Date();
      const differenceInSeconds = Math.abs((now - processedAtDate) / 1000);
      expect(differenceInSeconds).toBeLessThan(60);
    });
  });
});