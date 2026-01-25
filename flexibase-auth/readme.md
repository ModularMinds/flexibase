# Authentication Module

This module is responsible for handling user authentication, including signing up, signing in, and verifying user identities. It also provides administrative routes for managing users.

## Routes Overview

### Public Routes

#### **1. POST /auth/sign-up**
**Description**: Registers a new user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
- **Success**:
  ```json
  {
    "message": "user created successfully",
    "isSuccess": true,
    "token": "<jwt-token>"
  }
  ```
- **Error**:
  ```json
  {
    "err": "<error-message>",
    "isSuccess": false
  }
  ```

---

#### **2. POST /auth/sign-in**
**Description**: Logs in an existing user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
- **Success**:
  ```json
  {
    "message": "Login successful.",
    "token": "<jwt-token>",
    "isSuccess": true
  }
  ```
- **Error**:
  ```json
  {
    "message": "Invalid credentials.",
    "isSuccess": false
  }
  ```

---

#### **3. GET /auth/verify-user**
**Description**: Verifies a user using a token.

**Headers**:
- `Authorization`: `Bearer <jwt-token>`

**Response**:
- **Success**:
  ```json
  {
    "message": "User verified successfully",
    "isSuccess": true
  }
  ```
- **Error**:
  ```json
  {
    "message": "Invalid or expired token.",
    "isSuccess": false
  }
  ```

---

### Admin Routes

#### **1. GET /auth/admin/get-users**
**Description**: Fetches a list of all registered users. Requires admin authentication.

**Headers**:
- `Authorization`: `Bearer <admin-jwt-token>`

**Response**:
- **Success**:
  ```json
  {
    "users": [
      {
        "id": "<user-id>",
        "email": "user@example.com"
      }
    ],
    "isSuccess": true
  }
  ```
- **Error**:
  ```json
  {
    "message": "Access denied.",
    "isSuccess": false
  }
  ```

---

## Implementation Details

### Middleware

#### **1. passwordHasher**
**Purpose**: Hashes the user's password before storing it in the database.

#### **2. tokenVerifier**
**Purpose**: Verifies the JWT token provided in the request headers.

#### **3. adminAuthenticator**
**Purpose**: Ensures the requester is an authenticated admin.

---

### Controllers

#### **1. signUpController**
- Inserts a new user record into the database.
- Generates a JWT token upon successful registration.

#### **2. signInController**
- Validates user credentials.
- Generates a JWT token upon successful authentication.

#### **3. verifyUserController**
- Decodes and validates the provided JWT token.
- Confirms user identity.

#### **4. getUsersController**
- Fetches a list of users from the database (admin-only route).

---

## Getting Started

### Prerequisites
- Node.js
- MySQL or compatible database

### Environment Variables
- `FLEXIBASE_AUTH_SECRET_KEY`: Secret key for signing JWT tokens.
- `DB_HOST`, `DB_EXPOSE_PORT`, `DB_NAME`: Database connection details.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ModularMinds/flexibase-auth.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file.
4. Start the server:
   ```bash
   npm start
   ```

---

## Testing
Use tools like Postman or curl to interact with the API endpoints.

---

## Contributing
Contributions are welcome! Please create a pull request with your changes.

---

## License
This project is licensed under the MIT License.

