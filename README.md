# Flexibase

**Flexibase** is a modular, high-performance Backend as a Service (BaaS) solution that integrates **authentication**, **database**, **storage**, and **email** services into a single, deployable system. Designed to streamline backend development, Flexibase allows developers to focus on building applications while handling the heavy lifting of infrastructure.

## Core Features

- **Authentication Service**: Secure JWT-based auth with Role-Based Access Control (RBAC), user profile management, and admin capabilities.
- **Database Service**: Dynamic SQL table management, audit logging, webhooks, and advanced querying capabilities powered by **PostgreSQL**.
- **Storage Service**: S3-compatible file storage using **MinIO**, featuring pre-signed URLs, image optimization, and storage quotas.
- **Mailer Service**: Robust email delivery with template support (Handlebars), open/click tracking, and multi-provider failover (SES/SendGrid) backed by **Redis** queues.
- **Dashboard**: A comprehensive Next.js admin dashboard to manage all services visually.

## Architecture

Flexibase is built as a set of microservices orchestrated via Docker Compose:

| Service            | Port        | Description                               |
| :----------------- | :---------- | :---------------------------------------- |
| **Authentication** | `5000`      | User identity and access management.      |
| **Database**       | `5001`      | Dynamic table CRUD and schema management. |
| **Storage**        | `5002`      | File uploads, downloads, and processing.  |
| **Mailer**         | `5003`      | Email sending, templates, and analytics.  |
| **Dashboard**      | `3000`      | Unified UI for administration.            |
| **PostgreSQL**     | `5432`      | Primary relational database.              |
| **Redis**          | `6379`      | Caching and task queues.                  |
| **MinIO**          | `9000/9001` | S3-compatible object storage.             |

## Quick Start

### Prerequisites

- Docker and Docker Compose installed.
- Git installed.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ModularMinds/flexibase.git
   cd flexibase
   ```

2. **Configure Environment Variables:**
   Flexibase comes with pre-configured `.env` files for development. Review them in each service directory if customization is needed.

3. **Build and Start Services:**

   ```bash
   docker-compose up --build
   ```

   _This command spins up all microservices, databases (Postgres, Redis), and the Storage engine (MinIO)._

4. **Access the Dashboard:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   - **Default Admin Credentials**: (See `flexibase-auth` logs or database seeds if applicable, typically configured during first run).

## Documentation

Detailed documentation for each service is available in their respective directories:

- [Authentication Service](./flexibase-auth/README.md)
- [Database Service](./flexibase-db/README.md)
- [Storage Service](./flexibase-storage/README.md)
- [Mailer Service](./flexibase-mailer/README.md)
- [Dashboard](./flexibase-dashboard/README.md)

## Technologies Used

- **Runtime**: Node.js, TypeScript
- **Frameworks**: Express.js, Next.js (Dashboard)
- **Databases**: PostgreSQL (via Prisma ORM), Redis
- **Storage**: MinIO (S3 Compatible)
- **Queues**: BullMQ
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## License

This project is licensed under the [MIT License](LICENSE).

---

**Built with ❤️ by the Flexibase Team.**
