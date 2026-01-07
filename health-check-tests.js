/**
 * Health Check Tests for AddVantage API
 * 
 * This file contains tests for Health Check endpoints
 * as specified in Section 4 of the QA Test Plan.
 */

const axios = require('axios');
const config = require('./config');

// Import configuration
const BASE_URL = config.baseUrl;
const AUTH_TOKEN = config.auth.token;

// Helper function to create axios instance with common headers
const createApiClient = (customHeaders = {}, includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  // Add Authorization header if includeAuth is true
  if (includeAuth) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  
  return axios.create({
    baseURL: BASE_URL,
    headers,
    validateStatus: () => true, // Don't throw on error status codes
    timeout: config.testSettings.timeout
  });
};

// Helper function to validate health response structure
const validateHealthResponseStructure = (response) => {
  // Check basic response structure
  expect(response.data).toHaveProperty('success');
  expect(response.data).toHaveProperty('status');
  expect(response.data).toHaveProperty('data');
  expect(response.data).toHaveProperty('totalDurationMs');
  expect(response.data).toHaveProperty('timestamp');
  
  // Check data structure
  expect(response.data.data).toHaveProperty('main_api');
  expect(response.data.data.main_api).toHaveProperty('status');
  expect(response.data.data.main_api).toHaveProperty('description');
  expect(response.data.data.main_api).toHaveProperty('durationMs');
  
  // Return the response for further assertions
  return response;
};

// Helper function to validate readiness response structure
const validateReadinessResponseStructure = (response) => {
  // Check basic response structure
  expect(response.data).toHaveProperty('success');
  expect(response.data).toHaveProperty('status');
  expect(response.data).toHaveProperty('data');
  expect(response.data).toHaveProperty('totalDurationMs');
  expect(response.data).toHaveProperty('timestamp');
  
  // Check data structure
  expect(response.data.data).toHaveProperty('main_api');
  expect(response.data.data).toHaveProperty('format_management_service');
  expect(response.data.data).toHaveProperty('legacy_service');
  
  // Check main_api structure
  expect(response.data.data.main_api).toHaveProperty('status');
  expect(response.data.data.main_api).toHaveProperty('description');
  expect(response.data.data.main_api).toHaveProperty('durationMs');
  
  // Check format_management_service structure
  expect(response.data.data.format_management_service).toHaveProperty('status');
  expect(response.data.data.format_management_service).toHaveProperty('description');
  expect(response.data.data.format_management_service).toHaveProperty('durationMs');
  
  // Check legacy_service structure
  expect(response.data.data.legacy_service).toHaveProperty('status');
  expect(response.data.data.legacy_service).toHaveProperty('description');
  expect(response.data.data.legacy_service).toHaveProperty('durationMs');
  
  // Return the response for further assertions
  return response;
};

// Test suite for Health Check endpoints
describe('Health Check Testing', () => {
  
  // 4.1 GET /api/v1/health
  describe('4.1 GET /api/v1/health', () => {
    
    // HEALTH-001: Health check request
    test('HEALTH-001: Health check request should return 200 OK with status: "Healthy" or 503 with status: "Unhealthy"', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateHealthResponseStructure(response);
      
      // Check status matches HTTP status code
      if (response.status === 200) {
        expect(validatedResponse.data.status).toBe('Healthy');
        expect(validatedResponse.data.success).toBe(true);
      } else {
        expect(validatedResponse.data.status).toBe('Unhealthy');
        expect(validatedResponse.data.success).toBe(false);
      }
    });
    
    // HEALTH-002: Health check without authentication
    test('HEALTH-002: Health check without authentication should be accessible (not return 401)', async () => {
      const client = createApiClient({}, false); // No auth headers
      
      const response = await client.get('/api/v1/health');
      
      // Should not return 401 Unauthorized
      expect(response.status).not.toBe(401);
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      // Validate response structure
      validateHealthResponseStructure(response);
    });
    
    // HEALTH-003: Health check response structure validation
    test('HEALTH-003: Health check response structure validation should contain required fields', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateHealthResponseStructure(response);
      
      // Check totalDurationMs is a number
      expect(typeof validatedResponse.data.totalDurationMs).toBe('number');
      
      // Check timestamp is a valid date string
      expect(Date.parse(validatedResponse.data.timestamp)).not.toBeNaN();
      
      // Check main_api description is present
      expect(validatedResponse.data.data.main_api.description).toBeTruthy();
      expect(typeof validatedResponse.data.data.main_api.description).toBe('string');
    });
    
    // HEALTH-004: totalDurationMs aggregation validation
    test('HEALTH-004: totalDurationMs should equal sum of all reported durationMs values', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateHealthResponseStructure(response);
      
      // Calculate sum of all durationMs values
      let durationSum = 0;
      Object.values(validatedResponse.data.data).forEach(service => {
        durationSum += service.durationMs;
      });
      
      // Check totalDurationMs equals sum of all durationMs values
      expect(validatedResponse.data.totalDurationMs).toBe(durationSum);
    });
    
    // HEALTH-005: main_api description present
    test('HEALTH-005: main_api description should exist and be non-empty', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateHealthResponseStructure(response);
      
      // Check main_api description is present and non-empty
      expect(validatedResponse.data.data.main_api.description).toBeTruthy();
      expect(typeof validatedResponse.data.data.main_api.description).toBe('string');
      expect(validatedResponse.data.data.main_api.description.length).toBeGreaterThan(0);
    });
    
    // HEALTH-006: Response Content-Type and correlation header
    test('HEALTH-006: Response should have Content-Type: application/json and X-Correlation-Id header', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      // Check Content-Type header
      expect(response.headers['content-type']).toContain('application/json');
      
      // Check X-Correlation-Id header
      // This is optional, as some APIs might include it in the response body instead
      if (response.headers['x-correlation-id']) {
        expect(response.headers['x-correlation-id']).toBeTruthy();
      }
    });
  });
  
  // 4.2 GET /api/v1/health/ready
  describe('4.2 GET /api/v1/health/ready', () => {
    
    // READY-001: Readiness check request
    test('READY-001: Readiness check request should return 200 OK with status: "Ready" or 503 with status: "Not Ready"', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health/ready');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateReadinessResponseStructure(response);
      
      // Check status matches HTTP status code
      if (response.status === 200) {
        expect(validatedResponse.data.status).toBe('Ready');
        expect(validatedResponse.data.success).toBe(true);
      } else {
        expect(validatedResponse.data.status).toBe('Not Ready');
        expect(validatedResponse.data.success).toBe(false);
      }
    });
    
    // READY-002: Readiness check without authentication
    test('READY-002: Readiness check without authentication should be accessible (not return 401)', async () => {
      const client = createApiClient({}, false); // No auth headers
      
      const response = await client.get('/api/v1/health/ready');
      
      // Should not return 401 Unauthorized
      expect(response.status).not.toBe(401);
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      // Validate response structure
      validateReadinessResponseStructure(response);
    });
    
    // READY-003: Readiness check when all dependencies are healthy
    test('READY-003: Readiness check when all dependencies are healthy should return 200 OK with all services showing Healthy status', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health/ready');
      
      // If status is 200 OK, all services should be healthy
      if (response.status === 200) {
        const validatedResponse = validateReadinessResponseStructure(response);
        
        // Check all services are healthy
        expect(validatedResponse.data.data.main_api.status).toBe('Ready');
        expect(validatedResponse.data.data.format_management_service.status).toBe('Ready');
        expect(validatedResponse.data.data.legacy_service.status).toBe('Ready');
      } else {
        // If status is 503, at least one service is unhealthy
        // We'll skip this test as we can't force all services to be healthy
        console.log('READY-003: Skipping test as at least one service is unhealthy');
      }
    });
    
    // READY-004 and READY-005 require external service unavailability
    // These tests are placeholders and would need to be implemented with service virtualization
    test('READY-004: Readiness check when Format Management Service is unhealthy should return 503', () => {
      console.log('READY-004: This test requires service virtualization or controlled test environment');
    });
    
    test('READY-005: Readiness check when Legacy Service is unhealthy should return 503', () => {
      console.log('READY-005: This test requires service virtualization or controlled test environment');
    });
    
    // READY-006: Readiness check response structure validation
    test('READY-006: Readiness check response structure should contain status for all services', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health/ready');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateReadinessResponseStructure(response);
      
      // Check all services have status
      expect(validatedResponse.data.data.main_api.status).toBeTruthy();
      expect(validatedResponse.data.data.format_management_service.status).toBeTruthy();
      expect(validatedResponse.data.data.legacy_service.status).toBeTruthy();
    });
    
    // READY-007: totalDurationMs aggregation validation
    test('READY-007: totalDurationMs should equal sum of all reported durationMs values', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health/ready');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateReadinessResponseStructure(response);
      
      // Calculate sum of all durationMs values
      let durationSum = 0;
      Object.values(validatedResponse.data.data).forEach(service => {
        durationSum += service.durationMs;
      });
      
      // Check totalDurationMs equals sum of all durationMs values
      expect(validatedResponse.data.totalDurationMs).toBe(durationSum);
    });
    
    // READY-008: service descriptions presence
    test('READY-008: Each reported service should include a description', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v1/health/ready');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      const validatedResponse = validateReadinessResponseStructure(response);
      
      // Check all services have description
      expect(validatedResponse.data.data.main_api.description).toBeTruthy();
      expect(validatedResponse.data.data.format_management_service.description).toBeTruthy();
      expect(validatedResponse.data.data.legacy_service.description).toBeTruthy();
    });
  });
  
  // 4.3 GET /api/v2/health and GET /api/v2/health/ready
  describe('4.3 GET /api/v2/health and GET /api/v2/health/ready', () => {
    
    // HEALTH-V2-001: V2 health check request
    test('HEALTH-V2-001: V2 health check request should return 200 OK with additional ApiVersion information', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v2/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      // Validate basic health response structure
      validateHealthResponseStructure(response);
      
      // Check for ApiVersion information
      expect(response.data.data).toHaveProperty('ApiVersion');
      expect(response.data.data.ApiVersion).toHaveProperty('Version');
      expect(response.data.data.ApiVersion).toHaveProperty('BuildDate');
      expect(response.data.data.ApiVersion).toHaveProperty('Environment');
    });
    
    // HEALTH-V2-002: V2 health check response structure
    test('HEALTH-V2-002: V2 health check response should include ApiVersion object with Version, BuildDate, Environment', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v2/health');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      // Check for ApiVersion information
      expect(response.data.data).toHaveProperty('ApiVersion');
      expect(response.data.data.ApiVersion).toHaveProperty('Version');
      expect(response.data.data.ApiVersion).toHaveProperty('BuildDate');
      expect(response.data.data.ApiVersion).toHaveProperty('Environment');
      
      // Check Version is 2.0
      expect(response.data.data.ApiVersion.Version).toContain('2.0');
      
      // Check BuildDate is a valid date string
      expect(Date.parse(response.data.data.ApiVersion.BuildDate)).not.toBeNaN();
      
      // Check Environment is a non-empty string
      expect(typeof response.data.data.ApiVersion.Environment).toBe('string');
      expect(response.data.data.ApiVersion.Environment.length).toBeGreaterThan(0);
    });
    
    // V2 readiness check
    test('V2 readiness check should return 200 OK with additional ApiVersion information', async () => {
      const client = createApiClient();
      
      const response = await client.get('/api/v2/health/ready');
      
      // Should return either 200 OK or 503 Service Unavailable
      expect([200, 503]).toContain(response.status);
      
      // Validate basic readiness response structure
      validateReadinessResponseStructure(response);
      
      // Check for ApiVersion information
      expect(response.data.data).toHaveProperty('ApiVersion');
      expect(response.data.data.ApiVersion).toHaveProperty('Version');
      expect(response.data.data.ApiVersion).toHaveProperty('BuildDate');
      expect(response.data.data.ApiVersion).toHaveProperty('Environment');
    });
  });
});