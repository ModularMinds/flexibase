import { Request, Response } from "express";

import path from "path";

import fs from "fs";
import { bucketBasePath } from "../config";

export const createBuckerController = (req: Request, res: Response) => {
  const { bucketName } = req.body;

  if (!bucketName) res.status(400).json({ message: "Bucket name is required" });

  const bucketPath = path.join(bucketBasePath, bucketName);

  // Check if bucket already exists
  if (fs.existsSync(bucketPath))
    res.status(400).json({ message: "Bucket already exists" });

  // Create the bucket folder
  fs.mkdir(bucketPath, { recursive: true }, (err) => {
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
