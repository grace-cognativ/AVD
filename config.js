/**
 * Configuration for the AddVantage API error handling tests
 *
 * This file contains all the configuration settings for the tests.
 * Update these values to match your test environment.
 *
 * Environment variables can be used to override these settings.
 * See .env.example for available environment variables.
 */

// Load environment variables from .env file if present
require('dotenv').config();

module.exports = {
  // API Base URL
  baseUrl: process.env.API_BASE_URL || 'https://nah-avd-dev.cognativ.com/',

  // Authentication
  auth: {
    // JWT token for API authentication
    token: process.env.AUTH_TOKEN || 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkIwRUM1M0QwRUJCMUUzOUE1NTkzOTA2NzUzODU2MDY1REI3NzAyNjgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJuYWhfYXBpIiwiaXNzIjoiaHR0cHM6Ly9uYWgtaWRwLWRldi5jb2duYXRpdi5jb20iLCJleHAiOjE3Njc3OTE4MzcsImNsaWVudF9pZCI6Im5haF9kZXZfYXBpIiwianRpIjoiN2pPcGRPMXBlMWVmOWdWdDZXaVY3bHluOEJoNnJLaFEiLCJzdWIiOiJiY2NhYjAxNi1jZDYxLTQxNGEtYjZmMi1lMjA4NTE0MWIzYmMiLCJzY29wZSI6InByb2ZpbGUgb3BlbmlkIGVtYWlsIGZvcm1hdC5yZWFkIGZvcm1hdC5hZG1pbiB3cml0ZSBhZGR2YW50YWdlLmFwaSByZWFkIiwic2NwIjpbInByb2ZpbGUiLCJvcGVuaWQiLCJlbWFpbCIsImZvcm1hdC5yZWFkIiwiZm9ybWF0LmFkbWluIiwid3JpdGUiLCJhZGR2YW50YWdlLmFwaSIsInJlYWQiXSwicm9sZSI6IkFkbWluaXN0cmF0b3IiLCJpYXQiOjE3Njc3ODgyMzcsIm5iZiI6MTc2Nzc4ODIzN30.pLwISfonN-3EfGXe-mLLGXqhCNP2TwGl4wtevEKmUqETMsM37wB1jpJGB3TOqisoGFs_-CC3H4z5bC0utqkMUrXaF_XVVqJ5hY6CqScWr5mgpls_WlsDY7WPcst032yQUFYNoQzQz_YGqNFNSUyPchvUJt8_L8_bNrHmJDKb2L7lJzg480Z1dYtD0Wz1ZJPPPbhB0FgL3r8Kd99h4ovmAsON8wBXgqQ2m-2-w02mRkOCXFjCKdLAUiXj95jodjWB6GahUpJpddIGqvPS4LvVFQlkxNE2sRUxere6r3X5XahvEBgQ8xCderB4oG0l2qQ7k5z2iTj9MQm49MiIk6hqmn1uYR9p-MR2xwhnXegODFi_5PqNgyr5MxUdtRDO9rqjmPtHyA96-yeYxVb4gNBCNTwuh0X_tCbnsNCu4Oj14VA1Vnm7qLRkuhujb413pFwFlFg7kE1fm_G-kCWCdb2NqZom5is9Ec2naVYyCnjLKfpT7pg72_M01q53CRt6wOJjFQ7GvW4VLbNCLhBKL3EERoe55zVDWAxjmnoOfSgTgdtT0E8F4MZk61arps0Kq5tQWW02Vjzh2TPzO8UBrFTSzX3v2X_PL1hPS7mltultBtsJN4VjoCWEl8felEcOrqMC97koXvbRi9x_fj5gDjqvKT-JvItijXrzlB4R32uCGoA',

    // AddVantage-Authorization header value (Base64 encoded username:password)
    addVantageAuth: process.env.ADD_VANTAGE_AUTH || 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
  },

  // Test data
  testData: {
    // Valid operation name for STP requests
    validOperation: 'CustomerPayment',

    // Valid endpoint name for Inquiry requests
    validEndpoint: 'HoldingGroupTenantLoginSearch',

    // Invalid operation/endpoint names for testing 404 responses
    invalidOperation: 'NonExistentOperation',
    invalidEndpoint: 'NonExistentEndpoint',

    // Valid fields for STP requests
    validFields: {
      function: 'PTI',
      transaction_type: 'ERT',
      external_source_id: 'Google',
      account_number: 'A4345333',
      processing_code: 'A',
      reference_code: '3FER'
    },

    // Valid parameters for Inquiry requests
    validParameters: {
      loginId: 'RIA100',
      tenantId: 'RIAF',
      searchCrit: 'active',
      searchValue: 'submitted'
    }
  },

  // Test settings
  testSettings: {
    // Request timeout in milliseconds
    timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,

    // Maximum batch size for testing rate limiting
    maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE) || 101,

    // Custom correlation ID for testing
    testCorrelationId: process.env.TEST_CORRELATION_ID || 'test-correlation-id-12345',

    // Test UUID for request headers
    testUuid: process.env.TEST_UUID || 'test-uuid-12345'
  },

  // CORS settings
  cors: {
    // Allowed origin for CORS testing
    allowedOrigin: process.env.ALLOWED_ORIGIN || 'https://app.example.com',

    // Disallowed origin for CORS testing
    disallowedOrigin: process.env.DISALLOWED_ORIGIN || 'https://malicious-site.example.com'
  },

  // Report settings
  reportSettings: {
    // Path to JSON report file
    jsonReportPath: 'test-report.json',

    // Path to HTML report file
    htmlReportPath: 'test-report.html',

    // Path to markdown report file
    markdownReportPath: 'test-results.md'
  }
};