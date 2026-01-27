import { Request, Response } from "express";
import path from "path";

export const addObjectController = (req: Request, res: Response) => {
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
    filePath: path.join(bucketName, req.file?.originalname!),
  });
};
