# Test User Credentials

Use these credentials to log in and test the Flight Reservation System.

## Admin Account

| Username | Email                     | Password   | Role  |
|----------|---------------------------|------------|-------|
| admin    | admin@flightbooking.com   | Admin@123  | ADMIN |

## Customer Accounts

| Username     | Email                    | Password   | Role     |
|--------------|--------------------------|------------|----------|
| johndoe      | john.doe@email.com       | John@123   | CUSTOMER |
| janesmith    | jane.smith@email.com     | Jane@123   | CUSTOMER |
| ahmedhassan  | ahmed.hassan@email.com   | Ahmed@123  | CUSTOMER |
| saraali      | sara.ali@email.com       | Sara@123   | CUSTOMER |

## Notes

- Passwords are hashed with **BCrypt** (via PostgreSQL's `pgcrypto` extension) in the V3 migration.
- Use the **username** and **password** fields for the `/api/auth/login` endpoint.
- The admin account has access to `/api/admin/**` endpoints.
- Customer accounts have access to `/api/user/**` endpoints.
