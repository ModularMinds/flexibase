import { Request, Response } from "express";
import { trackingService } from "../services/tracking.service";
import path from "path";

// 1x1 transparent GIF
const PIXEL_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export const trackOpenController = async (req: Request, res: Response) => {
  const { logId } = req.params;

  // Record the open event in the background
  trackingService.recordOpen(logId, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
    timestamp: new Date().toISOString(),
  });

  // Return the pixel immediately
  res.set({
    "Content-Type": "image/gif",
    "Content-Length": PIXEL_BUFFER.length,
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  res.send(PIXEL_BUFFER);
};

export const trackClickController = async (req: Request, res: Response) => {
  const { logId } = req.params;
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).send("Target URL missing");
  }

  try {
    const targetUrl = Buffer.from(url, "base64").toString("utf-8");

    // Record click in background
    trackingService.recordClick(logId, targetUrl, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Redirect to target
    res.redirect(targetUrl);
  } catch (e) {
    res.status(400).send("Invalid target URL");
  }
};
