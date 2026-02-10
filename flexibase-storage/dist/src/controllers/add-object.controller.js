"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addObjectController = void 0;
const path_1 = __importDefault(require("path"));
const addObjectController = (req, res) => {
    const { bucketName } = req.body;
    if (!bucketName) {
        res.status(400).json({ message: "Bucket name is required" });
        return;
    }
    if (!req.file) {
        res.status(400).json({ message: "File is required" });
        return;
    }
    res.status(201).json({
        message: "Object added successfully",
        bucketName,
        fileName: req.file?.originalname,
        filePath: path_1.default.join(bucketName, req.file?.originalname),
    });
};
exports.addObjectController = addObjectController;
