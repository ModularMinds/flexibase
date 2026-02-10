"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBucketController = void 0;
const config_1 = require("../config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deleteBucketController = (req, res) => {
    const bucketName = req.body.bucketName;
    if (!bucketName) {
        res.status(400).json({ message: "Bucket name is required" });
        return;
    }
    const bucketPath = path_1.default.join(config_1.bucketBasePath, bucketName);
    // Check if the bucket exists
    if (!fs_1.default.existsSync(bucketPath)) {
        res.status(404).json({ message: "Bucket not found" });
        return;
    }
    // Recursively delete the bucket directory
    fs_1.default.rm(bucketPath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error("Error deleting bucket:", err);
            return res.status(500).json({ message: "Failed to delete bucket" });
        }
        res.status(200).json({ message: "Bucket deleted successfully" });
    });
};
exports.deleteBucketController = deleteBucketController;
