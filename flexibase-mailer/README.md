# Flexibase Mailer Service

The **Mailer Service** is a comprehensive email delivery and management system designed for high reliability and flexibility. It supports dynamic provider selection, advanced templating, and detailed tracking of email engagement.

## Core Features

- **Multi-Provider Support**: Seamlessly switch between SMTP, AWS SES, SendGrid, or other providers for failover and optimization.
- **Template Engine**: Dynamic HTML email generation using **Handlebars** with support for CSS inlining.
- **Background Processing**: Asynchronous email dispatch using **BullMQ** (Redis) to ensure high throughput and non-blocking API responses.
- **Engagement Tracking**: Built-in support for tracking email **opens** (pixel) and **clicks** (redirects).
- **Attachments**: Secure handling of file attachments via Multer.
- **Rate Limiting**: Protects your reputation by throttling sending rates per user or IP.
- **Webhooks**: Notify external systems about email events (sent, failed, opened, clicked).

## API Documentation

Interactive API documentation via Swagger is available at:
`http://localhost:5003/api-docs`

## Key Endpoints

### Sending

- `POST /mailer/send`: Send a single email (supports templates and attachments).
- `POST /mailer/send-batch`: Send customized emails to multiple recipients (Queue-optimized).

### Templates

- `GET /mailer/templates`: List available email templates.
- `GET /mailer/tools/preview/:templateId`: Render a template with sample data for verification.

### Analytics

- `GET /mailer/logs`: Retrieve email dispatch logs.
- `GET /mailer/track/:id/pixel.gif`: Open tracking endpoint (invisible).
- `GET /mailer/track/:id/click`: Click tracking endpoint (redirects to target).

## Tech Stack

- **Framework**: Express.js
- **Queue**: BullMQ (Redis)
- **Database**: PostgreSQL (Prisma ORM)
- **Templating**: Handlebars
- **Transport**: Nodemailer
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## Environment Variables

Ensure the following variables are set in your `.env` file:

```env
PORT=5003
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
AUTH_SERVICE_URL="http://flexibase-auth:5000"
MAIL_PROVIDER="smtp" # or 'ses', 'sendgrid'
SMTP_HOST="smtp.example.com"
SMTP_USER="..."
SMTP_PASS="..."
NODE_ENV="development"
```
