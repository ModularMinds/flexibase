import axios from "axios";

const adminAuthCreds = {
  username: process.env.NEXT_PUBLIC_FLEXIBASE_ADMIN_USER!,
  password: process.env.NEXT_PUBLIC_FLEXIBASE_ADMIN_PASSWORD!,
};

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000/api",
  auth: adminAuthCreds,
});

export const dbApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DB_URL || "http://localhost:3001/api/db",
  auth: adminAuthCreds,
});

export const storageApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:3002/api/storage",
  auth: adminAuthCreds,
});

export const mailerApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_MAILER_URL || "http://localhost:3003/api/mailer",
  auth: adminAuthCreds,
});
