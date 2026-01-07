const axios = require('axios');
const config = require('./config');

// Import configuration
const BASE_URL = config.baseUrl;
const ALLOWED_ORIGIN = config.cors && config.cors.allowedOrigin ? config.cors.allowedOrigin : 'https://app.example.com';
const DISALLOWED_ORIGIN = config.cors && config.cors.disallowedOrigin ? config.cors.disallowedOrigin : 'https://malicious-site.example.com';

/**
 * Helper function to create an axios instance for CORS testing
 * @param {string} origin - The Origin header to include in the request
 * @returns {Object} - Axios instance configured for CORS testing
 */
const createCorsTestClient = (origin) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Origin': origin,
      'Content-Type': 'application/json'
    },
    validateStatus: () => true, // Don't throw on error status codes
    timeout: config.testSettings.timeout
  });
};

/**
 * Helper function to validate CORS headers in response
 * @param {Object} response - The HTTP response object
 * @param {boolean} shouldHaveHeaders - Whether CORS headers should be present
 * @returns {boolean} - Whether the validation passed
 */
const validateCorsHeaders = (response, shouldHaveHeaders) => {
  const corsHeaders = [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Max-Age'
  ];

  if (shouldHaveHeaders) {
    // Check that all required CORS headers are present
    const missingHeaders = corsHeaders.filter(header => !response.headers[header.toLowerCase()]);
    if (missingHeaders.length > 0) {
      console.error(`Missing CORS headers: ${missingHeaders.join(', ')}`);
      return false;
    }

    // Validate Access-Control-Allow-Origin matches the request origin
    const allowOrigin = response.headers['access-control-allow-origin'];
    if (allowOrigin !== '*' && allowOrigin !== response.config.headers['Origin']) {
      console.error(`Access-Control-Allow-Origin does not match request origin. Expected: ${response.config.headers['Origin']}, Got: ${allowOrigin}`);
      return false;
    }

    return true;
  } else {
    // Check that no CORS headers are present
    const presentHeaders = corsHeaders.filter(header => response.headers[header.toLowerCase()]);
    if (presentHeaders.length > 0) {
      console.error(`Unexpected CORS headers present: ${presentHeaders.join(', ')}`);
      return false;
    }
    return true;
  }
};

// Test suite for CORS functionality
describe('CORS Testing', () => {
  
  // CORS-001: Preflight OPTIONS request from allowed origin
  describe('CORS-001: Preflight OPTIONS request from allowed origin', () => {
    test('OPTIONS request from allowed origin should return 200 OK with appropriate CORS headers', async () => {
      const client = createCorsTestClient(ALLOWED_ORIGIN);
      
      // Send OPTIONS request to the API
      const response = await client.options('/api/v1/stp', {
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, AddVantage-Authorization, uuid'
        }
      });
      
      // Check HTTP status code
      expect(response.status).toBe(200);
      
      // Validate CORS headers
      expect(validateCorsHeaders(response, true)).toBe(true);
      
      // Check specific CORS headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
      expect(response.headers).toHaveProperty('access-control-max-age');
      
      // Verify allowed methods include POST (for STP endpoint)
      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toContain('POST');
      
      // Verify allowed headers include our requested headers
      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toContain('Content-Type');
      expect(allowedHeaders).toContain('Authorization');
      expect(allowedHeaders).toContain('AddVantage-Authorization');
      expect(allowedHeaders).toContain('uuid');
    });
  });
  
  // CORS-002: Preflight OPTIONS request from disallowed origin
  describe('CORS-002: Preflight OPTIONS request from disallowed origin', () => {
    test('OPTIONS request from disallowed origin should not include CORS headers', async () => {
      const client = createCorsTestClient(DISALLOWED_ORIGIN);
      
      // Send OPTIONS request to the API
      const response = await client.options('/api/v1/stp', {
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, AddVantage-Authorization, uuid'
        }
      });
      
      // Note: The server might still return 200 OK, but should not include CORS headers
      // that would allow the browser to proceed with the actual request
      
      // Check that Access-Control-Allow-Origin is either missing or does not match our origin
      if (response.headers['access-control-allow-origin']) {
        expect(response.headers['access-control-allow-origin']).not.toBe(DISALLOWED_ORIGIN);
        expect(response.headers['access-control-allow-origin']).not.toBe('*');
      }
      
      // In a real browser, this would result in a CORS error and the browser would block the request
      console.log('Note: In a real browser, this request would be blocked due to CORS policy');
    });
  });
  
  // CORS-003: Actual request from allowed origin
  describe('CORS-003: Actual request from allowed origin', () => {
    test('POST request from allowed origin should succeed with CORS headers', async () => {
      const client = createCorsTestClient(ALLOWED_ORIGIN);
      
      // We need to add authentication headers for a real request
      client.defaults.headers['Authorization'] = `Bearer ${config.auth.token}`;
      client.defaults.headers['AddVantage-Authorization'] = config.auth.addVantageAuth;
      client.defaults.headers['uuid'] = config.testSettings.testUuid;
      
      // Send a POST request to the STP endpoint
      const response = await client.post('/api/v1/stp', {
        operation: config.testData.validOperation,
        fields: config.testData.validFields
      });
      
      // Check that the request was processed (either 200 OK or an error code, but not a CORS error)
      // We're not testing the API functionality here, just that CORS allows the request
      expect(response.status).not.toBe(0); // Status 0 would indicate a CORS error in browser
      
      // Validate CORS headers in the response
      expect(validateCorsHeaders(response, true)).toBe(true);
      
      // Check that Access-Control-Allow-Origin matches our origin
      expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    });
  });
  
  // CORS-004: CORS headers in response
  describe('CORS-004: CORS headers in response', () => {
    test('Response includes appropriate CORS headers', async () => {
      const client = createCorsTestClient(ALLOWED_ORIGIN);
      
      // Send a simple GET request to the health endpoint (which doesn't require auth)
      const response = await client.get('/api/v1/health');
      
      // Validate CORS headers
      expect(validateCorsHeaders(response, true)).toBe(true);
      
      // Check specific headers and their values
      expect(response.headers).toHaveProperty('access-control-allow-origin', ALLOWED_ORIGIN);
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      
      // Verify allowed methods include common HTTP methods
      const allowedMethods = response.headers['access-control-allow-methods'];
      const expectedMethods = ['GET', 'POST', 'OPTIONS'];
      expectedMethods.forEach(method => {
        expect(allowedMethods).toContain(method);
      });
      
      // Check for Vary header which is important for CORS with specific origins
      // This helps with caching when the response varies based on Origin header
      expect(response.headers).toHaveProperty('vary');
      expect(response.headers['vary']).toContain('Origin');
    });
  });
  
  // Additional test: CORS configuration based on environment
  describe('CORS Environment Configuration', () => {
    test('CORS configuration is appropriate for the current environment', async () => {
      // This test checks if CORS is configured as expected for the current environment
      // In production, CORS might be disabled or more restrictive
      
      const client = createCorsTestClient(ALLOWED_ORIGIN);
      const response = await client.options('/api/v1/health');
      
      // Get the current environment from config
      const environment = config.environment || 'development';
      
      if (environment === 'production') {
        // In production, CORS might be disabled or very restrictive
        console.log('Testing production CORS configuration');
        // Check if CORS is disabled or restricted to specific origins
        if (response.headers['access-control-allow-origin']) {
          // If CORS is enabled in production, it should be very specific
          expect(response.headers['access-control-allow-origin']).not.toBe('*');
          // Should be a specific origin, not a wildcard
          expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
        }
      } else {
        // In development/test environments, CORS should be enabled
        console.log(`Testing ${environment} CORS configuration`);
        expect(validateCorsHeaders(response, true)).toBe(true);
      }
    });
  });
});

// Export the helper functions for use in other test files
module.exports = {
  createCorsTestClient,
  validateCorsHeaders
};