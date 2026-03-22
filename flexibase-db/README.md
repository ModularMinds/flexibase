# Flexibase Database Service

The **Database Service** provides a dynamic, API-driven interface for managing SQL tables and data. It abstracts the complexity of raw SQL, offering a secure and flexible way to handle schema changes and data operations.

## Core Features

- **Dynamic Schema Management**: Create, alter, and delete tables via API without manual migrations.
- **Advanced CRUD**: Flexible create, read, update, and delete operations with filtering, sorting, and pagination.
- **Audit Logging**: Comprehensive tracking of all data modifications (`_flexibase_audit_logs`).
- **Webhooks**: Event-driven architecture allowing external systems to react to database changes.
- **Bulk Operations**: Import and export data in CSV/JSON formats.
- **Transactions**: Atomic batch operations to ensure data integrity.
- **Caching**: Redis-backed caching for high-performance read operations.

## API Documentation

Interactive API documentation via Swagger is available at:
`http://localhost:5001/api-docs`

## Key Endpoints

### Schema Management (Admin)

- `POST /db/admin/create-table`: Define a new table structure.
- `PATCH /db/admin/alter-table`: Add or drop columns.
- `DELETE /db/admin/delete-table`: Remove a table.

### Data Operations

- `POST /db/:tableName`: Insert a new record.
- `GET /db/:tableName`: Fetch records with filters (`?where`, `?orderBy`).
- `PATCH /db/:tableName/:id`: Update a specific record.
- `DELETE /db/:tableName/:id`: Delete a record.

### Advanced Features

- `GET /db/admin/audit-logs`: Retrieve system activity logs.
- `POST /db/admin/webhooks`: Register a new webhook listener.
- `POST /db/transaction`: Execute multiple operations in a single transaction.

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## Environment Variables

Ensure the following variables are set in your `.env` file:

```env
PORT=5001
DATABASE_URL="postgresql://..."
AUTH_SERVICE_URL="http://flexibase-auth:5000"
REDIS_URL="redis://..."
NODE_ENV="development"
```
