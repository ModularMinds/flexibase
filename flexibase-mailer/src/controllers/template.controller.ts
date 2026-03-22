import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import { logger } from "../config/logger";

const templatesPath = path.join(__dirname, "../templates");

export const listTemplatesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = await fs.readdir(templatesPath);

    // Filter for .hbs files and map to metadata
    const templates = files
      .filter((file) => file.endsWith(".hbs") && !file.includes(".json")) // Exclude sidecar files if any
      .map((file) => {
        const name = file.replace(".hbs", "");
        return {
          id: name,
          name: name,
          type: "handlebars",
        };
      });

    res.status(200).json({
      isSuccess: true,
      data: {
        templates,
      },
    });
  } catch (err: any) {
    logger.error("Failed to list templates", err);
    next(err);
  }
};
