"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuckerController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const createBuckerController = (req, res) => {
    const { bucketName } = req.body;
    if (!bucketName)
        res.status(400).json({ message: "Bucket name is required" });
    const bucketPath = path_1.default.join(config_1.bucketBasePath, bucketName);
    // Check if bucket already exists
    if (fs_1.default.existsSync(bucketPath))
        res.status(400).json({ message: "Bucket already exists" });
    // Create the bucket folder
    fs_1.default.mkdir(bucketPath, { recursive: true }, (err) => {
        if (err) {
            console.error("Error creating bucket folder:", err);
            return res
                .status(500)
                .json({ message: "Error creating bucket folder", error: err.message });
        }
        res
            .status(201)
            .json({ message: "Bucket created successfully", bucketName });
    });
};
exports.createBuckerController = createBuckerController;
