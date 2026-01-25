import { Router } from "express";
import {
  deleteUserController,
  updateUserRoleController,
  updateUserStatusController,
} from "../controllers/admin/adminUser.controller";
import { getUsersController } from "../controllers/admin/getUsers.controller";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.middleware";
import { tokenVerifier } from "../middlewares/tokenVerifier.middleware";
import { validateResource } from "../middlewares/validateResource.middleware";
import { updateRoleSchema, updateStatusSchema } from "../schemas/auth.schema";

const adminRouter = Router();

// Apply auth middlewares to all admin routes
adminRouter.use(tokenVerifier, adminAuthenticator);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Management
 */

/**
 * @swagger
 * /auth/admin/get-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
adminRouter.get("/get-users", getUsersController);

/**
 * @swagger
 * /auth/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Forbidden
 */
adminRouter.delete("/users/:id", deleteUserController);

/**
 * @swagger
 * /auth/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         description: Forbidden
 */
adminRouter.patch(
  "/users/:id/role",
  validateResource(updateRoleSchema),
  updateUserRoleController,
);

/**
 * @swagger
 * /auth/admin/users/{id}/status:
 *   patch:
 *     summary: Suspend or Activate user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Forbidden
 */
adminRouter.patch(
  "/users/:id/status",
  validateResource(updateStatusSchema),
  updateUserStatusController,
);

export { adminRouter };
