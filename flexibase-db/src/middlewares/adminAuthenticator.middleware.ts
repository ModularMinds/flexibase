import { NextFunction, Request, Response } from "express";

export const adminAuthenticator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res
        .status(401)
        .json({ isSuccess: false, message: "Authorization header required" });
      return;
    }

    const [username, password] = Buffer.from(
      authHeader.split(" ")[1] || "",
      "base64",
    )
      .toString("ascii")
      .split(":");

    if (
      username !== process.env.FLEXIBASE_ADMIN_USER ||
      password !== process.env.FLEXIBASE_ADMIN_PASSWORD
    ) {
      res
        .status(401)
        .json({ isSuccess: false, message: "invalid admin creds" });
      return;
    }

    next();
  } catch (err) {
    res
      .status(401)
      .json({ isSuccess: false, message: "Invalid credentials format" });
  }
};
