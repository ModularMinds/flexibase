"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.route("/create-bucket").post(controllers_1.createBuckerController);
exports.adminRouter.route("/delete-bucket").delete(controllers_1.deleteBucketController);
