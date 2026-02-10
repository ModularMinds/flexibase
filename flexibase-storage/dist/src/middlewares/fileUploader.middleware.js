"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
// Multer configuration for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const { bucketName } = req.body;
        const bucketPath = path_1.default.join(config_1.bucketBasePath, bucketName);
        // Ensure the bucket exists
        if (!fs_1.default.existsSync(bucketPath))
            return cb(new Error("Bucket does not exist"), "");
        cb(null, bucketPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save file with its original name
    },
});
exports.fileUploader = (0, multer_1.default)({ storage }).single("file");
