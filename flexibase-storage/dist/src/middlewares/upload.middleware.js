"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(process.cwd(), env_1.env.STORAGE_BUCKET);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Storage configuration
const storage = multer_1.default.diskStorage({
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
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});
