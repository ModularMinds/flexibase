import { Request, Response } from "express";
import { bucketBasePath } from "../config";
import path from "path";
import fs from "fs";

export const deleteBucketController = (req: Request, res: Response) => {
  const bucketName = req.body.bucketName;

  if (!bucketName) {
    res.status(400).json({ message: "Bucket name is required" });
    return;
  }

  const bucketPath = path.join(bucketBasePath, bucketName);

  // Check if the bucket exists
  if (!fs.existsSync(bucketPath)) {
    res.status(404).json({ message: "Bucket not found" });
    return;
  }

  // Recursively delete the bucket directory
  fs.rm(bucketPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("Error deleting bucket:", err);
      return res.status(500).json({ message: "Failed to delete bucket" });
    }

    res.status(200).json({ message: "Bucket deleted successfully" });
  });
};
