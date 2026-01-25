# Database Module Documentation

The Database module in **Flexibase** provides a seamless interface to perform database operations such as creating and deleting tables, inserting and fetching data, and administrative tasks. This module supports SQL-based databases and is designed for flexibility and efficiency.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete data with ease.
- **Dynamic Table Management**: Create and delete tables programmatically.
- **Parameterized Queries**: Secure query execution with parameterized inputs to prevent SQL injection.
- **Admin Routes**: Special routes for database schema management.

---

## API Endpoints

### Public Routes

#### Insert Data

- **Endpoint**: `/db/insert-data`
- **Method**: `POST`
- **Description**: Inserts data into the specified table.
- **Request Body**:
  ```json
  {
    "tableName": "<table-name>",
    "data": {
      "column1": "value1",
      "column2": "value2",
      "...": "..."
    }
  }
  ```
- **Response**:
  ```json
  {
    "isSuccess": true,
    "message": "Data inserted into table '<table-name>' successfully."
  }
  ```

#### Fetch Data

- **Endpoint**: `/db/fetch-data`
- **Method**: `GET`
- **Description**: Fetches data from the specified table with optional conditions.
- **Request Body**:
  ```json
  {
    "tableName": "<table-name>",
    "conditions": {
      "column1": "value1",
      "column2": "value2"
    }
  }
  ```
- **Response**:
  ```json
  {
    "isSuccess": true,
    "data": [
      {
        "column1": "value1",
        "column2": "value2",
        "...": "..."
      }
    ]
  }
  ```

### Admin Routes

#### Create Table

- **Endpoint**: `/db/admin/create-table`
- **Method**: `POST`
- **Description**: Creates a new table with specified columns and constraints.
- **Request Body**:
  ```json
  {
    "tableName": "<table-name>",
    "tableColumns": [
      { "name": "<column-name>", "type": "<column-type>", "constraints": "<optional-constraints>" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "isSuccess": true,
    "message": "Table '<table-name>' created successfully."
  }
  ```

#### Delete Table

- **Endpoint**: `/db/admin/delete-table`
- **Method**: `DELETE`
- **Description**: Deletes a table from the database.
- **Request Body**:
  ```json
  {
    "tableName": "<table-name>"
  }
  ```
- **Response**:
  ```json
  {
    "isSuccess": true,
    "message": "Table '<table-name>' deleted successfully."
  }
  ```

---

## Middleware

### `adminAuthenticator`
- Ensures only authorized admins can access certain routes.

---

## Implementation Details

### Folder Structure
```
├── routes
│   ├── crud.routes.ts    # Public database routes
│   ├── admin.routes.ts   # Admin-specific routes for schema management
├── controllers
│   ├── createTableController.ts
│   ├── deleteTableController.ts
│   ├── fetchDataController.ts
│   ├── insertDataController.ts
├── config
│   ├── db.ts             # Database connection configuration
```

### Dependencies

- `express`: For route handling.
- `mysql2` or compatible database client: For database connection and query execution.
- `dotenv`: For environment variable management.

---

## Example Usage

### Insert Data
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "users",
    "data": {
      "id": "1",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }' \
  http://localhost:3000/db/insert-data
```

### Fetch Data
```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "users",
    "conditions": {
      "email": "john.doe@example.com"
    }
  }' \
  http://localhost:3000/db/fetch-data
```

### Create Table
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "users",
    "tableColumns": [
      { "name": "id", "type": "VARCHAR(36)", "constraints": "PRIMARY KEY" },
      { "name": "name", "type": "VARCHAR(255)" },
      { "name": "email", "type": "VARCHAR(255)", "constraints": "UNIQUE" }
    ]
  }' \
  http://localhost:3000/db/admin/create-table
```

---

## Environment Variables

Ensure the following environment variables are set:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=flexibase
```

---

## License

This module is part of the **Flexibase** project and is licensed under [MIT](LICENSE).
