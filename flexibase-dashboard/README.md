# Flexibase Dashboard

The **Flexibase Dashboard** is the centralized administrative interface for the Flexibase ecosystem. Built with **Next.js** and **Shadcn UI**, it provides a modern, responsive, and intuitive way to manage all backend services.

## Core Features

### 1. Authentication Management

- **User Administration**: View all users, manage roles (Promote/Demote), suspend accounts, and delete users.
- **Profile**: Manage your own admin profile and change passwords securely.

### 2. Database Management

- **Schema Designer**: Create and delete tables visually.
- **Structure Manager**: Add and drop columns (`ALTER TABLE`) directly from the UI.
- **Data Explorer**: View, filter, and edit table data.
- **Audit Logs**: Track every data change with detailed logs (Who, What, When).
- **Webhooks**: Configure global webhooks to trigger external APIs on database events.

### 3. Storage Explorer

- **File Browser**: visual interface for your MinIO/S3 buckets.
- **Operations**: Upload files (multipart), download via pre-signed URLs, and delete assets.
- **Metadata**: View file details (Size, Type, Created At).

### 4. Mailer Console

- **Template Manager**: List and **preview** HTML email templates with sample data.
- **Test Sender**: Send test emails directly from the dashboard to verify configuration.
- **Logs**: Monitor email delivery status, open rates, and errors.

## Getting Started

### Prerequisites

- Node.js 18+
- Backend services running (Auth, DB, Storage, Mailer)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env` file (or use `.env.local`):

   ```env
   NEXT_PUBLIC_AUTH_SERVICE_URL="http://localhost:5000"
   NEXT_PUBLIC_DB_SERVICE_URL="http://localhost:5001"
   NEXT_PUBLIC_STORAGE_SERVICE_URL="http://localhost:5002"
   NEXT_PUBLIC_MAILER_SERVICE_URL="http://localhost:5003"
   ```

3. **Run the Development Server:**

   ```bash
   npm run dev
   ```

4. **Access:**
   Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn UI (Radix Primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Fetching**: Axios
