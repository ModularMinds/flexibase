# Flexibase Storage Service

The **Storage Service** provides a scalable and secure object storage solution compatible with the S3 API. Powered by **MinIO**, it handles file uploads, retrieval, and advanced processing tasks like on-the-fly image optimization.

## Core Features

- **S3 Compatibility**: Built on top of MinIO, ensuring compatibility with standard S3 tools and libraries.
- **Pre-signed URLs**: Securely upload and download files directly to/from storage without routing heavy traffic through the API.
- **Image Optimization**: Automatic resizing and format conversion using `sharp`.
- **Storage Quotas**: Enforce usage limits per user or bucket to manage resource consumption.
- **Access Policies**: Granular control over file visibility (Public/Private) and access rights.
- **Multipart Uploads**: Efficient handling of large files.
- **Variant Management**: Automatically manages optimized versions of images (thumbnails, webp).

## API Documentation

Interactive API documentation via Swagger is available at:
`http://localhost:5002/api-docs`

## Key Endpoints

### File Operations

- `POST /storage/upload`: Standard multipart file upload.
- `POST /storage/upload-url`: Generate a pre-signed URL for direct client-side uploads.
- `GET /storage/files`: List files in a bucket with pagination.
- `GET /storage/files/:id`: Get file metadata.
- `DELETE /storage/files/:id`: Delete a file and its variants.

### Retrieval

- `GET /storage/files/:id/content`: Download file content (proxied).
- `GET /storage/files/:id/url`: Generate a pre-signed download URL (recommended).
- `GET /storage/files/:id/content?w=200&h=200`: Fetch an optimized/resized image variant.

## Tech Stack

- **Framework**: Express.js
- **Storage Engine**: MinIO (S3 Compatible)
- **Database**: PostgreSQL (Prisma ORM - Metadata)
- **Processing**: Sharp (Image Optimization)
- **Validation**: Zod
- **SDK**: AWS SDK v3

## Environment Variables

Ensure the following variables are set in your `.env` file:

```env
PORT=5002
DATABASE_URL="postgresql://..."
AUTH_SERVICE_URL="http://flexibase-auth:5000"
S3_ENDPOINT="http://minio:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="flexibase-storage"
NODE_ENV="development"
```
