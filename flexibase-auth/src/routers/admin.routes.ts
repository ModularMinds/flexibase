import { Router } from "express";
import { getUsersController } from "../controllers";
import { adminAuthenticator, tokenVerifier } from "../middlewares";

export const adminRouter = Router();

adminRouter
  .route("/get-users")
  .get(tokenVerifier, adminAuthenticator, getUsersController);
