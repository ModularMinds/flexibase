import { Router } from "express";
import { signUpController } from "../controllers/auth/signUp.controller";
import { signInController } from "../controllers/auth/signIn.controller";
import { verifyUserController } from "../controllers/auth/verifyUser.controller";
import { refreshTokenController } from "../controllers/auth/refreshToken.controller";
import { tokenVerifier } from "../middlewares/tokenVerifier.middleware";
import { validateResource } from "../middlewares/validateResource.middleware";
import {
  signUpSchema,
  signInSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication Management
 */

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       500:
 *         description: Server error
 */
authRouter
  .route("/sign-up")
  .post(validateResource(signUpSchema), signUpController);

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: detailed documentation for sign-in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
authRouter
  .route("/sign-in")
  .post(validateResource(signInSchema), signInController);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 */
authRouter
  .route("/refresh-token")
  .post(validateResource(refreshTokenSchema), refreshTokenController);

/**
 * @swagger
 * /auth/verify-user:
 *   get:
 *     summary: Verify access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 isSuccess:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
authRouter.route("/verify-user").get(tokenVerifier, verifyUserController);

export { authRouter };
