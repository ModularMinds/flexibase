import { Router } from "express";

import { createBuckerController, deleteBucketController } from "../controllers";

export const adminRouter = Router();

adminRouter.route("/create-bucket").post(createBuckerController);
adminRouter.route("/delete-bucket").delete(deleteBucketController);
