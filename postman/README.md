# STP API Test Suite

This repository contains the Postman collection and environment files for testing the STP, Inquiry, and Health APIs.

## Purpose

- Serve as a **living API test suite** for QA engineers.
- Document API endpoints and test scenarios.
- Enable internal team members to **run API tests safely**.

## Getting Started

1. **Import the Postman collection**
   - Open Postman → File → Import → select `postman/collections/nah-addVantage Main API.postman_collection.json`.

2. **Import the environment**
   - Open Postman → File → Import → select `postman/environments/addVantage-test-env.postman_environment.json`.
   - Replace placeholders with internal credentials and test values.

3. **Run Tests**
   - In Postman: Run the collection in the GUI using the imported environment.
   - Or via Newman CLI:
     ```bash
     newman run collections/stp-api-tests.postman_collection.json \
         -e environments/internal.postman_environment.json \
         --reporters cli,json
     ```

## Security Notes

- **Do not commit real tokens or credentials.**
- Use environment variables for all secrets (`addvantage_token`, `uuid`, etc.).
- Replace account numbers, transaction IDs, and batch IDs with **test placeholders**.

## Contributing

- Update collection in Postman → export → commit changes.
- Update `test-scenarios.md` with new scenarios.
- Document any new environment variables in `internal.postman_environment.json`.
