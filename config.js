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
  baseUrl: process.env.API_BASE_URL || 'https://nah-avd-dev.cognativ.com/swagger/index.html/',
  
  // Authentication
  auth: {
    // JWT token for API authentication
    token: process.env.AUTH_TOKEN || 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkIwRUM1M0QwRUJCMUUzOUE1NTkzOTA2NzUzODU2MDY1REI3NzAyNjgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJuYWhfYXBpIiwiaXNzIjoiaHR0cHM6Ly9uYWgtaWRwLWRldi5jb2duYXRpdi5jb20iLCJleHAiOjE3Njc2OTEwNTcsImNsaWVudF9pZCI6Im5haF9kZXZfYXBpIiwianRpIjoiclpLcnhFU3Nvak9EUU13YWZCSjF0YUE3d0NlRFZ2cFkiLCJzdWIiOiJiY2NhYjAxNi1jZDYxLTQxNGEtYjZmMi1lMjA4NTE0MWIzYmMiLCJzY29wZSI6InByb2ZpbGUgb3BlbmlkIGVtYWlsIGZvcm1hdC5yZWFkIGZvcm1hdC5hZG1pbiB3cml0ZSBhZGR2YW50YWdlLmFwaSByZWFkIiwic2NwIjpbInByb2ZpbGUiLCJvcGVuaWQiLCJlbWFpbCIsImZvcm1hdC5yZWFkIiwiZm9ybWF0LmFkbWluIiwid3JpdGUiLCJhZGR2YW50YWdlLmFwaSIsInJlYWQiXSwicm9sZSI6IkFkbWluaXN0cmF0b3IiLCJpYXQiOjE3Njc2ODc0NTcsIm5iZiI6MTc2NzY4NzQ1N30.EqFOCW41K9RuX18c1aTAgszptU3HQxZwZ9QFGAxekwCWTPCQjGJZieAKN8UH6aMt4O3nLQYcorLk2sFdD9S_1jH8jMvgTt-qT5mZKtTGrHOBHQbNNJHCLgW5lPPO-DQRn9musAgTasi1CXRoj6NRZLZyktBrLzsH95Bpf_ErfDySZyXyPl42eGMcdGXpYNCs1f8AVhHNeJHTjG2P9hdO6UuLFCymH2mahmllJh2CgCBxITQyBvVFJGpJKREjqbMcncNHoj4h5bftF5yfUTLP_-WNSlcMnhyRjKaCuzm2CS7cyBu1ePez7uq7XUGmsHCS2f74Mshf-VPGC5Y5U6i3jjwYmuo8ql3Xt8gWZb-DzIRJRHk3ynl2itEkQfBrClcKQXr0LinV6SOtR3Nkq4Laj_YZC9lsDMWSndYDwjJR72Ql_aJwxp1R6Ow_A68HtSvSe5i1IqyidZ7eH3HUE6z8dWpWXtMsY9dso4V47xCINe_wOYV5fFRhmJzNkCtwHH8XgR47ACPpPuXCfiuU86jlKQOqY-xn5GujhetYskD80xIJFtGRpkCy9ekCtJVzxcEZhrlUBNVoandVxcqO-liN3jwXp8p3bNXvd4cT1lu_5igWzYBPSd490s7WU7TwMEhwgucuGGuLgU89iLC8UNMTygThFahkb8uB5Hg9fWXwiks',
    
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
      account_number: 'A4345333',
      processing_code: 'A',
      reference_code: '3FER'
    },
    
    // Valid parameters for Inquiry requests
    validParameters: {
      loginId: 'RIA100',
      tenantId: 'RIAF',
      searchCrit: 'account',
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
    testCorrelationId: process.env.TEST_CORRELATION_ID || 'test-correlation-id-12345'
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