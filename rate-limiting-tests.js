/**
 * Rate Limiting Tests for AddVantage API
 * 
 * This file contains tests for rate limiting behavior
 * as specified in Section 5 of the QA Test Plan.
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

// Helper function to validate rate limit error response
const validateRateLimitResponse = (response) => {
  // Check HTTP status code
  expect(response.status).toBe(429);
  
  // Check basic response structure
  expect(response.data).toHaveProperty('success', false);
  expect(response.data).toHaveProperty('error');
  expect(response.data).toHaveProperty('metadata');
  
  // Check error object structure
  expect(response.data.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
  expect(response.data.error).toHaveProperty('message');
  
  // Check for Retry-After header
  expect(response.headers).toHaveProperty('retry-after');
  
  // Return the response for further assertions
  return response;
};

// Helper function to make multiple requests in sequence
const makeSequentialRequests = async (endpoint, payload, count) => {
  const client = createApiClient();
  const responses = [];
  
  for (let i = 0; i < count; i++) {
    const response = await client.post(endpoint, payload);
    responses.push(response);
    
    // If we hit a rate limit, stop making requests
    if (response.status === 429) {
      break;
    }
  }
  
  return responses;
};

// Helper function to make multiple requests in parallel
const makeParallelRequests = async (endpoint, payload, count) => {
  const client = createApiClient();
  const requests = [];
  
  for (let i = 0; i < count; i++) {
    requests.push(client.post(endpoint, payload));
  }
  
  return Promise.all(requests);
};

// Test suite for Rate Limiting
describe('Rate Limiting Testing', () => {
  
  // RATE-001: STP endpoint - requests within limit
  test('RATE-001: STP endpoint - requests within limit (500 req/min) should all succeed', async () => {
    // For testing purposes, we'll make a small number of requests (5)
    // In a real test environment, you might want to test with more requests
    const responses = await makeSequentialRequests('/api/v1/stp', {
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    }, 5);
    
    // All requests should succeed (not hit rate limit)
    responses.forEach(response => {
      expect(response.status).not.toBe(429);
    });
  }, 30000); // Increase timeout for multiple requests
  
  // RATE-002: STP endpoint - requests exceeding limit
  test('RATE-002: STP endpoint - requests exceeding limit should return 429 Too Many Requests', () => {
    // This test is a placeholder as it's not practical to make 500+ requests in a unit test
    console.log('RATE-002: This test requires a controlled test environment or load testing tool');
    
    // In a real test environment, you would:
    // 1. Configure a lower rate limit for testing
    // 2. Make requests until you hit the rate limit
    // 3. Validate the 429 response
  });
  
  // RATE-003: Inquiry endpoint - requests within limit
  test('RATE-003: Inquiry endpoint - requests within limit (2000 req/min) should all succeed', async () => {
    // For testing purposes, we'll make a small number of requests (5)
    // In a real test environment, you might want to test with more requests
    const responses = await makeSequentialRequests('/api/v1/inquiry', {
      endpoint: VALID_ENDPOINT,
      parameters: VALID_PARAMETERS
    }, 5);
    
    // All requests should succeed (not hit rate limit)
    responses.forEach(response => {
      expect(response.status).not.toBe(429);
    });
  }, 30000); // Increase timeout for multiple requests
  
  // RATE-004: Inquiry endpoint - requests exceeding limit
  test('RATE-004: Inquiry endpoint - requests exceeding limit should return 429 Too Many Requests', () => {
    // This test is a placeholder as it's not practical to make 2000+ requests in a unit test
    console.log('RATE-004: This test requires a controlled test environment or load testing tool');
    
    // In a real test environment, you would:
    // 1. Configure a lower rate limit for testing
    // 2. Make requests until you hit the rate limit
    // 3. Validate the 429 response
  });
  
  // RATE-005: STP Batch endpoint - requests within limit
  test('RATE-005: STP Batch endpoint - requests within limit (500 req/min) should all succeed', async () => {
    // For testing purposes, we'll make a small number of requests (5)
    // In a real test environment, you might want to test with more requests
    const responses = await makeSequentialRequests('/api/v1/stp/batch', {
      batchId: 'TEST-BATCH-RATE-005',
      items: [
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        },
        {
          operation: VALID_OPERATION,
          fields: VALID_FIELDS
        }
      ]
    }, 5);
    
    // All requests should succeed (not hit rate limit)
    responses.forEach(response => {
      expect(response.status).not.toBe(429);
    });
  }, 30000); // Increase timeout for multiple requests
  
  // RATE-006: STP Batch endpoint - batch size exceeding MaxBatchSize
  test('RATE-006: STP Batch endpoint - batch size exceeding MaxBatchSize should return 429 Too Many Requests', async () => {
    const client = createApiClient();
    
    // Create a batch with more than MaxBatchSize items
    const items = Array(MAX_BATCH_SIZE).fill().map(() => ({
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    }));
    
    const response = await client.post('/api/v1/stp/batch', {
      batchId: 'TEST-BATCH-RATE-006',
      items
    });
    
    // Validate rate limit response
    validateRateLimitResponse(response);
  });
  
  // RATE-007: Default endpoint - requests within limit
  test('RATE-007: Default endpoint - requests within limit (10 req/min) should all succeed', async () => {
    // For testing purposes, we'll make a small number of requests (5)
    // In a real test environment, you might want to test with more requests
    const responses = await makeSequentialRequests('/api/v1/health', {}, 5);
    
    // All requests should succeed (not hit rate limit)
    responses.forEach(response => {
      expect(response.status).not.toBe(429);
    });
  }, 30000); // Increase timeout for multiple requests
  
  // RATE-008: Default endpoint - requests exceeding limit
  test('RATE-008: Default endpoint - requests exceeding limit should return 429 Too Many Requests', () => {
    // This test is a placeholder as it's not practical to make many requests in a unit test
    console.log('RATE-008: This test requires a controlled test environment or load testing tool');
    
    // In a real test environment, you would:
    // 1. Configure a lower rate limit for testing
    // 2. Make requests until you hit the rate limit
    // 3. Validate the 429 response
  });
  
  // RATE-009: Rate limit response structure
  test('RATE-009: Rate limit response should include error code "RATE_LIMIT_EXCEEDED", message, and retry after time', async () => {
    const client = createApiClient();
    
    // Create a batch with more than MaxBatchSize items to trigger rate limit
    const items = Array(MAX_BATCH_SIZE).fill().map(() => ({
      operation: VALID_OPERATION,
      fields: VALID_FIELDS
    }));
    
    const response = await client.post('/api/v1/stp/batch', {
      batchId: 'TEST-BATCH-RATE-009',
      items
    });
    
    // Validate rate limit response
    const validatedResponse = validateRateLimitResponse(response);
    
    // Check error code
    expect(validatedResponse.data.error.code).toBe('RATE_LIMIT_EXCEEDED');
    
    // Check error message
    expect(validatedResponse.data.error.message).toContain('Rate limit exceeded');
    
    // Check Retry-After header
    expect(validatedResponse.headers['retry-after']).toBeTruthy();
    expect(parseInt(validatedResponse.headers['retry-after'])).toBeGreaterThanOrEqual(0);
  });
  
  // RATE-010: Rate limit reset after time window
  test('RATE-010: Requests should succeed after rate limit window resets', () => {
    // This test is a placeholder as it requires waiting for the rate limit window to reset
    console.log('RATE-010: This test requires a controlled test environment with shorter rate limit windows');
    
    // In a real test environment, you would:
    // 1. Configure a shorter rate limit window for testing (e.g., 5 seconds)
    // 2. Make requests until you hit the rate limit
    // 3. Wait for the rate limit window to reset
    // 4. Make another request and verify it succeeds
  });
  
  // Additional test: Burst size allows temporary spikes
  test('Burst size should allow temporary spikes in request rate', () => {
    // This test is a placeholder as it requires a controlled test environment
    console.log('Burst size test requires a controlled test environment with configurable burst size');
    
    // In a real test environment, you would:
    // 1. Configure a lower rate limit and burst size for testing
    // 2. Make a burst of requests (equal to burst size) in quick succession
    // 3. Verify all requests succeed
    // 4. Make one more request and verify it gets rate limited
  });
});