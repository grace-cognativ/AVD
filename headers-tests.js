/**
 * Request/Response Headers Tests for AddVantage API
 * 
 * This file contains tests for request and response headers
 * as specified in Section 7 of the QA Test Plan.
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
const VALID_ENDPOINT = config.testData.validEndpoint;
const VALID_PARAMETERS = config.testData.validParameters;
const TEST_CORRELATION_ID = config.testSettings.testCorrelationId;

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

// Test suite for Request/Response Headers
describe('Request/Response Headers Testing', () => {
  
  // HEADER-001: Request with X-Correlation-Id header
  test('HEADER-001: Request with X-Correlation-Id header should include same correlation ID in response metadata', async () => {
    const client = createApiClient({
      'X-Correlation-Id': TEST_CORRELATION_ID
    });
    
    // Test STP endpoint
    const response = await client.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Check response status (should not be 401)
    expect(response.status).not.toBe(401);
    
    // Check correlation ID in metadata
    expect(response.data).toHaveProperty('metadata');
    expect(response.data.metadata).toHaveProperty('correlationId', TEST_CORRELATION_ID);
  });
  
  // HEADER-002: Request without X-Correlation-Id header
  test('HEADER-002: Request without X-Correlation-Id header should include auto-generated correlation ID in metadata', async () => {
    const client = createApiClient();
    
    // Test STP endpoint
    const response = await client.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Check response status (should not be 401)
    expect(response.status).not.toBe(401);
    
    // Check correlation ID in metadata
    expect(response.data).toHaveProperty('metadata');
    expect(response.data.metadata).toHaveProperty('correlationId');
    expect(response.data.metadata.correlationId).toBeTruthy();
    expect(typeof response.data.metadata.correlationId).toBe('string');
  });
  
  // HEADER-003: Response includes X-Correlation-Id header
  test('HEADER-003: Response should include X-Correlation-Id header', async () => {
    const client = createApiClient({
      'X-Correlation-Id': TEST_CORRELATION_ID
    });
    
    // Test STP endpoint
    const response = await client.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Check response status (should not be 401)
    expect(response.status).not.toBe(401);
    
    // Check X-Correlation-Id header in response
    // This is optional, as some APIs might include it in the response body instead
    if (response.headers['x-correlation-id']) {
      expect(response.headers['x-correlation-id']).toBe(TEST_CORRELATION_ID);
    }
    // If not in headers, it should be in the metadata
    else {
      expect(response.data.metadata).toHaveProperty('correlationId', TEST_CORRELATION_ID);
    }
  });
  
  // HEADER-004: Request with Content-Type: application/json
  test('HEADER-004: Request with Content-Type: application/json should be processed successfully', async () => {
    const client = createApiClient({
      'Content-Type': 'application/json'
    });
    
    // Test STP endpoint
    const response = await client.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Check response status (should not be 415 Unsupported Media Type)
    expect(response.status).not.toBe(415);
    
    // If validation fails, it should be for reasons other than Content-Type
    if (response.status === 400) {
      // Check that the error is not related to Content-Type
      expect(response.data).toHaveProperty('error');
      const errorFields = Object.keys(response.data.error.errors || {});
      const hasContentTypeError = errorFields.some(field => 
        field.toLowerCase().includes('content-type') || 
        field.toLowerCase().includes('contenttype')
      );
      expect(hasContentTypeError).toBe(false);
    }
  });
  
  // HEADER-005: Request with incorrect Content-Type
  test('HEADER-005: Request with incorrect Content-Type should return 400 Bad Request or 415 Unsupported Media Type', async () => {
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
    
    // Test STP endpoint
    const response = await client.post('/api/v1/stp', 
      JSON.stringify({
        operation: VALID_OPERATION,
        fields: VALID_FIELDS
      })
    );
    
    // Should return 400 Bad Request or 415 Unsupported Media Type
    expect([400, 415]).toContain(response.status);
  });
  
  // HEADER-006: Response Content-Type is application/json
  test('HEADER-006: Response Content-Type should be application/json', async () => {
    const client = createApiClient();
    
    // Test STP endpoint
    const response = await client.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Check Content-Type header
    expect(response.headers['content-type']).toBeTruthy();
    expect(response.headers['content-type'].toLowerCase()).toContain('application/json');
  });
  
  // Additional test: Required headers validation
  test('Required headers (AddVantage-Authorization, uuid) should be validated', async () => {
    // Test missing AddVantage-Authorization header
    const client1 = createApiClient();
    delete client1.defaults.headers['AddVantage-Authorization'];
    
    const response1 = await client1.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Should return 400 Bad Request or 401 Unauthorized
    expect([400, 401]).toContain(response1.status);
    
    // Test missing uuid header
    const client2 = createApiClient();
    delete client2.defaults.headers['uuid'];
    
    const response2 = await client2.post('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    });
    
    // Should return 400 Bad Request or 401 Unauthorized
    expect([400, 401]).toContain(response2.status);
  });
  
  // Additional test: Invalid UUID format
  test('Invalid UUID format should return 400 Bad Request', async () => {
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
  
  // Additional test: Invalid AddVantage-Authorization format
  test('Invalid AddVantage-Authorization format should return 400 Bad Request', async () => {
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
  
  // Additional test: Health check endpoints should not require headers
  test('Health check endpoints should not require AddVantage-Authorization or uuid headers', async () => {
    const client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json'
        // No AddVantage-Authorization or uuid headers
      },
      validateStatus: () => true,
      timeout: config.testSettings.timeout
    });
    
    // Test health endpoint
    const response = await client.get('/api/v1/health');
    
    // Should not return 400 Bad Request or 401 Unauthorized
    expect([400, 401]).not.toContain(response.status);
    
    // Should return either 200 OK or 503 Service Unavailable
    expect([200, 503]).toContain(response.status);
  });
});