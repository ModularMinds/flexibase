import multer from "multer";
import path from "path";
import { env } from "../config/env";
import fs from "fs";

const uploadDir = path.join(process.cwd(), env.STORAGE_BUCKET);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // We could determine bucket from req.body, but req.body might not be populated before file
    // depending on field order. Multer processes fields in order.
    // If we want dynamic buckets, we might need to handle it in controller or ensure bucket field comes first.
    // For now, save to root upload dir, service moves it.
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
