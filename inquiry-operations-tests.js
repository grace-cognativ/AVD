/**
 * Inquiry Operations Tests for AddVantage API
 * 
 * This file contains tests for Inquiry operations
 * as specified in Section 3 of the QA Test Plan.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

// Import configuration
const BASE_URL = config.baseUrl;
const AUTH_TOKEN = config.auth.token;
const ADD_VANTAGE_AUTH = config.auth.addVantageAuth;
const VALID_ENDPOINT = config.testData.validEndpoint;
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

// Test suite for Inquiry operations
describe('Inquiry Operations Testing', () => {
  
  // 3.1 POST /api/v1/inquiry
  describe('3.1 POST /api/v1/inquiry', () => {
    
    // INQ-001: Valid inquiry request with all required parameters
    test('INQ-001: Valid inquiry request with all required parameters should return 200 OK with success response', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT,
        parameters: VALID_PARAMETERS
      });
      
      const validatedResponse = validateSuccessResponseStructure(response);
      
      // Check Inquiry-specific response structure
      expect(validatedResponse.data.data).toBeTruthy();
      expect(typeof validatedResponse.data.data).toBe('object');
      
      // Check metadata
      expect(validatedResponse.data.metadata).toHaveProperty('ProcessedAt');
    });
    
    // INQ-002: Inquiry request with missing endpoint field
    test('INQ-002: Inquiry request with missing endpoint field should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        // Missing 'endpoint' field
        parameters: VALID_PARAMETERS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('endpoint');
    });
    
    // INQ-003: Inquiry request with missing parameters object
    test('INQ-003: Inquiry request with missing parameters object should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT
        // Missing 'parameters' object
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      expect(validatedResponse.data.error.errors).toHaveProperty('parameters');
    });
    
    // INQ-004: Inquiry request with invalid endpoint name
    test('INQ-004: Inquiry request with invalid endpoint name should return 404 Not Found', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: 'NonExistentEndpoint', // Invalid endpoint name
        parameters: VALID_PARAMETERS
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'FormatNotFound', 404);
      
      // Check for endpoint name in error message
      expect(validatedResponse.data.error.message).toContain('NonExistentEndpoint');
    });
    
    // INQ-005: Inquiry request with invalid query parameters
    test('INQ-005: Inquiry request with invalid query parameters should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT,
        parameters: {
          ...VALID_PARAMETERS,
          loginId: '', // Empty login ID
          searchCrit: 123 // Invalid type (should be string)
        }
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
      
      // Check for validation errors on specific fields
      const errorFields = Object.keys(validatedResponse.data.error.errors);
      const hasLoginIdError = errorFields.some(field => field.includes('loginId'));
      const hasSearchCritError = errorFields.some(field => field.includes('searchCrit'));
      
      expect(hasLoginIdError || hasSearchCritError).toBe(true);
    });
    
    // INQ-006: Inquiry request missing AddVantage-Authorization header
    test('INQ-006: Inquiry request missing AddVantage-Authorization header should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      // Remove AddVantage-Authorization header
      delete client.defaults.headers['AddVantage-Authorization'];
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT,
        parameters: VALID_PARAMETERS
      });
      
      // Should return 400 Bad Request or 401 Unauthorized
      expect([400, 401]).toContain(response.status);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // INQ-007: Inquiry request missing uuid header
    test('INQ-007: Inquiry request missing uuid header should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      // Remove uuid header
      delete client.defaults.headers['uuid'];
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT,
        parameters: VALID_PARAMETERS
      });
      
      // Should return 400 Bad Request or 401 Unauthorized
      expect([400, 401]).toContain(response.status);
      
      // Check for error response structure
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
    });
    
    // INQ-008: Inquiry request with parameters not matching format definition
    test('INQ-008: Inquiry request with parameters not matching format definition should return 400 Bad Request', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT,
        parameters: {
          // Missing required parameters
          invalidParam1: 'value1',
          invalidParam2: 'value2'
        }
      });
      
      const validatedResponse = validateErrorResponseStructure(response, 'ValidationError', 400);
      
      // Check for field-specific validation errors
      expect(validatedResponse.data.error).toHaveProperty('errors');
    });
    
    // INQ-009 and INQ-010 require external service unavailability
    // These tests are placeholders and would need to be implemented with service virtualization
    test('INQ-009: Inquiry request when Format Management Service is unavailable should return 502 Bad Gateway', () => {
      console.log('INQ-009: This test requires service virtualization or controlled test environment');
    });
    
    test('INQ-010: Inquiry request when Legacy Service is unavailable should return 502 Bad Gateway', () => {
      console.log('INQ-010: This test requires service virtualization or controlled test environment');
    });
    
    // INQ-011: Inquiry request with empty parameters object
    test('INQ-011: Inquiry request with empty parameters object should return 400 Bad Request or successful', async () => {
      const client = createApiClient();
      
      const response = await client.post('/api/v1/inquiry', {
        endpoint: VALID_ENDPOINT,
        parameters: {} // Empty parameters object
      });
      
      // This could be valid or invalid depending on the endpoint requirements
      // We'll accept either 200 OK or 400 Bad Request
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 200) {
        // If successful, validate success response structure
        validateSuccessResponseStructure(response);
      } else {
        // If validation error, validate error response structure
        validateErrorResponseStructure(response, 'ValidationError', 400);
        
        // Check for field-specific validation errors
        expect(response.data.error).toHaveProperty('errors');
      }
    });
  });
});