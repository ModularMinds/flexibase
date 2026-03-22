# Flexibase Authentication Service

The **Authentication Service** is the backbone of identity management for the Flexibase ecosystem. It provides secure, stateless authentication using JSON Web Tokens (JWT) and supports comprehensive user management features.

## Core Features

- **User Registration & Login**: Secure sign-up and sign-in flows with hashed passwords (Bcrypt).
- **JWT Authentication**: Access and Refresh token rotation for secure session management.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` and `ADMIN` roles.
- **Admin Management**: Administrative endpoints to promote/demote users, suspend accounts, and delete users.
- **Profile Management**: Endpoints for users to view and update their profile and change passwords.
- **Security**: Rate limiting, strict password validation, and input sanitization (Zod).

## API Documentation

Interactive API documentation via Swagger is available at:
`http://localhost:5000/api-docs`

## Key Endpoints

### Public

- `POST /auth/sign-up`: Register a new user.
- `POST /auth/sign-in`: Authenticate and receive tokens.
- `POST /auth/refresh-token`: Rotate access tokens.

### Protected (User)

- `GET /auth/me`: Get current user profile.
- `PATCH /auth/me`: Update profile details.
- `POST /auth/change-password`: Securely change password.

### Admin Only

- `GET /auth/admin/get-users`: List all registered users.
- `PATCH /auth/admin/users/:id/role`: Promote or demote a user.
- `PATCH /auth/admin/users/:id/status`: Suspend or activate a user account.
- `DELETE /auth/admin/users/:id`: Permanently remove a user.

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Validation**: Zod
- **Encryption**: Bcrypt
- **Logging**: Winston

## Environment Variables

Ensure the following variables are set in your `.env` file:

```env
PORT=5000
DATABASE_URL="postgresql://..."
FLEXIBASE_AUTH_SECRET_KEY="your-secret-key"
FLEXIBASE_AUTH_REFRESH_SECRET_KEY="your-refresh-secret-key"
NODE_ENV="development"
```
